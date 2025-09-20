const express = require('express');
const { body, validationResult } = require('express-validator');
const pesapalService = require('../services/pesapalService');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const winston = require('winston');

const router = express.Router();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/pesapal-routes.log' }),
    new winston.transports.Console()
  ]
});

/**
 * GET /pesapal/token
 * Get OAuth access token from Pesapal
 */
router.get('/token', async (req, res) => {
  try {
    const token = await pesapalService.getAccessToken();
    res.json({
      success: true,
      token,
      expires_in: 3600 // 1 hour
    });
  } catch (error) {
    logger.error('Failed to get Pesapal token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get access token',
      message: error.message
    });
  }
});

/**
 * POST /pesapal/pay
 * Initiate payment (STK Push)
 */
router.post('/pay', [
  body('loan_id').isUUID().withMessage('Valid loan ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required'),
  body('phone_number').isMobilePhone('en-KE').withMessage('Valid Kenyan phone number is required'),
  body('payment_method').isIn(['mpesa', 'airtel_money', 'equitel']).withMessage('Valid payment method is required'),
  body('user_id').isUUID().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { loan_id, amount, phone_number, payment_method, user_id, description } = req.body;

    // Check if loan exists and belongs to user
    const loan = await Loan.findOne({
      where: { id: loan_id, user_id }
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found or access denied'
      });
    }

    // Check if loan is in a payable state
    if (!['approved', 'disbursed', 'overdue'].includes(loan.status)) {
      return res.status(400).json({
        success: false,
        error: 'Loan is not in a payable state'
      });
    }

    // Check if amount doesn't exceed outstanding balance
    if (amount > loan.outstanding_balance) {
      return res.status(400).json({
        success: false,
        error: 'Payment amount exceeds outstanding balance'
      });
    }

    // Generate merchant reference
    const merchantReference = pesapalService.generateMerchantReference('REPAY');

    // Create payment record
    const payment = await Payment.create({
      loan_id,
      user_id,
      pesapal_merchant_reference: merchantReference,
      amount,
      currency: 'KES',
      payment_method,
      phone_number,
      status: 'pending',
      expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    // Prepare order data for Pesapal
    const orderData = {
      merchantReference,
      amount,
      currency: 'KES',
      description: description || `Loan repayment for loan ${loan_id.slice(-8)}`,
      phoneNumber: phone_number,
      email: req.user?.email || 'user@example.com',
      firstName: req.user?.first_name || 'User',
      lastName: req.user?.last_name || 'Name',
      address: req.user?.address || 'Nairobi, Kenya',
      city: 'Nairobi',
      state: 'Nairobi',
      notificationId: merchantReference
    };

    // Submit payment order to Pesapal
    const pesapalResponse = await pesapalService.submitPaymentOrder(orderData);

    // Update payment record with Pesapal order tracking ID
    await payment.update({
      pesapal_order_tracking_id: pesapalResponse.order_tracking_id,
      pesapal_status: pesapalResponse.status
    });

    logger.info('Payment initiated successfully:', {
      payment_id: payment.id,
      loan_id,
      amount,
      pesapal_order_tracking_id: pesapalResponse.order_tracking_id
    });

    res.json({
      success: true,
      payment_id: payment.id,
      order_tracking_id: pesapalResponse.order_tracking_id,
      merchant_reference: merchantReference,
      redirect_url: pesapalResponse.redirect_url,
      message: 'Payment initiated successfully. Please complete payment on your mobile device.'
    });

  } catch (error) {
    logger.error('Failed to initiate payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment',
      message: error.message
    });
  }
});

/**
 * GET /pesapal/callback
 * Handle payment callback from Pesapal
 */
router.get('/callback', async (req, res) => {
  try {
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.query;

    logger.info('Received Pesapal callback:', {
      OrderTrackingId,
      OrderMerchantReference,
      OrderNotificationType
    });

    if (!OrderTrackingId || !OrderMerchantReference) {
      return res.status(400).json({
        success: false,
        error: 'Missing required callback parameters'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({
      where: { pesapal_merchant_reference: OrderMerchantReference },
      include: [{ model: Loan, as: 'loan' }]
    });

    if (!payment) {
      logger.error('Payment not found for merchant reference:', OrderMerchantReference);
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Get payment status from Pesapal
    const statusResponse = await pesapalService.getPaymentStatus(OrderTrackingId);

    // Update payment record
    await payment.update({
      pesapal_status: statusResponse.payment_status_description,
      callback_data: statusResponse,
      status: statusResponse.payment_status_description === 'COMPLETED' ? 'completed' : 
              statusResponse.payment_status_description === 'FAILED' ? 'failed' : 'pending'
    });

    // If payment is completed, update loan
    if (statusResponse.payment_status_description === 'COMPLETED') {
      const loan = await Loan.findByPk(payment.loan_id);
      
      if (loan) {
        const newAmountPaid = parseFloat(loan.amount_paid) + parseFloat(payment.amount);
        const newOutstandingBalance = parseFloat(loan.outstanding_balance) - parseFloat(payment.amount);
        
        await loan.update({
          amount_paid: newAmountPaid,
          outstanding_balance: Math.max(0, newOutstandingBalance),
          status: newOutstandingBalance <= 0 ? 'repaid' : loan.status,
          repaid_at: newOutstandingBalance <= 0 ? new Date() : loan.repaid_at
        });

        // Update payment record
        await payment.update({
          status: 'completed',
          paid_at: new Date(),
          payment_reference: statusResponse.payment_account || OrderTrackingId
        });

        logger.info('Payment completed successfully:', {
          payment_id: payment.id,
          loan_id: loan.id,
          amount: payment.amount,
          new_outstanding_balance: newOutstandingBalance
        });
      }
    }

    // Redirect to frontend with status
    const redirectUrl = `${process.env.FRONTEND_URL}/payment/status?status=${payment.status}&payment_id=${payment.id}`;
    res.redirect(redirectUrl);

  } catch (error) {
    logger.error('Error processing Pesapal callback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process callback',
      message: error.message
    });
  }
});

/**
 * POST /pesapal/ipn
 * Handle Instant Payment Notification from Pesapal
 */
router.post('/ipn', async (req, res) => {
  try {
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.body;

    logger.info('Received Pesapal IPN:', {
      OrderTrackingId,
      OrderMerchantReference,
      OrderNotificationType
    });

    // Find payment record
    const payment = await Payment.findOne({
      where: { pesapal_merchant_reference: OrderMerchantReference }
    });

    if (!payment) {
      logger.error('Payment not found for IPN:', OrderMerchantReference);
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Get updated payment status from Pesapal
    const statusResponse = await pesapalService.getPaymentStatus(OrderTrackingId);

    // Update payment record
    await payment.update({
      pesapal_status: statusResponse.payment_status_description,
      callback_data: statusResponse
    });

    // Process payment completion if needed
    if (statusResponse.payment_status_description === 'COMPLETED' && payment.status !== 'completed') {
      const loan = await Loan.findByPk(payment.loan_id);
      
      if (loan) {
        const newAmountPaid = parseFloat(loan.amount_paid) + parseFloat(payment.amount);
        const newOutstandingBalance = parseFloat(loan.outstanding_balance) - parseFloat(payment.amount);
        
        await loan.update({
          amount_paid: newAmountPaid,
          outstanding_balance: Math.max(0, newOutstandingBalance),
          status: newOutstandingBalance <= 0 ? 'repaid' : loan.status,
          repaid_at: newOutstandingBalance <= 0 ? new Date() : loan.repaid_at
        });

        await payment.update({
          status: 'completed',
          paid_at: new Date(),
          payment_reference: statusResponse.payment_account || OrderTrackingId
        });
      }
    }

    res.json({
      success: true,
      message: 'IPN processed successfully'
    });

  } catch (error) {
    logger.error('Error processing Pesapal IPN:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process IPN',
      message: error.message
    });
  }
});

/**
 * GET /pesapal/status/:paymentId
 * Get payment status
 */
router.get('/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({
      where: { id: paymentId },
      include: [{ model: Loan, as: 'loan' }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // If payment is still pending, check with Pesapal
    if (payment.status === 'pending' && payment.pesapal_order_tracking_id) {
      try {
        const statusResponse = await pesapalService.getPaymentStatus(payment.pesapal_order_tracking_id);
        
        await payment.update({
          pesapal_status: statusResponse.payment_status_description,
          callback_data: statusResponse
        });

        // Update status based on Pesapal response
        if (statusResponse.payment_status_description === 'COMPLETED') {
          await payment.update({ status: 'completed', paid_at: new Date() });
        } else if (statusResponse.payment_status_description === 'FAILED') {
          await payment.update({ status: 'failed' });
        }
      } catch (error) {
        logger.error('Error checking payment status with Pesapal:', error);
      }
    }

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        pesapal_status: payment.pesapal_status,
        payment_method: payment.payment_method,
        phone_number: payment.phone_number,
        created_at: payment.created_at,
        paid_at: payment.paid_at,
        expires_at: payment.expires_at
      }
    });

  } catch (error) {
    logger.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status',
      message: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const { body, query, validationResult } = require('express-validator');
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
    new winston.transports.File({ filename: 'logs/admin-routes.log' }),
    new winston.transports.Console()
  ]
});

/**
 * GET /admin/transactions
 * Get all transactions with filtering and pagination
 */
router.get('/transactions', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled', 'expired']).withMessage('Invalid status'),
  query('payment_method').optional().isIn(['mpesa', 'airtel_money', 'equitel', 'visa', 'mastercard']).withMessage('Invalid payment method'),
  query('date_from').optional().isISO8601().withMessage('Invalid date format'),
  query('date_to').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      payment_method,
      date_from,
      date_to,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (status) whereClause.status = status;
    if (payment_method) whereClause.payment_method = payment_method;
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    // Build search conditions
    const searchConditions = [];
    if (search) {
      searchConditions.push(
        { pesapal_merchant_reference: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
        { payment_reference: { [Op.like]: `%${search}%` } }
      );
    }

    const whereCondition = searchConditions.length > 0 
      ? { [Op.and]: [whereClause, { [Op.or]: searchConditions }] }
      : whereClause;

    // Get transactions with pagination
    const { count, rows: transactions } = await Payment.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Loan,
          as: 'loan',
          attributes: ['id', 'amount_requested', 'loan_purpose', 'status']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate summary statistics
    const stats = await Payment.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      where: whereCondition,
      group: ['status'],
      raw: true
    });

    const summary = {
      total_transactions: count,
      total_amount: 0,
      by_status: {}
    };

    stats.forEach(stat => {
      summary.by_status[stat.status] = {
        count: parseInt(stat.count),
        total_amount: parseFloat(stat.total_amount) || 0
      };
      summary.total_amount += parseFloat(stat.total_amount) || 0;
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        },
        summary
      }
    });

  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  }
});

/**
 * GET /admin/transactions/:id
 * Get specific transaction details
 */
router.get('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Payment.findOne({
      where: { id },
      include: [
        {
          model: Loan,
          as: 'loan',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'email', 'phone_number']
            }
          ]
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
      message: error.message
    });
  }
});

/**
 * POST /admin/transactions/:id/retry
 * Retry failed transaction
 */
router.post('/transactions/:id/retry', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Payment.findOne({
      where: { id },
      include: [{ model: Loan, as: 'loan' }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.status !== 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Only failed transactions can be retried'
      });
    }

    // Check if loan is still in a payable state
    if (!['approved', 'disbursed', 'overdue'].includes(transaction.loan.status)) {
      return res.status(400).json({
        success: false,
        error: 'Loan is not in a payable state'
      });
    }

    // Create new payment record for retry
    const newMerchantReference = pesapalService.generateMerchantReference('RETRY');
    
    const newPayment = await Payment.create({
      loan_id: transaction.loan_id,
      user_id: transaction.user_id,
      pesapal_merchant_reference: newMerchantReference,
      amount: transaction.amount,
      currency: transaction.currency,
      payment_method: transaction.payment_method,
      phone_number: transaction.phone_number,
      status: 'pending',
      expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    // Submit new payment order to Pesapal
    const orderData = {
      merchantReference: newMerchantReference,
      amount: transaction.amount,
      currency: transaction.currency,
      description: `Retry payment for loan ${transaction.loan_id.slice(-8)}`,
      phoneNumber: transaction.phone_number,
      email: 'user@example.com', // You might want to get this from user data
      firstName: 'User',
      lastName: 'Name',
      address: 'Nairobi, Kenya',
      city: 'Nairobi',
      state: 'Nairobi',
      notificationId: newMerchantReference
    };

    const pesapalResponse = await pesapalService.submitPaymentOrder(orderData);

    await newPayment.update({
      pesapal_order_tracking_id: pesapalResponse.order_tracking_id,
      pesapal_status: pesapalResponse.status
    });

    logger.info('Transaction retry initiated:', {
      original_payment_id: transaction.id,
      new_payment_id: newPayment.id,
      loan_id: transaction.loan_id,
      amount: transaction.amount
    });

    res.json({
      success: true,
      data: {
        original_payment_id: transaction.id,
        new_payment_id: newPayment.id,
        order_tracking_id: pesapalResponse.order_tracking_id,
        redirect_url: pesapalResponse.redirect_url,
        message: 'Payment retry initiated successfully'
      }
    });

  } catch (error) {
    logger.error('Error retrying transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retry transaction',
      message: error.message
    });
  }
});

/**
 * GET /admin/dashboard/stats
 * Get dashboard statistics
 */
router.get('/dashboard/stats', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    let dateFrom;
    switch (period) {
      case '7d':
        dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get payment statistics
    const paymentStats = await Payment.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      where: {
        created_at: {
          [Op.gte]: dateFrom
        }
      },
      group: ['status'],
      raw: true
    });

    // Get loan statistics
    const loanStats = await Loan.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount_requested')), 'total_amount']
      ],
      where: {
        created_at: {
          [Op.gte]: dateFrom
        }
      },
      group: ['status'],
      raw: true
    });

    // Get daily transaction volume
    const dailyVolume = await Payment.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      where: {
        created_at: {
          [Op.gte]: dateFrom
        },
        status: 'completed'
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    // Calculate totals
    const totalPayments = paymentStats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
    const totalPaymentAmount = paymentStats.reduce((sum, stat) => sum + parseFloat(stat.total_amount || 0), 0);
    const completedPayments = paymentStats.find(stat => stat.status === 'completed');
    const successRate = totalPayments > 0 ? (completedPayments ? parseInt(completedPayments.count) / totalPayments * 100 : 0) : 0;

    res.json({
      success: true,
      data: {
        period,
        payments: {
          total_count: totalPayments,
          total_amount: totalPaymentAmount,
          success_rate: Math.round(successRate * 100) / 100,
          by_status: paymentStats.reduce((acc, stat) => {
            acc[stat.status] = {
              count: parseInt(stat.count),
              amount: parseFloat(stat.total_amount || 0)
            };
            return acc;
          }, {})
        },
        loans: {
          by_status: loanStats.reduce((acc, stat) => {
            acc[stat.status] = {
              count: parseInt(stat.count),
              amount: parseFloat(stat.total_amount || 0)
            };
            return acc;
          }, {})
        },
        daily_volume: dailyVolume.map(day => ({
          date: day.date,
          count: parseInt(day.count),
          amount: parseFloat(day.total_amount || 0)
        }))
      }
    });

  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
});

/**
 * GET /admin/transactions/export
 * Export transactions to CSV
 */
router.get('/transactions/export', async (req, res) => {
  try {
    const { status, date_from, date_to } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    const transactions = await Payment.findAll({
      where: whereClause,
      include: [
        {
          model: Loan,
          as: 'loan',
          attributes: ['id', 'amount_requested', 'loan_purpose']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Convert to CSV format
    const csvHeader = 'ID,Loan ID,Amount,Currency,Status,Payment Method,Phone Number,Created At,Paid At,Merchant Reference,Order Tracking ID\n';
    const csvRows = transactions.map(tx => [
      tx.id,
      tx.loan_id,
      tx.amount,
      tx.currency,
      tx.status,
      tx.payment_method,
      tx.phone_number,
      tx.created_at,
      tx.paid_at,
      tx.pesapal_merchant_reference,
      tx.pesapal_order_tracking_id
    ].join(',')).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);

  } catch (error) {
    logger.error('Error exporting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export transactions',
      message: error.message
    });
  }
});

module.exports = router;

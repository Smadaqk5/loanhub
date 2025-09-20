const axios = require('axios');
const crypto = require('crypto');
const winston = require('winston');
require('dotenv').config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/pesapal.log' }),
    new winston.transports.Console()
  ]
});

class PesapalService {
  constructor() {
    this.consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    this.consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
    this.baseUrl = process.env.PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3/api';
    this.callbackUrl = process.env.PESAPAL_CALLBACK_URL;
    this.ipnUrl = process.env.PESAPAL_IPN_URL;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Generate OAuth signature for Pesapal API requests
   */
  generateSignature(method, url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
    const signature = crypto
      .createHmac('sha1', `${this.consumerSecret}&`)
      .update(signatureBase)
      .digest('base64');
    
    return signature;
  }

  /**
   * Get OAuth access token from Pesapal
   */
  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const url = `${this.baseUrl}/Auth/RequestToken`;
      const params = {
        oauth_consumer_key: this.consumerKey,
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_version: '1.0'
      };

      params.oauth_signature = this.generateSignature('POST', url, params);

      const response = await axios.post(url, null, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        params
      });

      if (response.data && response.data.token) {
        this.accessToken = response.data.token;
        // Set token expiry to 55 minutes (tokens expire in 1 hour)
        this.tokenExpiry = Date.now() + (55 * 60 * 1000);
        
        logger.info('Pesapal access token obtained successfully');
        return this.accessToken;
      } else {
        throw new Error('Invalid response from Pesapal token endpoint');
      }
    } catch (error) {
      logger.error('Failed to get Pesapal access token:', error.response?.data || error.message);
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  /**
   * Register IPN (Instant Payment Notification) URL
   */
  async registerIPN() {
    try {
      const token = await this.getAccessToken();
      const url = `${this.baseUrl}/URLSetup/RegisterIPN`;

      const response = await axios.post(url, {
        url: this.ipnUrl,
        ipn_notification_type: 'GET'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      logger.info('IPN URL registered successfully:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Failed to register IPN URL:', error.response?.data || error.message);
      throw new Error(`Failed to register IPN: ${error.message}`);
    }
  }

  /**
   * Submit payment order to Pesapal
   */
  async submitPaymentOrder(orderData) {
    try {
      const token = await this.getAccessToken();
      const url = `${this.baseUrl}/Transactions/SubmitOrderRequest`;

      const orderPayload = {
        id: orderData.merchantReference,
        currency: orderData.currency || 'KES',
        amount: orderData.amount,
        description: orderData.description,
        callback_url: this.callbackUrl,
        notification_id: orderData.notificationId,
        billing_address: {
          phone_number: orderData.phoneNumber,
          email_address: orderData.email,
          country_code: 'KE',
          first_name: orderData.firstName,
          middle_name: orderData.middleName || '',
          last_name: orderData.lastName,
          line_1: orderData.address || '',
          line_2: '',
          city: orderData.city || 'Nairobi',
          state: orderData.state || 'Nairobi',
          postal_code: orderData.postalCode || '',
          zip_code: orderData.zipCode || ''
        }
      };

      const response = await axios.post(url, orderPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      logger.info('Payment order submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Failed to submit payment order:', error.response?.data || error.message);
      throw new Error(`Failed to submit payment order: ${error.message}`);
    }
  }

  /**
   * Get payment status from Pesapal
   */
  async getPaymentStatus(orderTrackingId) {
    try {
      const token = await this.getAccessToken();
      const url = `${this.baseUrl}/Transactions/GetTransactionStatus`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        params: {
          orderTrackingId
        }
      });

      logger.info('Payment status retrieved:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Failed to get payment status:', error.response?.data || error.message);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * Verify callback signature
   */
  verifyCallbackSignature(params, signature) {
    try {
      const sortedParams = Object.keys(params)
        .filter(key => key !== 'pesapal_signature')
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      const expectedSignature = crypto
        .createHmac('sha1', this.consumerSecret)
        .update(sortedParams)
        .digest('base64');
      
      return signature === expectedSignature;
    } catch (error) {
      logger.error('Error verifying callback signature:', error);
      return false;
    }
  }

  /**
   * Generate merchant reference
   */
  generateMerchantReference(prefix = 'LOAN') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }
}

module.exports = new PesapalService();

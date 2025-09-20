const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation rules for payment initiation
 */
const validatePaymentInitiation = [
  body('loan_id')
    .isUUID()
    .withMessage('Valid loan ID is required'),
  
  body('user_id')
    .isUUID()
    .withMessage('Valid user ID is required'),
  
  body('amount')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be between 0.01 and 1,000,000'),
  
  body('phone_number')
    .matches(/^(\+254|0)[0-9]{9}$/)
    .withMessage('Please enter a valid Kenyan phone number'),
  
  body('payment_method')
    .isIn(['mpesa', 'airtel_money', 'equitel'])
    .withMessage('Payment method must be mpesa, airtel_money, or equitel'),
  
  body('description')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters')
];

/**
 * Validation rules for payment status check
 */
const validatePaymentStatus = [
  param('paymentId')
    .isUUID()
    .withMessage('Valid payment ID is required')
];

/**
 * Validation rules for admin transaction queries
 */
const validateTransactionQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'cancelled', 'expired'])
    .withMessage('Invalid status filter'),
  
  query('payment_method')
    .optional()
    .isIn(['mpesa', 'airtel_money', 'equitel', 'visa', 'mastercard'])
    .withMessage('Invalid payment method filter'),
  
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for date_from'),
  
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for date_to')
];

/**
 * Validation rules for transaction retry
 */
const validateTransactionRetry = [
  param('id')
    .isUUID()
    .withMessage('Valid transaction ID is required')
];

/**
 * Validation rules for user registration
 */
const validateUserRegistration = [
  body('full_name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  
  body('national_id')
    .isLength({ min: 8, max: 8 })
    .withMessage('National ID must be exactly 8 digits')
    .matches(/^[0-9]{8}$/)
    .withMessage('National ID must contain only digits'),
  
  body('phone_number')
    .matches(/^(\+254|0)[0-9]{9}$/)
    .withMessage('Please enter a valid Kenyan phone number'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('kra_pin')
    .isLength({ min: 11, max: 11 })
    .withMessage('KRA PIN must be exactly 11 characters')
    .matches(/^[A-Z]{1}[0-9]{9}[A-Z]{1}$/)
    .withMessage('KRA PIN must be in format A123456789B'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

/**
 * Validation rules for loan application
 */
const validateLoanApplication = [
  body('amount')
    .isFloat({ min: 1000, max: 1000000 })
    .withMessage('Loan amount must be between 1,000 and 1,000,000 KES'),
  
  body('repayment_period_days')
    .isInt({ min: 30, max: 365 })
    .withMessage('Repayment period must be between 30 and 365 days'),
  
  body('loan_purpose')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Loan purpose must be between 10 and 1000 characters')
    .matches(/^[a-zA-Z0-9\s.,!?-]+$/)
    .withMessage('Loan purpose contains invalid characters'),
  
  body('terms_accepted')
    .isBoolean()
    .withMessage('Terms acceptance is required')
    .custom((value) => {
      if (value !== true) {
        throw new Error('You must accept the terms and conditions');
      }
      return true;
    })
];

/**
 * Validation rules for admin loan management
 */
const validateLoanStatusUpdate = [
  param('id')
    .isUUID()
    .withMessage('Valid loan ID is required'),
  
  body('status')
    .isIn(['pending', 'processing_fee_paid', 'approved', 'disbursed', 'repaid', 'overdue', 'rejected'])
    .withMessage('Invalid loan status'),
  
  body('admin_notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Admin notes must not exceed 1000 characters')
];

/**
 * Validation rules for system settings
 */
const validateSystemSettings = [
  body('processing_fee_percentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Processing fee percentage must be between 0 and 100'),
  
  body('interest_rate_percentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Interest rate percentage must be between 0 and 100'),
  
  body('max_loan_amount')
    .isFloat({ min: 1000, max: 10000000 })
    .withMessage('Maximum loan amount must be between 1,000 and 10,000,000 KES'),
  
  body('min_loan_amount')
    .isFloat({ min: 100, max: 1000000 })
    .withMessage('Minimum loan amount must be between 100 and 1,000,000 KES'),
  
  body('max_repayment_period_days')
    .isInt({ min: 30, max: 1095 })
    .withMessage('Maximum repayment period must be between 30 and 1095 days')
];

/**
 * Custom validation for Kenyan phone numbers
 */
const validateKenyanPhone = (value) => {
  const phoneRegex = /^(\+254|0)[0-9]{9}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('Please enter a valid Kenyan phone number');
  }
  return true;
};

/**
 * Custom validation for National ID
 */
const validateNationalID = (value) => {
  if (!/^[0-9]{8}$/.test(value)) {
    throw new Error('National ID must be exactly 8 digits');
  }
  return true;
};

/**
 * Custom validation for KRA PIN
 */
const validateKRAPIN = (value) => {
  if (!/^[A-Z]{1}[0-9]{9}[A-Z]{1}$/.test(value)) {
    throw new Error('KRA PIN must be in format A123456789B');
  }
  return true;
};

/**
 * Custom validation for loan amount
 */
const validateLoanAmount = (value, { req }) => {
  const minAmount = req.body.min_amount || 1000;
  const maxAmount = req.body.max_amount || 1000000;
  
  if (value < minAmount) {
    throw new Error(`Loan amount must be at least ${minAmount} KES`);
  }
  
  if (value > maxAmount) {
    throw new Error(`Loan amount must not exceed ${maxAmount} KES`);
  }
  
  return true;
};

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Sanitize and validate input data
 */
const sanitizeAndValidate = (data, rules) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

module.exports = {
  validatePaymentInitiation,
  validatePaymentStatus,
  validateTransactionQuery,
  validateTransactionRetry,
  validateUserRegistration,
  validateLoanApplication,
  validateLoanStatusUpdate,
  validateSystemSettings,
  validateKenyanPhone,
  validateNationalID,
  validateKRAPIN,
  validateLoanAmount,
  handleValidationErrors,
  sanitizeAndValidate
};

const jwt = require('jsonwebtoken');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/auth.log' }),
    new winston.transports.Console()
  ]
});

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Authentication failed: No token provided', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Authentication failed: Invalid token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        error: err.message
      });
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn('Admin access denied', {
      userId: req.user.id,
      userRole: req.user.role,
      ip: req.ip,
      path: req.path
    });
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

/**
 * Middleware to check if user owns the resource
 */
const requireOwnership = (resourceParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const resourceUserId = req.params[resourceParam] || req.body[resourceParam];
    
    if (req.user.role !== 'admin' && req.user.id !== resourceUserId) {
      logger.warn('Resource access denied', {
        userId: req.user.id,
        resourceUserId,
        ip: req.ip,
        path: req.path
      });
      return res.status(403).json({
        success: false,
        error: 'Access denied to this resource'
      });
    }

    next();
  };
};

/**
 * Middleware to validate API key for webhook endpoints
 */
const validateWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-pesapal-signature'];
  const timestamp = req.headers['x-pesapal-timestamp'];

  if (!signature || !timestamp) {
    logger.warn('Webhook validation failed: Missing signature or timestamp', {
      ip: req.ip,
      path: req.path,
      headers: req.headers
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid webhook signature'
    });
  }

  // Verify timestamp (prevent replay attacks)
  const currentTime = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp);
  
  if (Math.abs(currentTime - requestTime) > 300) { // 5 minutes tolerance
    logger.warn('Webhook validation failed: Timestamp too old', {
      ip: req.ip,
      currentTime,
      requestTime,
      difference: Math.abs(currentTime - requestTime)
    });
    return res.status(401).json({
      success: false,
      error: 'Request timestamp too old'
    });
  }

  // Verify signature
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.PESAPAL_CONSUMER_SECRET)
    .update(JSON.stringify(req.body) + timestamp)
    .digest('hex');

  if (signature !== expectedSignature) {
    logger.warn('Webhook validation failed: Invalid signature', {
      ip: req.ip,
      expectedSignature: expectedSignature.substring(0, 10) + '...',
      receivedSignature: signature.substring(0, 10) + '...'
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid webhook signature'
    });
  }

  next();
};

/**
 * Middleware to log all requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });
  });

  next();
};

/**
 * Middleware to sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnership,
  validateWebhookSignature,
  requestLogger,
  sanitizeInput
};

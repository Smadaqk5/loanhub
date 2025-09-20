const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  loan_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'loans',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  pesapal_order_tracking_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  pesapal_merchant_reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'KES'
  },
  payment_method: {
    type: DataTypes.ENUM('mpesa', 'airtel_money', 'equitel', 'visa', 'mastercard'),
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'pending'
  },
  pesapal_status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  payment_reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  failure_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  callback_data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payments',
  indexes: [
    {
      fields: ['loan_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['pesapal_order_tracking_id']
    },
    {
      fields: ['pesapal_merchant_reference']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Payment;

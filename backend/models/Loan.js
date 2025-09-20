const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount_requested: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  processing_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 15.00
  },
  net_disbursed: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  total_repayment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  outstanding_balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing_fee_paid', 'approved', 'disbursed', 'repaid', 'overdue', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  repayment_deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  loan_purpose: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  processing_fee_paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  disbursed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  repaid_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'loans',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['repayment_deadline']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Loan;

-- Create payments table for Pesapal integration
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    loan_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    pesapal_order_tracking_id VARCHAR(255) UNIQUE,
    pesapal_merchant_reference VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'KES',
    payment_method ENUM('mpesa', 'airtel_money', 'equitel', 'visa', 'mastercard') NOT NULL,
    phone_number VARCHAR(20),
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'expired') NOT NULL DEFAULT 'pending',
    pesapal_status VARCHAR(100),
    payment_reference VARCHAR(255),
    failure_reason TEXT,
    callback_data JSON,
    paid_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_payments_loan_id (loan_id),
    INDEX idx_payments_user_id (user_id),
    INDEX idx_payments_pesapal_order_tracking_id (pesapal_order_tracking_id),
    INDEX idx_payments_pesapal_merchant_reference (pesapal_merchant_reference),
    INDEX idx_payments_status (status),
    INDEX idx_payments_created_at (created_at),
    INDEX idx_payments_payment_method (payment_method),
    
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create audit log for payment operations
CREATE TABLE IF NOT EXISTS payment_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    details JSON,
    admin_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payment_audit_payment_id (payment_id),
    INDEX idx_payment_audit_created_at (created_at),
    INDEX idx_payment_audit_action (action),
    
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create webhook logs table for tracking Pesapal callbacks
CREATE TABLE IF NOT EXISTS webhook_logs (
    id VARCHAR(36) PRIMARY KEY,
    source VARCHAR(50) NOT NULL DEFAULT 'pesapal',
    event_type VARCHAR(100) NOT NULL,
    payment_id VARCHAR(36),
    payload JSON NOT NULL,
    signature VARCHAR(500),
    processed BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_webhook_logs_source (source),
    INDEX idx_webhook_logs_event_type (event_type),
    INDEX idx_webhook_logs_payment_id (payment_id),
    INDEX idx_webhook_logs_processed (processed),
    INDEX idx_webhook_logs_created_at (created_at),
    
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

-- Create payment retry attempts table
CREATE TABLE IF NOT EXISTS payment_retry_attempts (
    id VARCHAR(36) PRIMARY KEY,
    original_payment_id VARCHAR(36) NOT NULL,
    retry_payment_id VARCHAR(36) NOT NULL,
    retry_reason VARCHAR(255),
    admin_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_retry_original_payment_id (original_payment_id),
    INDEX idx_retry_retry_payment_id (retry_payment_id),
    INDEX idx_retry_admin_id (admin_id),
    INDEX idx_retry_created_at (created_at),
    
    FOREIGN KEY (original_payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (retry_payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add payment-related columns to loans table if they don't exist
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS outstanding_balance DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS repaid_at TIMESTAMP NULL;

-- Update outstanding_balance for existing loans
UPDATE loans 
SET outstanding_balance = total_repayment - amount_paid 
WHERE outstanding_balance = 0.00;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loans_outstanding_balance ON loans(outstanding_balance);
CREATE INDEX IF NOT EXISTS idx_loans_amount_paid ON loans(amount_paid);
CREATE INDEX IF NOT EXISTS idx_loans_disbursed_at ON loans(disbursed_at);
CREATE INDEX IF NOT EXISTS idx_loans_repaid_at ON loans(repaid_at);

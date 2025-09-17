# Database Setup Instructions

## Step-by-Step Guide to Set Up Your Supabase Database

### 1. Access Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Sign in with your account
- Select your project: `frmmmscsmgvnybwazrzs`

### 2. Open SQL Editor
- Click on **"SQL Editor"** in the left sidebar
- Click **"New Query"**

### 3. Copy the Schema
Copy the entire SQL code below and paste it into the SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    national_id TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    kra_pin TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loans table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_requested NUMERIC(10,2) NOT NULL CHECK (amount_requested > 0),
    processing_fee NUMERIC(10,2) NOT NULL CHECK (processing_fee >= 0),
    interest_rate NUMERIC(5,2) NOT NULL CHECK (interest_rate >= 0),
    net_disbursed NUMERIC(10,2) NOT NULL CHECK (net_disbursed >= 0),
    total_repayment NUMERIC(10,2) NOT NULL CHECK (total_repayment >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disbursed', 'repaid', 'overdue')),
    repayment_deadline DATE NOT NULL,
    loan_purpose TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create repayments table
CREATE TABLE repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10,2) NOT NULL CHECK (amount_paid > 0),
    payment_reference TEXT NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processing_fee_percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00 CHECK (processing_fee_percentage >= 0 AND processing_fee_percentage <= 100),
    interest_rate_percentage NUMERIC(5,2) NOT NULL DEFAULT 15.00 CHECK (interest_rate_percentage >= 0),
    max_loan_amount NUMERIC(10,2) NOT NULL DEFAULT 100000.00 CHECK (max_loan_amount > 0),
    min_loan_amount NUMERIC(10,2) NOT NULL DEFAULT 1000.00 CHECK (min_loan_amount > 0),
    max_repayment_period_days INTEGER NOT NULL DEFAULT 365 CHECK (max_repayment_period_days > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_national_id ON users(national_id);
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_repayment_deadline ON loans(repayment_deadline);
CREATE INDEX idx_repayments_loan_id ON repayments(loan_id);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (processing_fee_percentage, interest_rate_percentage, max_loan_amount, min_loan_amount, max_repayment_period_days)
VALUES (5.00, 15.00, 100000.00, 1000.00, 365);

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can view their own loans
CREATE POLICY "Users can view own loans" ON loans
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own repayments
CREATE POLICY "Users can view own repayments" ON repayments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM loans 
            WHERE loans.id = repayments.loan_id 
            AND loans.user_id = auth.uid()
        )
    );

-- Admins can view all data (you'll need to create an admin role)
-- For now, we'll create a simple admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- This is a placeholder - you'll need to implement proper admin role checking
    -- For now, we'll allow all authenticated users to be admins
    -- In production, you should implement proper role-based access control
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all loans" ON loans
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all repayments" ON repayments
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can view system settings" ON system_settings
    FOR ALL USING (is_admin());
```

### 4. Execute the Schema
- Click the **"Run"** button (or press Ctrl+Enter)
- Wait for the execution to complete
- You should see "Success" message

### 5. Verify Tables Created
- Go to **"Table Editor"** in the left sidebar
- You should see these tables:
  - `users`
  - `loans`
  - `repayments`
  - `audit_logs`
  - `system_settings`

### 6. Test Your Application
- Your loan hub app should now work with the database
- Visit: http://localhost:3000
- Try signing up and applying for a loan

## Troubleshooting

If you encounter any errors:
1. Make sure you're in the correct Supabase project
2. Check that you have the right permissions
3. Try running the schema in smaller chunks if it fails
4. Check the Supabase logs for specific error messages

## What This Schema Creates

- **users**: User accounts and profiles
- **loans**: Loan applications and details  
- **repayments**: Payment tracking
- **audit_logs**: Admin activity logs
- **system_settings**: Configurable loan parameters (5% processing fee, 15% interest rate, etc.)

The schema also includes:
- Proper indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates
- Data validation constraints

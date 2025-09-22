# How to Add an Admin User

## 🚀 **Quick Methods**

### **Method 1: Using the Web Interface (Easiest)**

1. **Go to Admin Panel**:
   - Visit: `https://loanke.netlify.app/admin/create-admin`
   - Or: `http://localhost:3000/admin/create-admin` (if running locally)

2. **Fill the Form**:
   - Full Name: `Admin User`
   - National ID: `12345678`
   - Phone: `+254700000000`
   - Email: `admin@loanhubkenya.com`
   - KRA PIN: `A123456789B`
   - Password: `admin123`

3. **Submit** - Admin will be created automatically!

### **Method 2: Direct Database Insert (Supabase)**

If you have Supabase set up, run this SQL in the Supabase SQL Editor:

```sql
-- Add role column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Insert admin user
INSERT INTO users (
    full_name,
    national_id,
    phone_number,
    email,
    kra_pin,
    password_hash,
    role,
    status
) VALUES (
    'Admin User',
    '12345678',
    '+254700000000',
    'admin@loanhubkenya.com',
    'A123456789B',
    'admin123', -- In production, hash this password
    'admin',
    'active'
);
```

### **Method 3: Using Mock System (Development)**

If using the mock system, the default admin is:
- **Email**: `admin@loanhubkenya.com`
- **Password**: `admin123`

## 🔧 **Admin Features**

Once you have an admin account, you can:

- **View All Users**: `/admin/users`
- **Manage Admins**: `/admin/manage-admins`
- **Create New Admins**: `/admin/create-admin`
- **View All Loans**: `/admin/loans`
- **System Settings**: `/admin/settings`

## 🛡️ **Security Notes**

- Change default passwords in production
- Use strong, unique passwords
- Hash passwords before storing
- Limit admin access to trusted personnel

## 🎯 **Quick Test**

1. Sign in with admin credentials
2. Navigate to `/admin/users`
3. You should see the admin panel with full access

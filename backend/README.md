# LoanHub Kenya - Backend API

A comprehensive backend API for LoanHub Kenya with Pesapal payment gateway integration.

## Features

- **Pesapal Payment Integration**: Complete STK Push implementation for mobile money payments
- **OAuth Authentication**: Secure token-based authentication with Pesapal
- **Webhook Handling**: Real-time payment status updates via callbacks and IPN
- **Admin Panel**: Comprehensive transaction management and reporting
- **Security**: Input validation, rate limiting, and secure data handling
- **Database**: MySQL/PostgreSQL support with Sequelize ORM

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+ or PostgreSQL 13+
- Redis (optional, for caching)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loan-hub/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=loanhub_kenya
   DB_USER=root
   DB_PASSWORD=your_password
   
   # Pesapal Configuration
   PESAPAL_CONSUMER_KEY=k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx
   PESAPAL_CONSUMER_SECRET=Tjg4VodFyn1ur9aDMo1fsJvgHQQ=
   PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3/api
   PESAPAL_CALLBACK_URL=http://localhost:3001/pesapal/callback
   PESAPAL_IPN_URL=http://localhost:3001/pesapal/ipn
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   
   # Security
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE loanhub_kenya;"
   
   # Run migrations
   mysql -u root -p loanhub_kenya < database/migrations/001_create_payments_table.sql
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `GET /pesapal/token` - Get OAuth access token from Pesapal

### Payment Processing
- `POST /pesapal/pay` - Initiate STK Push payment
- `GET /pesapal/status/:paymentId` - Get payment status
- `GET /pesapal/callback` - Handle payment callback (webhook)
- `POST /pesapal/ipn` - Handle Instant Payment Notification

### Admin Panel
- `GET /admin/transactions` - Get all transactions with filtering
- `GET /admin/transactions/:id` - Get specific transaction details
- `POST /admin/transactions/:id/retry` - Retry failed transaction
- `GET /admin/transactions/export` - Export transactions to CSV
- `GET /admin/dashboard/stats` - Get dashboard statistics

### Health Check
- `GET /health` - API health status

## Payment Flow

1. **Payment Initiation**
   ```javascript
   POST /pesapal/pay
   {
     "loan_id": "uuid",
     "user_id": "uuid", 
     "amount": 1000.00,
     "phone_number": "+254700000000",
     "payment_method": "mpesa",
     "description": "Loan repayment"
   }
   ```

2. **Payment Processing**
   - User receives STK Push on their phone
   - User enters mobile money PIN
   - Payment is processed by Pesapal

3. **Status Updates**
   - Real-time updates via webhooks
   - Database automatically updated
   - Frontend polls for status changes

## Database Schema

### Payments Table
```sql
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    loan_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    pesapal_order_tracking_id VARCHAR(255) UNIQUE,
    pesapal_merchant_reference VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    payment_method ENUM('mpesa', 'airtel_money', 'equitel', 'visa', 'mastercard'),
    phone_number VARCHAR(20),
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'expired'),
    pesapal_status VARCHAR(100),
    payment_reference VARCHAR(255),
    failure_reason TEXT,
    callback_data JSON,
    paid_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using express-validator
- **Input Sanitization**: XSS protection and data cleaning
- **JWT Authentication**: Secure token-based authentication
- **Webhook Signature Verification**: Ensures callback authenticity
- **SQL Injection Protection**: Parameterized queries with Sequelize
- **CORS Configuration**: Restricted to frontend domain
- **Helmet Security Headers**: Additional security headers

## Error Handling

All API responses follow a consistent format:

```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "error": "Error description",
  "details": [ ... ] // Validation errors if applicable
}
```

## Logging

Comprehensive logging using Winston:
- Request/response logging
- Error logging with stack traces
- Payment transaction logging
- Security event logging

Logs are stored in:
- `logs/app.log` - General application logs
- `logs/pesapal.log` - Payment-related logs
- `logs/auth.log` - Authentication logs
- `logs/admin-routes.log` - Admin panel logs

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=3001
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-password
PESAPAL_CONSUMER_KEY=your-production-key
PESAPAL_CONSUMER_SECRET=your-production-secret
PESAPAL_BASE_URL=https://api.pesapal.com/pesapalv3/api
JWT_SECRET=your-very-secure-jwt-secret
```

### Docker Deployment
```bash
# Build image
docker build -t loanhub-backend .

# Run container
docker run -p 3001:3001 --env-file .env loanhub-backend
```

## Monitoring

- Health check endpoint: `GET /health`
- Log monitoring via Winston
- Database connection monitoring
- Payment success/failure tracking

## Support

For technical support or questions:
- Email: support@loanhubkenya.com
- Documentation: [API Documentation Link]
- Issues: [GitHub Issues Link]

## License

MIT License - see LICENSE file for details.

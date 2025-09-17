# LoanHub Kenya - Secure Loan Lending Platform

A comprehensive, secure loan lending platform built specifically for Kenya with both user and admin panels, featuring loan applications, processing fee deduction, and real-time loan tracking.

## 🚀 Features

### User Panel
- **Secure Authentication**: Registration and login with email verification
- **KYC Verification**: Complete Know Your Customer process with National ID, KRA PIN validation
- **Loan Application**: Easy-to-use loan application form with real-time validation
- **Loan Calculator**: Interactive calculator showing:
  - Requested loan amount
  - Processing fee (configurable percentage)
  - Interest amount (configurable rate)
  - Net amount disbursed
  - Total repayment amount
- **Loan Tracking**: Real-time status tracking (Pending, Approved, Disbursed, Repaid, Overdue)
- **Dashboard**: Personal dashboard with loan history and statistics

### Admin Panel
- **Comprehensive Dashboard**: Overview of all platform metrics
- **User Management**: View, approve, reject, or suspend users
- **Loan Management**: Approve/reject loan applications, track repayments
- **Financial Settings**: Configure processing fees, interest rates, and loan limits
- **Reports & Analytics**: Generate detailed reports on platform performance
- **Audit Logs**: Track all administrative actions

### Security Features
- **SSL/HTTPS**: Secure data transmission
- **Password Hashing**: Secure password storage using Supabase Auth
- **Email Verification**: OTP verification for account security
- **Row Level Security**: Database-level access control
- **Audit Logging**: Complete action tracking for compliance

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS with custom components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 📊 Database Schema

The application uses a PostgreSQL database with the following main tables:

- **users**: User profiles and KYC information
- **loans**: Loan applications and details
- **repayments**: Payment tracking
- **audit_logs**: Administrative action logs
- **system_settings**: Configurable platform settings

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loan-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `src/lib/database-schema.sql`
   - Get your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### For Users

1. **Sign Up**: Create an account with your personal details
2. **Complete KYC**: Provide National ID, KRA PIN, and other required information
3. **Apply for Loan**: Use the loan calculator and submit your application
4. **Track Status**: Monitor your loan application and repayment status
5. **Make Repayments**: Track your repayment schedule

### For Admins

1. **Access Admin Panel**: Sign in with admin credentials
2. **Review Applications**: Approve or reject loan applications
3. **Manage Users**: View and manage user accounts
4. **Configure Settings**: Set processing fees, interest rates, and limits
5. **Generate Reports**: Create detailed financial reports

## 🔧 Configuration

### System Settings

The platform allows admins to configure:

- **Processing Fee Percentage**: Default 5%
- **Interest Rate**: Default 15% per annum
- **Maximum Loan Amount**: Default KES 100,000
- **Minimum Loan Amount**: Default KES 1,000
- **Maximum Repayment Period**: Default 365 days

### Loan Flow

1. User registers and completes KYC verification
2. User applies for a loan with required details
3. Admin reviews and approves/rejects the application
4. Upon approval, processing fee is deducted from requested amount
5. Net amount is recorded as disbursed
6. Repayment schedule is automatically generated
7. User receives email notifications for reminders

## 🔒 Security & Compliance

- **Data Protection**: All sensitive data is encrypted
- **Access Control**: Role-based access with Row Level Security
- **Audit Trail**: Complete logging of all administrative actions
- **Kenya Compliance**: Designed to meet CBK regulations
- **Transparent Terms**: Clear loan terms and conditions

## 📈 Features Roadmap

- [ ] MPesa STK Push integration for loan disbursement
- [ ] SMS notifications for loan updates
- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Automated loan approval based on credit scoring
- [ ] Integration with credit bureaus

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@loanhubkenya.com or create an issue in the repository.

## 🙏 Acknowledgments

- Built with Next.js and Supabase
- UI components from Radix UI
- Icons from Lucide React
- Styling with TailwindCSS

---

**LoanHub Kenya** - Empowering financial inclusion through secure and transparent lending.
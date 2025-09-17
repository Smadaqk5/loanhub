# Deployment Guide - LoanHub Kenya

This guide will help you deploy the LoanHub Kenya application to production.

## 🚀 Prerequisites

- Vercel account (recommended) or any hosting platform
- Supabase project set up
- Domain name (optional)

## 📋 Pre-deployment Checklist

### 1. Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Set up Database**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `src/lib/database-schema.sql`
   - Execute the SQL to create all tables and policies

3. **Configure Authentication**
   - Go to Authentication > Settings
   - Enable email confirmations
   - Set up redirect URLs for your domain

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=https://your-domain.com

# Email Configuration (Optional - for notifications)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Push your code to GitHub/GitLab
   - Go to [vercel.com](https://vercel.com)
   - Import your repository

2. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all the environment variables from your `.env.local`

3. **Deploy**
   - Vercel will automatically build and deploy your app
   - Your app will be available at `https://your-project.vercel.app`

### Option 2: Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   - Add all environment variables in Netlify dashboard

### Option 3: Self-hosted (VPS/Cloud)

1. **Server Setup**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd loan-hub

   # Install dependencies
   npm install

   # Build application
   npm run build

   # Start with PM2
   pm2 start npm --name "loan-hub" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 Post-deployment Configuration

### 1. Update Supabase Settings

1. **Authentication URLs**
   - Go to Authentication > URL Configuration
   - Add your production domain to allowed URLs
   - Update redirect URLs

2. **Row Level Security**
   - Verify all RLS policies are working correctly
   - Test user registration and login

### 2. SSL Certificate

- Vercel/Netlify provide SSL automatically
- For self-hosted, use Let's Encrypt:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d your-domain.com
  ```

### 3. Domain Configuration

1. **DNS Settings**
   - Point your domain to your hosting provider
   - Add CNAME record for subdomains if needed

2. **Update Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` with your actual domain

## 🧪 Testing Deployment

### 1. Basic Functionality Tests

- [ ] User registration works
- [ ] User login works
- [ ] Loan application form works
- [ ] Admin dashboard loads
- [ ] Database connections work
- [ ] Email notifications work (if configured)

### 2. Security Tests

- [ ] HTTPS is enforced
- [ ] Authentication redirects work
- [ ] Admin routes are protected
- [ ] Database queries are secure

### 3. Performance Tests

- [ ] Page load times are acceptable
- [ ] Database queries are optimized
- [ ] Images and assets load quickly

## 📊 Monitoring & Maintenance

### 1. Set up Monitoring

- **Vercel Analytics**: Built-in analytics
- **Supabase Dashboard**: Monitor database performance
- **Uptime Monitoring**: Use services like UptimeRobot

### 2. Regular Maintenance

- **Database Backups**: Supabase provides automatic backups
- **Security Updates**: Keep dependencies updated
- **Performance Monitoring**: Monitor slow queries and optimize

### 3. Scaling Considerations

- **Database**: Supabase scales automatically
- **CDN**: Vercel provides global CDN
- **Caching**: Implement Redis for session caching if needed

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Ensure database is properly set up

3. **Authentication Issues**
   - Verify redirect URLs
   - Check email configuration
   - Ensure Supabase Auth is properly configured

### Getting Help

- Check the application logs
- Review Supabase logs
- Check Vercel deployment logs
- Contact support if needed

## 📈 Next Steps

After successful deployment:

1. **Set up Analytics**: Configure Google Analytics or similar
2. **Configure Email**: Set up email service for notifications
3. **Set up Monitoring**: Implement error tracking and performance monitoring
4. **Security Audit**: Conduct a security review
5. **Load Testing**: Test with realistic user loads

---

**Note**: This is a basic deployment guide. For production use, consider additional security measures, monitoring, and backup strategies.

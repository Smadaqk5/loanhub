// Payment Page Generator for PesaPal Integration
// Generates individual payment pages for each transaction

export interface PaymentPageData {
  paymentId: string
  orderTrackingId: string
  merchantReference: string
  amount: number
  currency: string
  phoneNumber: string
  paymentMethod: 'mpesa' | 'airtel_money' | 'equitel'
  description: string
  loanId?: string
  userId: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired'
  createdAt: string
  expiresAt?: string
  paymentUrl?: string
}

export interface PaymentPageConfig {
  baseUrl: string
  theme: 'light' | 'dark'
  branding: {
    companyName: string
    logo?: string
    primaryColor: string
    secondaryColor: string
  }
  features: {
    showProgress: boolean
    showTimer: boolean
    allowRetry: boolean
    showInstructions: boolean
  }
}

class PaymentPageGenerator {
  private baseUrl: string
  private config: PaymentPageConfig

  constructor(config: PaymentPageConfig) {
    this.config = config
    this.baseUrl = config.baseUrl
  }

  /**
   * Generate a unique payment page URL
   */
  generatePaymentPageUrl(paymentData: PaymentPageData): string {
    const encodedId = encodeURIComponent(paymentData.paymentId)
    return `${this.baseUrl}/payment/${encodedId}`
  }

  /**
   * Generate payment page HTML content
   */
  generatePaymentPageHTML(paymentData: PaymentPageData): string {
    const { branding, features } = this.config
    const paymentUrl = this.generatePaymentPageUrl(paymentData)
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment - ${branding.companyName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .payment-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
        }
        
        .payment-header {
            background: ${branding.primaryColor};
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .payment-header h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .payment-header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .payment-content {
            padding: 30px;
        }
        
        .payment-amount {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .amount-display {
            font-size: 48px;
            font-weight: bold;
            color: ${branding.primaryColor};
            margin-bottom: 10px;
        }
        
        .currency {
            font-size: 18px;
            color: #666;
        }
        
        .payment-details {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .detail-row:last-child {
            margin-bottom: 0;
        }
        
        .detail-label {
            font-weight: 600;
            color: #333;
        }
        
        .detail-value {
            color: #666;
        }
        
        .payment-method {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
        }
        
        .method-icon {
            width: 40px;
            height: 40px;
            margin-right: 15px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
        }
        
        .mpesa { background: #00A651; }
        .airtel { background: #E60012; }
        .equitel { background: #1E3A8A; }
        
        .payment-actions {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .btn {
            padding: 15px 30px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            text-align: center;
            display: block;
        }
        
        .btn-primary {
            background: ${branding.primaryColor};
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        .btn-secondary {
            background: #f8f9fa;
            color: #333;
            border: 2px solid #e9ecef;
        }
        
        .btn-secondary:hover {
            background: #e9ecef;
        }
        
        .payment-status {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-completed {
            background: #d4edda;
            color: #155724;
        }
        
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .instructions {
            background: #e3f2fd;
            border-left: 4px solid ${branding.primaryColor};
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 0 8px 8px 0;
        }
        
        .instructions h3 {
            margin-bottom: 10px;
            color: ${branding.primaryColor};
        }
        
        .instructions ol {
            margin-left: 20px;
        }
        
        .instructions li {
            margin-bottom: 8px;
            line-height: 1.5;
        }
        
        .timer {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .timer-display {
            font-size: 24px;
            font-weight: bold;
            color: ${branding.primaryColor};
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        
        .progress-fill {
            height: 100%;
            background: ${branding.primaryColor};
            transition: width 0.3s ease;
        }
        
        @media (max-width: 600px) {
            .payment-container {
                margin: 10px;
            }
            
            .amount-display {
                font-size: 36px;
            }
        }
    </style>
</head>
<body>
    <div class="payment-container">
        <div class="payment-header">
            <h1>${branding.companyName}</h1>
            <p>Complete Your Payment</p>
        </div>
        
        <div class="payment-content">
            ${features.showProgress ? this.generateProgressBar(paymentData) : ''}
            
            <div class="payment-amount">
                <div class="amount-display">${this.formatCurrency(paymentData.amount)}</div>
                <div class="currency">${paymentData.currency}</div>
            </div>
            
            <div class="payment-status">
                <span class="status-badge status-${paymentData.status}">
                    ${this.getStatusText(paymentData.status)}
                </span>
            </div>
            
            <div class="payment-details">
                <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value">${paymentData.paymentId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone Number:</span>
                    <span class="detail-value">${paymentData.phoneNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${this.getPaymentMethodName(paymentData.paymentMethod)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Description:</span>
                    <span class="detail-value">${paymentData.description}</span>
                </div>
            </div>
            
            <div class="payment-method">
                <div class="method-icon ${this.getMethodClass(paymentData.paymentMethod)}">
                    ${this.getMethodIcon(paymentData.paymentMethod)}
                </div>
                <span style="font-size: 18px; font-weight: 600;">
                    ${this.getPaymentMethodName(paymentData.paymentMethod)}
                </span>
            </div>
            
            ${features.showInstructions ? this.generateInstructions(paymentData) : ''}
            
            ${features.showTimer && paymentData.expiresAt ? this.generateTimer(paymentData) : ''}
            
            <div class="payment-actions">
                ${this.generateActionButtons(paymentData)}
            </div>
        </div>
    </div>
    
    <script>
        ${this.generateJavaScript(paymentData)}
    </script>
</body>
</html>
    `
  }

  /**
   * Generate progress bar HTML
   */
  private generateProgressBar(paymentData: PaymentPageData): string {
    const progress = this.calculateProgress(paymentData)
    return `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
    `
  }

  /**
   * Generate payment instructions
   */
  private generateInstructions(paymentData: PaymentPageData): string {
    const method = paymentData.paymentMethod
    let instructions = ''
    
    if (method === 'mpesa') {
      instructions = `
        <div class="instructions">
          <h3>M-Pesa Payment Instructions</h3>
          <ol>
            <li>You will receive an STK Push notification on your phone</li>
            <li>Enter your M-Pesa PIN when prompted</li>
            <li>Confirm the payment amount and recipient</li>
            <li>Wait for the payment confirmation</li>
          </ol>
        </div>
      `
    } else if (method === 'airtel_money') {
      instructions = `
        <div class="instructions">
          <h3>Airtel Money Payment Instructions</h3>
          <ol>
            <li>You will receive an STK Push notification on your phone</li>
            <li>Enter your Airtel Money PIN when prompted</li>
            <li>Confirm the payment amount and recipient</li>
            <li>Wait for the payment confirmation</li>
          </ol>
        </div>
      `
    } else if (method === 'equitel') {
      instructions = `
        <div class="instructions">
          <h3>Equitel Payment Instructions</h3>
          <ol>
            <li>You will receive an STK Push notification on your phone</li>
            <li>Enter your Equitel PIN when prompted</li>
            <li>Confirm the payment amount and recipient</li>
            <li>Wait for the payment confirmation</li>
          </ol>
        </div>
      `
    }
    
    return instructions
  }

  /**
   * Generate countdown timer
   */
  private generateTimer(paymentData: PaymentPageData): string {
    if (!paymentData.expiresAt) return ''
    
    return `
      <div class="timer">
        <div class="timer-display" id="countdown">
          ${this.calculateTimeRemaining(paymentData.expiresAt)}
        </div>
        <p>Time remaining to complete payment</p>
      </div>
    `
  }

  /**
   * Generate action buttons
   */
  private generateActionButtons(paymentData: PaymentPageData): string {
    let buttons = ''
    
    if (paymentData.status === 'pending') {
      if (paymentData.paymentUrl) {
        buttons += `
          <a href="${paymentData.paymentUrl}" class="btn btn-primary">
            Complete Payment
          </a>
        `
      } else {
        buttons += `
          <button onclick="initiatePayment()" class="btn btn-primary">
            Initiate Payment
          </button>
        `
      }
      
      if (this.config.features.allowRetry) {
        buttons += `
          <button onclick="retryPayment()" class="btn btn-secondary">
            Retry Payment
          </button>
        `
      }
    } else if (paymentData.status === 'completed') {
      buttons += `
        <a href="${this.baseUrl}/payment/success/${paymentData.paymentId}" class="btn btn-primary">
          View Receipt
        </a>
      `
    } else if (paymentData.status === 'failed') {
      buttons += `
        <button onclick="retryPayment()" class="btn btn-primary">
          Try Again
        </button>
      `
    }
    
    buttons += `
      <a href="${this.baseUrl}/dashboard" class="btn btn-secondary">
        Back to Dashboard
      </a>
    `
    
    return buttons
  }

  /**
   * Generate JavaScript for the payment page
   */
  private generateJavaScript(paymentData: PaymentPageData): string {
    return `
      // Payment page functionality
      let paymentStatus = '${paymentData.status}';
      let paymentId = '${paymentData.paymentId}';
      let orderTrackingId = '${paymentData.orderTrackingId}';
      
      // Initialize page
      document.addEventListener('DOMContentLoaded', function() {
        if (paymentStatus === 'pending') {
          startPaymentPolling();
        }
        
        ${paymentData.expiresAt ? this.generateTimerScript(paymentData.expiresAt) : ''}
      });
      
      // Payment polling
      function startPaymentPolling() {
        const pollInterval = setInterval(async () => {
          try {
            const response = await fetch(\`/api/payment/status/\${paymentId}\`);
            const data = await response.json();
            
            if (data.status !== 'pending') {
              clearInterval(pollInterval);
              updatePaymentStatus(data.status);
            }
          } catch (error) {
            console.error('Payment polling error:', error);
          }
        }, 5000);
        
        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 300000);
      }
      
      // Update payment status
      function updatePaymentStatus(status) {
        paymentStatus = status;
        const statusElement = document.querySelector('.status-badge');
        statusElement.className = \`status-badge status-\${status}\`;
        statusElement.textContent = getStatusText(status);
        
        // Update action buttons
        updateActionButtons(status);
      }
      
      // Update action buttons based on status
      function updateActionButtons(status) {
        const actionsContainer = document.querySelector('.payment-actions');
        
        if (status === 'completed') {
          actionsContainer.innerHTML = \`
            <a href="/payment/success/\${paymentId}" class="btn btn-primary">
              View Receipt
            </a>
            <a href="/dashboard" class="btn btn-secondary">
              Back to Dashboard
            </a>
          \`;
        } else if (status === 'failed') {
          actionsContainer.innerHTML = \`
            <button onclick="retryPayment()" class="btn btn-primary">
              Try Again
            </button>
            <a href="/dashboard" class="btn btn-secondary">
              Back to Dashboard
            </a>
          \`;
        }
      }
      
      // Initiate payment
      async function initiatePayment() {
        try {
          const response = await fetch('/api/payment/initiate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId: paymentId,
              orderTrackingId: orderTrackingId
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            updatePaymentStatus('pending');
            startPaymentPolling();
          } else {
            alert('Payment initiation failed: ' + data.error);
          }
        } catch (error) {
          console.error('Payment initiation error:', error);
          alert('Payment initiation failed. Please try again.');
        }
      }
      
      // Retry payment
      function retryPayment() {
        location.reload();
      }
      
      // Get status text
      function getStatusText(status) {
        const statusTexts = {
          'pending': 'Processing',
          'completed': 'Completed',
          'failed': 'Failed',
          'cancelled': 'Cancelled',
          'expired': 'Expired'
        };
        return statusTexts[status] || 'Unknown';
      }
    `
  }

  /**
   * Generate timer script
   */
  private generateTimerScript(expiresAt: string): string {
    return `
      // Countdown timer
      const expiryTime = new Date('${expiresAt}').getTime();
      
      function updateCountdown() {
        const now = new Date().getTime();
        const distance = expiryTime - now;
        
        if (distance < 0) {
          document.getElementById('countdown').innerHTML = 'EXPIRED';
          updatePaymentStatus('expired');
          return;
        }
        
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('countdown').innerHTML = 
          minutes + 'm ' + seconds + 's';
      }
      
      // Update countdown every second
      setInterval(updateCountdown, 1000);
      updateCountdown();
    `
  }

  /**
   * Calculate payment progress
   */
  private calculateProgress(paymentData: PaymentPageData): number {
    switch (paymentData.status) {
      case 'pending': return 50
      case 'completed': return 100
      case 'failed': return 0
      case 'cancelled': return 0
      case 'expired': return 0
      default: return 0
    }
  }

  /**
   * Calculate time remaining
   */
  private calculateTimeRemaining(expiresAt: string): string {
    const now = new Date().getTime()
    const expiry = new Date(expiresAt).getTime()
    const distance = expiry - now
    
    if (distance < 0) return 'EXPIRED'
    
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)
    
    return `${minutes}m ${seconds}s`
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Get status text
   */
  private getStatusText(status: string): string {
    const statusTexts = {
      'pending': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
      'expired': 'Expired'
    }
    return statusTexts[status as keyof typeof statusTexts] || 'Unknown'
  }

  /**
   * Get payment method name
   */
  private getPaymentMethodName(method: string): string {
    const methodNames = {
      'mpesa': 'M-Pesa',
      'airtel_money': 'Airtel Money',
      'equitel': 'Equitel'
    }
    return methodNames[method as keyof typeof methodNames] || method
  }

  /**
   * Get method CSS class
   */
  private getMethodClass(method: string): string {
    const methodClasses = {
      'mpesa': 'mpesa',
      'airtel_money': 'airtel',
      'equitel': 'equitel'
    }
    return methodClasses[method as keyof typeof methodClasses] || 'mpesa'
  }

  /**
   * Get method icon
   */
  private getMethodIcon(method: string): string {
    const methodIcons = {
      'mpesa': 'M',
      'airtel_money': 'A',
      'equitel': 'E'
    }
    return methodIcons[method as keyof typeof methodIcons] || 'M'
  }
}

// Export the generator
export const paymentPageGenerator = new PaymentPageGenerator({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  theme: 'light',
  branding: {
    companyName: 'Loan Hub Kenya',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF'
  },
  features: {
    showProgress: true,
    showTimer: true,
    allowRetry: true,
    showInstructions: true
  }
})

export default PaymentPageGenerator

// PesaPal Payment Link Generator
// Creates direct payment links that redirect to PesaPal's payment interface

export interface PesaPalPaymentRequest {
  amount: number
  currency: string
  description: string
  phoneNumber: string
  paymentMethod: 'mpesa' | 'airtel_money' | 'equitel'
  merchantReference: string
  callbackUrl: string
  customerEmail?: string
  customerName?: string
}

export interface PesaPalPaymentLink {
  paymentUrl: string
  merchantReference: string
  expiresAt: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
}

class PesaPalPaymentLinkGenerator {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3/api'
    this.consumerKey = process.env.PESAPAL_CONSUMER_KEY || 'x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL'
    this.consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || 'Q9twNwMHt8a03lFfODhnteP9fnY='
  }

  /**
   * Get OAuth access token from PesaPal
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch(`${this.baseUrl}/Auth/RequestToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          consumer_key: this.consumerKey,
          consumer_secret: this.consumerSecret
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('PesaPal token response error:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.token) {
        this.accessToken = data.token
        // Set token expiry to 55 minutes (tokens expire in 1 hour)
        this.tokenExpiry = Date.now() + (55 * 60 * 1000)
        return this.accessToken
      } else {
        throw new Error('Invalid response from PesaPal token endpoint')
      }
    } catch (error) {
      console.error('Failed to get PesaPal access token:', error)
      throw new Error('Failed to get access token from PesaPal')
    }
  }

  /**
   * Generate merchant reference
   */
  private generateMerchantReference(prefix: string = 'PAY'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}_${timestamp}_${random}`
  }

  /**
   * Create a direct PesaPal payment link
   */
  async createPaymentLink(request: PesaPalPaymentRequest): Promise<PesaPalPaymentLink> {
    try {
      const token = await this.getAccessToken()
      const merchantReference = request.merchantReference || this.generateMerchantReference()

      // Create payment order data for PesaPal
      const orderData = {
        id: merchantReference,
        currency: request.currency,
        amount: request.amount,
        description: request.description,
        callback_url: request.callbackUrl,
        notification_id: merchantReference,
        billing_address: {
          phone_number: request.phoneNumber,
          email_address: request.customerEmail || 'customer@example.com',
          country_code: 'KE',
          first_name: request.customerName || 'Customer',
          middle_name: '',
          last_name: 'User',
          line_1: 'Nairobi, Kenya',
          line_2: '',
          city: 'Nairobi',
          state: 'Nairobi',
          postal_code: '00100',
          zip_code: '00100'
        }
      }

      // Submit order to PesaPal
      const response = await fetch(`${this.baseUrl}/Transactions/SubmitOrderRequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('PesaPal order submission error:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (!data.redirect_url) {
        throw new Error('No redirect URL received from PesaPal')
      }

      // Store payment data for tracking
      const paymentData = {
        merchantReference,
        paymentUrl: data.redirect_url,
        orderTrackingId: data.order_tracking_id,
        amount: request.amount,
        currency: request.currency,
        phoneNumber: request.phoneNumber,
        paymentMethod: request.paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }

      // Store in localStorage for tracking
      if (typeof window !== 'undefined') {
        localStorage.setItem(`pesapal_payment_${merchantReference}`, JSON.stringify(paymentData))
      }

      return {
        paymentUrl: data.redirect_url,
        merchantReference,
        expiresAt: paymentData.expiresAt,
        status: 'pending'
      }

    } catch (error) {
      console.error('Failed to create PesaPal payment link:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to create payment link')
    }
  }

  /**
   * Create a quick payment link for common scenarios
   */
  async createQuickPaymentLink(
    amount: number,
    description: string,
    phoneNumber: string,
    paymentMethod: 'mpesa' | 'airtel_money' | 'equitel' = 'mpesa'
  ): Promise<PesaPalPaymentLink> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    return this.createPaymentLink({
      amount,
      currency: 'KES',
      description,
      phoneNumber,
      paymentMethod,
      merchantReference: this.generateMerchantReference(),
      callbackUrl: `${baseUrl}/payment/callback`,
      customerEmail: 'customer@example.com',
      customerName: 'Customer'
    })
  }

  /**
   * Create a processing fee payment link
   */
  async createProcessingFeePaymentLink(
    loanId: string,
    amount: number,
    phoneNumber: string,
    paymentMethod: 'mpesa' | 'airtel_money' | 'equitel' = 'mpesa'
  ): Promise<PesaPalPaymentLink> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    return this.createPaymentLink({
      amount,
      currency: 'KES',
      description: `Processing fee payment for loan ${loanId}`,
      phoneNumber,
      paymentMethod,
      merchantReference: this.generateMerchantReference('PROC'),
      callbackUrl: `${baseUrl}/payment/callback?loan_id=${loanId}`,
      customerEmail: 'customer@example.com',
      customerName: 'Customer'
    })
  }

  /**
   * Create a loan repayment payment link
   */
  async createLoanRepaymentLink(
    loanId: string,
    amount: number,
    phoneNumber: string,
    paymentMethod: 'mpesa' | 'airtel_money' | 'equitel' = 'mpesa'
  ): Promise<PesaPalPaymentLink> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    return this.createPaymentLink({
      amount,
      currency: 'KES',
      description: `Loan repayment for loan ${loanId}`,
      phoneNumber,
      paymentMethod,
      merchantReference: this.generateMerchantReference('REPAY'),
      callbackUrl: `${baseUrl}/payment/callback?loan_id=${loanId}&type=repayment`,
      customerEmail: 'customer@example.com',
      customerName: 'Customer'
    })
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(merchantReference: string): Promise<{
    status: 'pending' | 'completed' | 'failed' | 'cancelled'
    orderTrackingId?: string
    amount?: number
    currency?: string
  }> {
    try {
      // First check localStorage for quick response
      if (typeof window !== 'undefined') {
        const storedPayment = localStorage.getItem(`pesapal_payment_${merchantReference}`)
        if (storedPayment) {
          const paymentData = JSON.parse(storedPayment)
          return {
            status: paymentData.status,
            orderTrackingId: paymentData.orderTrackingId,
            amount: paymentData.amount,
            currency: paymentData.currency
          }
        }
      }

      // If not in localStorage, check with PesaPal API
      const token = await this.getAccessToken()
      const response = await fetch(`${this.baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${merchantReference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        status: this.mapPesapalStatus(data.payment_status_description),
        orderTrackingId: data.order_tracking_id,
        amount: data.amount,
        currency: data.currency
      }

    } catch (error) {
      console.error('Failed to check payment status:', error)
      return {
        status: 'pending'
      }
    }
  }

  /**
   * Map PesaPal status to our internal status
   */
  private mapPesapalStatus(pesapalStatus: string): 'pending' | 'completed' | 'failed' | 'cancelled' {
    switch (pesapalStatus?.toUpperCase()) {
      case 'COMPLETED':
        return 'completed'
      case 'FAILED':
        return 'failed'
      case 'CANCELLED':
        return 'cancelled'
      default:
        return 'pending'
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'KES'): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Get payment method display name
   */
  getPaymentMethodName(method: string): string {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa'
      case 'airtel_money':
        return 'Airtel Money'
      case 'equitel':
        return 'Equitel'
      default:
        return method
    }
  }
}

// Export singleton instance
export const pesapalPaymentLinkGenerator = new PesaPalPaymentLinkGenerator()

export default PesaPalPaymentLinkGenerator

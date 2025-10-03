// Loanhub PesaPal Payment Service
// Production-ready PesaPal integration for loan payments

export interface LoanPaymentData {
  customerPhone: string
  loanAmount: number
  loanReference: string
  paymentType: 'repayment' | 'application_fee' | 'late_fee' | 'processing_fee'
  customerName: string
  customerEmail?: string
  description?: string
}

export interface LoanPaymentResponse {
  error: string | null
  ipn_id: string
  merchant_reference: string
  mobile_optimized: boolean
  order_id: string
  order_tracking_id: string
  payment_method: string
  redirect_url: string
  status: string
  loan_reference: string
}

export interface PaymentStatus {
  order_tracking_id: string
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED'
  payment_method: string
  amount: number
  currency: string
  created_date: string
  payment_account: string
  payment_reference: string
  description: string
  message: string
  payment_account_provider: string
}

class LoanhubPesapalService {
  private readonly BASE_URL = 'https://pay.pesapal.com/v3'
  private readonly CONSUMER_KEY = 'x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL'
  private readonly CONSUMER_SECRET = 'Q9twNwMHt8a03lFfODhnteP9fnY='
  private readonly CALLBACK_URL = 'https://loanhub.com/pesapal/callback'
  private readonly IPN_URL = 'https://loanhub.com/pesapal/ipn'
  
  private accessToken: string | null = null
  private tokenExpiry: number | null = null
  private ipnId: string | null = null

  constructor() {
    console.log('🏦 Loanhub PesaPal Service initialized')
    console.log('🔑 Using production credentials')
    console.log('📱 Mobile-optimized loan payments enabled')
  }

  /**
   * Get fresh access token from PesaPal API
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      console.log('🔐 Requesting fresh PesaPal access token...')
      
      const authData = {
        consumer_key: this.CONSUMER_KEY,
        consumer_secret: this.CONSUMER_SECRET
      }

      const response = await fetch(`${this.BASE_URL}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(authData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ PesaPal token request failed:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.token) {
        this.accessToken = data.token
        // Set token expiry to 1 hour from now
        this.tokenExpiry = Date.now() + (60 * 60 * 1000)
        console.log('✅ PesaPal access token obtained successfully')
        return this.accessToken
      } else {
        throw new Error('No token received from PesaPal')
      }
    } catch (error) {
      console.error('❌ Failed to get PesaPal access token:', error)
      throw new Error('Failed to get access token from PesaPal')
    }
  }

  /**
   * Register IPN (Instant Payment Notification) for loan payments
   */
  private async registerIPN(): Promise<string> {
    if (this.ipnId) {
      return this.ipnId
    }

    try {
      console.log('📡 Registering IPN for loan payments...')
      
      const token = await this.getAccessToken()
      
      const ipnData = {
        url: this.IPN_URL,
        ipn_notification_type: 'GET'
      }

      const response = await fetch(`${this.BASE_URL}/api/URLSetup/RegisterIPN`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ipnData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ IPN registration failed:', errorText)
        throw new Error(`IPN registration failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.ipn_id) {
        this.ipnId = data.ipn_id
        console.log('✅ IPN registered successfully:', this.ipnId)
        return this.ipnId
      } else {
        throw new Error('No IPN ID received')
      }
    } catch (error) {
      console.error('❌ Failed to register IPN:', error)
      throw new Error('Failed to register IPN')
    }
  }

  /**
   * Generate unique loan reference number
   */
  private generateLoanReference(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `LH${timestamp}_${random}`
  }

  /**
   * Format Kenyan phone number
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Handle different formats
    if (cleaned.startsWith('254')) {
      return `+${cleaned}`
    } else if (cleaned.startsWith('0')) {
      return `+254${cleaned.substring(1)}`
    } else if (cleaned.length === 9) {
      return `+254${cleaned}`
    } else {
      return `+254${cleaned}`
    }
  }

  /**
   * Get payment type description
   */
  private getPaymentDescription(paymentType: string, loanReference: string): string {
    const descriptions = {
      repayment: `Loan Repayment - Reference: ${loanReference}`,
      application_fee: `Loan Application Fee - Reference: ${loanReference}`,
      late_fee: `Late Payment Fee - Reference: ${loanReference}`,
      processing_fee: `Loan Processing Fee - Reference: ${loanReference}`
    }
    return descriptions[paymentType as keyof typeof descriptions] || `Loan Payment - Reference: ${loanReference}`
  }

  /**
   * Process loan payment with PesaPal
   */
  async processLoanPayment(paymentData: LoanPaymentData): Promise<LoanPaymentResponse> {
    try {
      console.log('🏦 Processing loan payment:', paymentData)
      
      const token = await this.getAccessToken()
      const ipnId = await this.registerIPN()
      
      const orderId = this.generateLoanReference()
      const formattedPhone = this.formatPhoneNumber(paymentData.customerPhone)
      const description = paymentData.description || this.getPaymentDescription(paymentData.paymentType, paymentData.loanReference)

      const loanPaymentData = {
        id: orderId,
        currency: 'KES',
        amount: paymentData.loanAmount,
        description: description,
        callback_url: this.CALLBACK_URL,
        notification_id: ipnId,
        redirect_mode: 'MOBILE', // Mobile-optimized for loan payments
        billing_address: {
          phone_number: formattedPhone,
          email_address: paymentData.customerEmail || 'customer@loanhub.com',
          country_code: 'KE',
          first_name: paymentData.customerName.split(' ')[0] || 'Customer',
          last_name: paymentData.customerName.split(' ')[1] || 'Name',
          line_1: 'Nairobi',
          city: 'Nairobi',
          state: 'Nairobi',
          postal_code: '00100'
        }
      }

      console.log('📱 Creating mobile-optimized loan payment URL...')

      const response = await fetch(`${this.BASE_URL}/api/Transactions/SubmitOrderRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(loanPaymentData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Loan payment request failed:', errorText)
        throw new Error(`Loan payment failed: ${response.status}`)
      }

      const data = await response.json()
      
      const result: LoanPaymentResponse = {
        error: null,
        ipn_id: ipnId,
        merchant_reference: orderId,
        mobile_optimized: true,
        order_id: orderId,
        order_tracking_id: data.order_tracking_id || orderId,
        payment_method: 'Mobile M-PESA Loan Payment',
        redirect_url: data.redirect_url || `${this.BASE_URL}/iframe/PesapalIframe3/Index?OrderTrackingId=${data.order_tracking_id}`,
        status: '200',
        loan_reference: paymentData.loanReference
      }

      console.log('✅ Loan payment URL created successfully:', result)
      return result

    } catch (error) {
      console.error('❌ Loan payment processing failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        ipn_id: '',
        merchant_reference: '',
        mobile_optimized: false,
        order_id: '',
        order_tracking_id: '',
        payment_method: '',
        redirect_url: '',
        status: '500',
        loan_reference: paymentData.loanReference
      }
    }
  }

  /**
   * Check loan payment status
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null> {
    try {
      console.log('🔍 Checking loan payment status:', orderTrackingId)
      
      const token = await this.getAccessToken()

      const response = await fetch(`${this.BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        console.error('❌ Payment status check failed:', response.status)
        return null
      }

      const data = await response.json()
      
      if (data.payment_status) {
        console.log('✅ Payment status retrieved:', data.payment_status)
        return data as PaymentStatus
      } else {
        console.log('⚠️ No payment status found')
        return null
      }
    } catch (error) {
      console.error('❌ Failed to check payment status:', error)
      return null
    }
  }

  /**
   * Test authentication with PesaPal
   */
  async testAuth(): Promise<boolean> {
    try {
      console.log('🧪 Testing PesaPal authentication...')
      const token = await this.getAccessToken()
      console.log('✅ Authentication test successful')
      return true
    } catch (error) {
      console.error('❌ Authentication test failed:', error)
      return false
    }
  }

  /**
   * Get service information
   */
  getServiceInfo() {
    return {
      service: 'Loanhub PesaPal',
      environment: 'Production',
      baseUrl: this.BASE_URL,
      mobileOptimized: true,
      supportedMethods: ['M-PESA', 'Airtel Money', 'Equitel'],
      loanPaymentTypes: ['repayment', 'application_fee', 'late_fee', 'processing_fee']
    }
  }
}

// Export singleton instance
export const loanhubPesapalService = new LoanhubPesapalService()
export default loanhubPesapalService

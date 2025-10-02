// Pesapal URL-based Payment Service
// This service creates payment URLs that can be opened in new tabs/windows
import CryptoJS from 'crypto-js'
import { mockPaymentService } from './mock-payment-service'

export interface PaymentRequest {
  loanId: string
  userId: string
  amount: number
  phoneNumber: string
  paymentMethod: 'mpesa' | 'airtel_money' | 'equitel'
  description: string
}

export interface PaymentResponse {
  success: boolean
  paymentId?: string
  orderTrackingId?: string
  merchantReference?: string
  paymentUrl?: string
  message?: string
  error?: string
}

export interface PaymentStatus {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired'
  paymentMethod: string
  phoneNumber: string
  created_at: string
  paid_at?: string
  expires_at?: string
}

class PesapalURLService {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number | null = null
  private isDevelopment: boolean

  constructor() {
    // Use environment variables for credentials
    this.baseUrl = process.env.NEXT_PUBLIC_PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3/api'
    this.consumerKey = process.env.PESAPAL_CONSUMER_KEY || 'x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL'
    this.consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || 'Q9twNwMHt8a03lFfODhnteP9fnY='
    
    // Check if we should use mock service (for development)
    this.isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    if (this.isDevelopment) {
      console.log('Development environment detected - using mock service')
    }
  }

  /**
   * Get OAuth access token from Pesapal
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      // Use server-side API route to get token (avoids CORS issues)
      const response = await fetch('/api/pesapal/token', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Pesapal token response error:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.token) {
        this.accessToken = data.token
        // Set token expiry to 55 minutes (tokens expire in 1 hour)
        this.tokenExpiry = Date.now() + (55 * 60 * 1000)
        return this.accessToken!
      } else {
        throw new Error('Invalid response from Pesapal token endpoint')
      }
    } catch (error) {
      console.error('Failed to get Pesapal access token:', error)
      console.log('This is expected in development. The application will use the mock service instead.')
      throw new Error('Failed to get access token from Pesapal')
    }
  }

  /**
   * Generate OAuth 1.0a header for Pesapal API
   */
  private generateOAuthHeader(method: string, url: string): string {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonce = Math.random().toString(36).substring(2, 15)
    
    // OAuth 1.0a parameters
    const oauthParams = {
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0'
    }

    // Create signature base string
    const paramString = Object.keys(oauthParams)
      .sort()
      .map(key => `${key}=${encodeURIComponent(oauthParams[key as keyof typeof oauthParams])}`)
      .join('&')
    
    const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`
    
    // Create signature
    const signingKey = `${encodeURIComponent(this.consumerSecret)}&`
    const signature = this.hmacSha1(signatureBaseString, signingKey)
    
    // Build OAuth header
    const oauthHeader = `OAuth oauth_consumer_key="${this.consumerKey}", oauth_nonce="${nonce}", oauth_signature="${signature}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_version="1.0"`
    
    return oauthHeader
  }

  /**
   * HMAC-SHA1 implementation for OAuth signature
   */
  private hmacSha1(message: string, key: string): string {
    return CryptoJS.HmacSHA1(message, key).toString(CryptoJS.enc.Base64)
  }

  /**
   * Generate merchant reference
   */
  private generateMerchantReference(prefix: string = 'PROC'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}_${timestamp}_${random}`
  }

  /**
   * Create payment URL for STK Push
   */
  async createPaymentURL(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Use mock service in development mode
      if (this.isDevelopment) {
        console.log('Using mock payment service for URL creation')
        const mockResponse = await mockPaymentService.initiateSTKPush(paymentRequest)
        
        return {
          success: true,
          paymentId: mockResponse.paymentId,
          orderTrackingId: mockResponse.orderTrackingId,
          merchantReference: mockResponse.merchantReference,
          paymentUrl: paymentRequest.amount > 100 ? `/mock-payment-window?paymentId=${mockResponse.paymentId}` : undefined,
          message: mockResponse.message
        }
      }

      const token = await this.getAccessToken()
      const merchantReference = this.generateMerchantReference('PROC')

      const orderData = {
        id: merchantReference,
        currency: 'KES',
        amount: paymentRequest.amount,
        description: paymentRequest.description,
        callback_url: `${window.location.origin}/payment/callback`,
        notification_id: merchantReference,
        billing_address: {
          phone_number: paymentRequest.phoneNumber,
          email_address: 'user@example.com',
          country_code: 'KE',
          first_name: 'User',
          middle_name: '',
          last_name: 'Name',
          line_1: 'Nairobi, Kenya',
          line_2: '',
          city: 'Nairobi',
          state: 'Nairobi',
          postal_code: '',
          zip_code: ''
        }
      }

      const response = await fetch('/api/pesapal/create-payment-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Payment URL creation error:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Store payment data in localStorage for tracking
      const paymentData = {
        paymentId: merchantReference,
        orderTrackingId: data.order_tracking_id,
        amount: paymentRequest.amount,
        phoneNumber: paymentRequest.phoneNumber,
        paymentMethod: paymentRequest.paymentMethod,
        loanId: paymentRequest.loanId,
        userId: paymentRequest.userId,
        status: 'pending',
        initiatedAt: new Date().toISOString()
      }

      localStorage.setItem(`payment_${merchantReference}`, JSON.stringify(paymentData))

      return {
        success: true,
        paymentId: merchantReference,
        orderTrackingId: data.order_tracking_id,
        merchantReference: merchantReference,
        paymentUrl: data.redirect_url,
        message: 'Payment URL created successfully. Click to open payment page.'
      }

    } catch (error: any) {
      console.error('Payment URL creation failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to create payment URL'
      }
    }
  }

  /**
   * Redirect to one-time payment page
   */
  openPaymentURL(paymentUrl: string): void {
    if (typeof window !== 'undefined') {
      console.log('Redirecting to one-time payment page:', paymentUrl)
      
      // Redirect to the one-time payment page
      window.location.href = paymentUrl
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null> {
    try {
      // Use mock service in development mode
      if (this.isDevelopment) {
        console.log('Using mock payment service for status check')
        const mockStatus = await mockPaymentService.checkPaymentStatus(orderTrackingId)
        if (mockStatus) {
          return {
            id: mockStatus.id,
            amount: mockStatus.amount,
            currency: mockStatus.currency,
            status: mockStatus.status,
            paymentMethod: mockStatus.paymentMethod,
            phoneNumber: mockStatus.phoneNumber,
            created_at: mockStatus.created_at,
            paid_at: mockStatus.paid_at,
            expires_at: mockStatus.expires_at
          }
        }
        return null
      }

      const token = await this.getAccessToken()

      const response = await fetch(`/api/pesapal/payment-status?orderTrackingId=${orderTrackingId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        id: orderTrackingId,
        amount: data.amount || 0,
        currency: data.currency || 'KES',
        status: this.mapPesapalStatus(data.payment_status_description),
        paymentMethod: data.payment_method || 'unknown',
        phoneNumber: data.phone_number || '',
        created_at: data.created_at || new Date().toISOString(),
        paid_at: data.paid_at,
        expires_at: data.expires_at
      }

    } catch (error) {
      console.error('Failed to check payment status:', error)
      return null
    }
  }

  /**
   * Map Pesapal status to our internal status
   */
  private mapPesapalStatus(pesapalStatus: string): PaymentStatus['status'] {
    switch (pesapalStatus?.toUpperCase()) {
      case 'COMPLETED':
        return 'completed'
      case 'FAILED':
        return 'failed'
      case 'PENDING':
        return 'pending'
      case 'CANCELLED':
        return 'cancelled'
      case 'EXPIRED':
        return 'expired'
      default:
        return 'pending'
    }
  }

  /**
   * Poll payment status until completion or timeout
   */
  async pollPaymentStatus(
    orderTrackingId: string,
    onStatusUpdate: (status: PaymentStatus) => void,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<PaymentStatus | null> {
    const startTime = Date.now()
    const pollInterval = 10000 // Poll every 10 seconds

    return new Promise((resolve) => {
      const poll = async () => {
        try {
          const status = await this.checkPaymentStatus(orderTrackingId)
          
          if (status) {
            onStatusUpdate(status)
            
            if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
              resolve(status)
              return
            }
          }

          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            resolve(null)
            return
          }

          // Continue polling
          setTimeout(poll, pollInterval)
        } catch (error) {
          console.error('Error polling payment status:', error)
          setTimeout(poll, pollInterval)
        }
      }

      // Start polling
      poll()
    })
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^(\+254|0)[0-9]{9}$/
    return phoneRegex.test(phoneNumber)
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
export const pesapalURLService = new PesapalURLService()

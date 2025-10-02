// Pesapal STK Push Service for Processing Fee Payments
import { toast } from 'react-hot-toast'
import CryptoJS from 'crypto-js'
import { mockPaymentService, MockPaymentRequest, MockPaymentResponse } from './mock-payment-service'

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
  redirectUrl?: string
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

class PesapalService {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number | null = null
  private isDevelopment: boolean

  constructor() {
    // Use production URL for production, sandbox for development
    this.baseUrl = process.env.PESAPAL_BASE_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://pay.pesapal.com/pesapalapi/api' 
        : 'https://cybqa.pesapal.com/pesapalapi/api')
    
    this.consumerKey = process.env.PESAPAL_CONSUMER_KEY || 'x8Laqe3NN5ZwIMFFeQgd4lwSJhHwwDXL'
    this.consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || 'Q9twNwMHt8a03lFfODhnteP9fnY='
    this.isDevelopment = process.env.NODE_ENV === 'development'
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
      // Pesapal uses OAuth 1.0a for authentication
      const authHeader = this.generateOAuthHeader('GET', `${this.baseUrl}/Auth/RequestToken`)
      
      const response = await fetch(`${this.baseUrl}/Auth/RequestToken`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
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
   * Initiate STK Push payment
   */
  async initiateSTKPush(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Use mock service in development mode
      if (this.isDevelopment) {
        console.log('Using mock payment service for development')
        const mockRequest: MockPaymentRequest = {
          loanId: paymentRequest.loanId,
          userId: paymentRequest.userId,
          amount: paymentRequest.amount,
          phoneNumber: paymentRequest.phoneNumber,
          paymentMethod: paymentRequest.paymentMethod,
          description: paymentRequest.description
        }
        
        const mockResponse = await mockPaymentService.initiateSTKPush(mockRequest)
        
        return {
          success: mockResponse.success,
          paymentId: mockResponse.paymentId,
          orderTrackingId: mockResponse.orderTrackingId,
          merchantReference: mockResponse.merchantReference,
          redirectUrl: mockResponse.redirectUrl,
          message: mockResponse.message,
          error: mockResponse.error
        }
      }

      // Use real PesaPal API in production
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
          email_address: 'user@example.com', // You might want to get this from user data
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
        console.error('STK Push response error:', errorText)
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
        redirectUrl: data.redirect_url,
        message: 'STK Push initiated successfully. Please check your phone and enter your PIN.'
      }

    } catch (error: any) {
      console.error('STK Push initiation failed:', error)
      
      // Fallback to mock service if PesaPal fails
      if (!this.isDevelopment) {
        console.log('PesaPal failed, falling back to mock service')
        try {
          const mockRequest: MockPaymentRequest = {
            loanId: paymentRequest.loanId,
            userId: paymentRequest.userId,
            amount: paymentRequest.amount,
            phoneNumber: paymentRequest.phoneNumber,
            paymentMethod: paymentRequest.paymentMethod,
            description: paymentRequest.description
          }
          
          const mockResponse = await mockPaymentService.initiateSTKPush(mockRequest)
          
          return {
            success: mockResponse.success,
            paymentId: mockResponse.paymentId,
            orderTrackingId: mockResponse.orderTrackingId,
            merchantReference: mockResponse.merchantReference,
            redirectUrl: mockResponse.redirectUrl,
            message: mockResponse.message + ' (Fallback mode)',
            error: mockResponse.error
          }
        } catch (mockError) {
          console.error('Mock service also failed:', mockError)
        }
      }
      
      return {
        success: false,
        error: error.message || 'Failed to initiate STK Push payment'
      }
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null> {
    try {
      // Use mock service in development mode
      if (this.isDevelopment) {
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

      // Use real PesaPal API in production
      const token = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
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
      
      // Fallback to mock service if PesaPal fails
      if (!this.isDevelopment) {
        console.log('PesaPal failed, falling back to mock service for status check')
        try {
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
        } catch (mockError) {
          console.error('Mock service also failed for status check:', mockError)
        }
      }
      
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
    // Use mock service in development mode
    if (this.isDevelopment) {
      return mockPaymentService.pollPaymentStatus(
        orderTrackingId,
        (mockStatus) => {
          const status: PaymentStatus = {
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
          onStatusUpdate(status)
        },
        timeoutMs
      ).then(mockStatus => {
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
      })
    }

    // Use real PesaPal API in production
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
export const pesapalService = new PesapalService()

// Types are already exported above

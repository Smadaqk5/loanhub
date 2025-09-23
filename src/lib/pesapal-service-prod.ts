// Production Pesapal STK Push Service
import CryptoJS from 'crypto-js'

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

class ProductionPesapalService {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    // Use environment variables for credentials
    this.baseUrl = process.env.NEXT_PUBLIC_PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3/api'
    this.consumerKey = process.env.PESAPAL_CONSUMER_KEY || 'k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx'
    this.consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || 'Tjg4VodFyn1ur9aDMo1fsJvgHQQ='
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
      // Pesapal v3 uses POST with JSON body for token request
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
        console.error('Pesapal token response error:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
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
    const oauthParams: { [key: string]: string } = {
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0'
    }

    // Create signature base string
    const paramString = Object.keys(oauthParams)
      .sort()
      .map(key => `${key}=${encodeURIComponent(oauthParams[key])}`)
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
      const token = await this.getAccessToken()
      const merchantReference = this.generateMerchantReference('PROC')

      // Create STK Push request data
      const stkPushData = {
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
          line_1: 'Nairobi',
          line_2: '',
          city: 'Nairobi',
          state: 'Nairobi',
          postal_code: '00100',
          zip_code: '00100',
        },
      }

      console.log('Sending STK Push request:', JSON.stringify(stkPushData, null, 2))

      const response = await fetch(`${this.baseUrl}/Transactions/SubmitOrderRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(stkPushData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('STK Push request failed:', errorText)
        throw new Error(`STK Push failed: ${errorText}`)
      }

      const result = await response.json()
      console.log('STK Push response:', JSON.stringify(result, null, 2))

      // Store payment data in localStorage for tracking
      const paymentData = {
        paymentId: result.order_tracking_id,
        orderTrackingId: result.order_tracking_id,
        merchantReference: merchantReference,
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
        paymentId: result.order_tracking_id,
        orderTrackingId: result.order_tracking_id,
        merchantReference: merchantReference,
        message: 'STK Push initiated successfully. Please check your phone and enter your PIN.'
      }
    } catch (error: any) {
      console.error('STK Push error:', error)
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
      const token = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Payment status check failed:', response.status, await response.text())
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Payment status response:', data)

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
export const pesapalService = new ProductionPesapalService()

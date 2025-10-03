// Clean STK Push Service Implementation
import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus, 
  STKPushRequest, 
  STKPushResponse,
  PaymentConfig,
  PaymentService 
} from '@/types/payment'

class STKPushService implements PaymentService {
  private config: PaymentConfig
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  constructor(config?: Partial<PaymentConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.PESAPAL_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://pay.pesapal.com/pesapalapi/api' 
          : 'https://cybqa.pesapal.com/pesapalapi/api'),
      consumerKey: config?.consumerKey || process.env.PESAPAL_CONSUMER_KEY || '',
      consumerSecret: config?.consumerSecret || process.env.PESAPAL_CONSUMER_SECRET || '',
      environment: config?.environment || (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox')
    }

    // Validate production credentials
    if (this.config.environment === 'production') {
      if (!this.config.consumerKey || !this.config.consumerSecret) {
        console.warn('⚠️ Production mode detected but PesaPal credentials missing. Using sandbox mode.')
        this.config.environment = 'sandbox'
        this.config.baseUrl = 'https://cybqa.pesapal.com/pesapalapi/api'
      } else {
        console.log('🚀 Production mode enabled with PesaPal credentials')
      }
    }
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64')
      
      const response = await fetch(`${this.config.baseUrl}/Auth/RequestToken`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          consumer_key: this.config.consumerKey,
          consumer_secret: this.config.consumerSecret
        })
      })

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.token) {
        this.accessToken = data.token
        this.tokenExpiry = Date.now() + (55 * 60 * 1000) // 55 minutes
        return this.accessToken
      }
      
      throw new Error('Invalid token response')
    } catch (error) {
      console.error('Failed to get access token:', error)
      throw new Error('Authentication failed')
    }
  }

  /**
   * Generate timestamp for PesaPal API
   */
  private generateTimestamp(): string {
    return new Date().toISOString().replace(/[:\-T]/g, '').split('.')[0]
  }

  /**
   * Format phone number for PesaPal
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    // Convert to 254 format if needed
    if (cleaned.startsWith('0')) {
      return `254${cleaned.substring(1)}`
    } else if (cleaned.startsWith('254')) {
      return cleaned
    } else {
      return `254${cleaned}`
    }
  }

  /**
   * Initiate PesaPal payment
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const token = await this.getAccessToken()
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber)

      // Create payment order data for PesaPal
      const orderData = {
        id: request.id,
        currency: request.currency,
        amount: request.amount,
        description: request.description,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/callback`,
        notification_id: request.id,
        billing_address: {
          phone_number: formattedPhone,
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

      const response = await fetch(`${this.config.baseUrl}/Transactions/SubmitOrderRequest`, {
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
        throw new Error(`PesaPal payment failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      return {
        success: true,
        paymentId: request.id,
        orderTrackingId: data.order_tracking_id || request.id,
        merchantReference: request.id,
        status: 'pending',
        message: 'Payment initiated successfully. Please check your phone and enter your PIN.'
      }

    } catch (error) {
      console.error('Payment initiation failed:', error)
      return {
        success: false,
        paymentId: request.id,
        orderTrackingId: request.id,
        merchantReference: request.id,
        status: 'failed',
        message: 'Payment initiation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${this.config.baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`)
      }

      const data = await response.json()

      return {
        id: orderTrackingId,
        orderTrackingId: orderTrackingId,
        status: this.mapPaymentStatus(data.payment_status),
        amount: data.amount || 0,
        currency: data.currency || 'KES',
        phoneNumber: data.phone_number || '',
        paymentMethod: data.payment_method || 'mpesa',
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: data.paid_at,
        failedAt: data.failed_at,
        expiresAt: data.expires_at || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        errorMessage: data.error_message
      }

    } catch (error) {
      console.error('Status check failed:', error)
      return null
    }
  }

  /**
   * Poll payment status with real-time updates
   */
  async pollPaymentStatus(
    orderTrackingId: string, 
    onUpdate: (status: PaymentStatus) => void,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<PaymentStatus | null> {
    const startTime = Date.now()
    const pollInterval = 5000 // Poll every 5 seconds

    return new Promise((resolve) => {
      const poll = async () => {
        try {
          const status = await this.checkPaymentStatus(orderTrackingId)
          
          if (status) {
            onUpdate(status)
            
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
          console.error('Polling error:', error)
          resolve(null)
        }
      }

      // Start polling
      poll()
    })
  }

  /**
   * Cancel payment
   */
  async cancelPayment(orderTrackingId: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${this.config.baseUrl}/Transactions/CancelTransaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          orderTrackingId: orderTrackingId
        })
      })

      return response.ok
    } catch (error) {
      console.error('Cancel payment failed:', error)
      return false
    }
  }

  /**
   * Map PesaPal status to our status
   */
  private mapPaymentStatus(pesapalStatus: string): PaymentStatus['status'] {
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
}

// Export singleton instance
export const stkPushService = new STKPushService()
export { STKPushService }

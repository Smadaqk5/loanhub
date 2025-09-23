// Enhanced Pesapal STK Push Service with Better Error Handling
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

class EnhancedPesapalService {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number | null = null
  private maxRetries: number = 3
  private retryDelay: number = 1000

  constructor() {
    // Use sandbox credentials for development/testing
    this.baseUrl = 'https://cybqa.pesapal.com/pesapalv3/api'
    this.consumerKey = 'k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx'
    this.consumerSecret = 'Tjg4VodFyn1ur9aDMo1fsJvgHQQ='
  }

  /**
   * Enhanced phone number validation
   */
  private validatePhoneNumber(phoneNumber: string): { isValid: boolean; normalized: string; error?: string } {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')
    
    // Check if it's a valid Kenyan phone number
    const kenyanPattern = /^(\+254|254|0)[0-9]{9}$/
    
    if (!kenyanPattern.test(cleaned)) {
      return {
        isValid: false,
        normalized: cleaned,
        error: 'Invalid Kenyan phone number format. Use +254XXXXXXXXX, 254XXXXXXXXX, or 0XXXXXXXXX'
      }
    }

    // Normalize to +254 format
    let normalized = cleaned
    if (cleaned.startsWith('0')) {
      normalized = '+254' + cleaned.substring(1)
    } else if (cleaned.startsWith('254')) {
      normalized = '+' + cleaned
    }

    return {
      isValid: true,
      normalized
    }
  }

  /**
   * Enhanced retry mechanism with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`${operationName} - Attempt ${attempt}/${maxRetries}`)
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.warn(`${operationName} - Attempt ${attempt} failed:`, error)
        
        if (attempt < maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
          console.log(`Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw new Error(`${operationName} failed after ${maxRetries} attempts. Last error: ${lastError?.message}`)
  }

  /**
   * Enhanced access token retrieval with retry logic
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    return this.retryOperation(async () => {
      console.log('Requesting new access token from Pesapal...')
      
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
        console.error('Token request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`Token request failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (!data.token) {
        throw new Error('No access token received from Pesapal')
      }

      this.accessToken = data.token
      // Set token expiry to 55 minutes (tokens expire in 1 hour)
      this.tokenExpiry = Date.now() + (55 * 60 * 1000)
      
      console.log('Access token obtained successfully')
      return this.accessToken
    }, 'Get Access Token')
  }

  /**
   * Generate merchant reference with better uniqueness
   */
  private generateMerchantReference(prefix: string = 'PROC'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const counter = Math.floor(Math.random() * 1000)
    return `${prefix}_${timestamp}_${random}_${counter}`
  }

  /**
   * Enhanced STK Push initiation with better error handling
   */
  async initiateSTKPush(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate phone number
      const phoneValidation = this.validatePhoneNumber(paymentRequest.phoneNumber)
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: phoneValidation.error
        }
      }

      // Validate amount
      if (paymentRequest.amount <= 0) {
        return {
          success: false,
          error: 'Payment amount must be greater than 0'
        }
      }

      if (paymentRequest.amount > 150000) {
        return {
          success: false,
          error: 'Payment amount exceeds maximum limit of KES 150,000'
        }
      }

      console.log('Initiating STK Push with enhanced service...', {
        amount: paymentRequest.amount,
        phone: phoneValidation.normalized,
        method: paymentRequest.paymentMethod
      })

      return this.retryOperation(async () => {
        const token = await this.getAccessToken()
        const merchantReference = this.generateMerchantReference('STK')

        // Create enhanced STK Push request data
        const stkPushData = {
          id: merchantReference,
          currency: 'KES',
          amount: paymentRequest.amount,
          description: paymentRequest.description,
          callback_url: `${window.location.origin}/payment/callback`,
          notification_id: merchantReference,
          billing_address: {
            phone_number: phoneValidation.normalized,
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

        console.log('Sending enhanced STK Push request:', JSON.stringify(stkPushData, null, 2))

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
          console.error('STK Push request failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          })
          throw new Error(`STK Push failed: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log('STK Push response:', JSON.stringify(result, null, 2))

        if (!result.order_tracking_id) {
          throw new Error('No order tracking ID received from Pesapal')
        }

        // Store payment data in localStorage for tracking
        const paymentData = {
          paymentId: result.order_tracking_id,
          orderTrackingId: result.order_tracking_id,
          merchantReference: merchantReference,
          amount: paymentRequest.amount,
          phoneNumber: phoneValidation.normalized,
          paymentMethod: paymentRequest.paymentMethod,
          loanId: paymentRequest.loanId,
          userId: paymentRequest.userId,
          status: 'pending',
          initiatedAt: new Date().toISOString(),
          service: 'enhanced'
        }

        localStorage.setItem(`payment_${merchantReference}`, JSON.stringify(paymentData))

        return {
          success: true,
          paymentId: result.order_tracking_id,
          orderTrackingId: result.order_tracking_id,
          merchantReference: merchantReference,
          message: 'STK Push initiated successfully. Please check your phone and enter your PIN.'
        }
      }, 'Initiate STK Push')

    } catch (error: any) {
      console.error('Enhanced STK Push error:', error)
      return {
        success: false,
        error: error.message || 'Failed to initiate STK Push payment'
      }
    }
  }

  /**
   * Enhanced payment status checking
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null> {
    try {
      return this.retryOperation(async () => {
        const token = await this.getAccessToken()

        const response = await fetch(`${this.baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          console.error('Payment status check failed:', {
            status: response.status,
            statusText: response.statusText
          })
          throw new Error(`Status check failed: ${response.status}`)
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
      }, 'Check Payment Status')
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
   * Enhanced polling with better error handling
   */
  async pollPaymentStatus(
    orderTrackingId: string,
    onStatusUpdate: (status: PaymentStatus) => void,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<PaymentStatus | null> {
    const startTime = Date.now()
    const pollInterval = 10000 // Poll every 10 seconds
    let consecutiveErrors = 0
    const maxConsecutiveErrors = 3

    return new Promise((resolve) => {
      const poll = async () => {
        try {
          const status = await this.checkPaymentStatus(orderTrackingId)
          
          if (status) {
            consecutiveErrors = 0 // Reset error counter on success
            onStatusUpdate(status)
            
            if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
              resolve(status)
              return
            }
          } else {
            consecutiveErrors++
            console.warn(`Payment status check returned null (attempt ${consecutiveErrors})`)
          }

          // Check for too many consecutive errors
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.error('Too many consecutive errors, stopping polling')
            resolve(null)
            return
          }

          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            console.warn('Payment polling timeout reached')
            resolve(null)
            return
          }

          // Continue polling
          setTimeout(poll, pollInterval)
        } catch (error) {
          consecutiveErrors++
          console.error(`Error polling payment status (attempt ${consecutiveErrors}):`, error)
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.error('Too many consecutive errors, stopping polling')
            resolve(null)
            return
          }
          
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

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    isHealthy: boolean
    lastError?: string
    tokenValid: boolean
    tokenExpiry?: number
  }> {
    try {
      const token = await this.getAccessToken()
      return {
        isHealthy: true,
        tokenValid: true,
        tokenExpiry: this.tokenExpiry
      }
    } catch (error) {
      return {
        isHealthy: false,
        lastError: (error as Error).message,
        tokenValid: false
      }
    }
  }
}

// Export singleton instance
export const enhancedPesapalService = new EnhancedPesapalService()

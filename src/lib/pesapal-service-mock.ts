// Mock Pesapal STK Push Service for Testing
import { toast } from 'react-hot-toast'

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

class MockPesapalService {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    // Mock credentials for testing
    this.baseUrl = 'https://cybqa.pesapal.com/pesapalapi/api'
    this.consumerKey = 'k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx'
    this.consumerSecret = 'Tjg4VodFyn1ur9aDMo1fsJvgHQQ='
  }

  /**
   * Mock OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock token
    this.accessToken = 'mock_access_token_' + Date.now()
    this.tokenExpiry = Date.now() + (55 * 60 * 1000) // 55 minutes
    
    return this.accessToken
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
   * Mock STK Push payment initiation
   */
  async initiateSTKPush(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      const token = await this.getAccessToken()
      const merchantReference = this.generateMerchantReference('PROC')
      const orderTrackingId = 'TRK_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase()

      // Store payment data in localStorage for tracking
      const paymentData = {
        paymentId: merchantReference,
        orderTrackingId: orderTrackingId,
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
        orderTrackingId: orderTrackingId,
        merchantReference: merchantReference,
        redirectUrl: `${window.location.origin}/payment/callback?OrderTrackingId=${orderTrackingId}&OrderMerchantReference=${merchantReference}`,
        message: 'STK Push initiated successfully. Please check your phone and enter your PIN.'
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to initiate STK Push payment'
      }
    }
  }

  /**
   * Mock payment status check
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null> {
    try {
      console.log('Mock: Checking payment status for:', orderTrackingId)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock status - randomly return different statuses for testing
      const statuses = ['pending', 'completed', 'failed'] as const
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      
      // For testing, let's make it more predictable
      const status = orderTrackingId.includes('TRK_') ? 'pending' : 'completed'

      const mockStatus: PaymentStatus = {
        id: orderTrackingId,
        amount: 500.00,
        currency: 'KES',
        status: status,
        paymentMethod: 'M-Pesa',
        phoneNumber: '+254700000000',
        created_at: new Date().toISOString(),
        paid_at: status === 'completed' ? new Date().toISOString() : undefined,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
      }

      console.log('Mock: Payment status:', mockStatus)
      return mockStatus

    } catch (error) {
      console.error('Mock: Failed to check payment status:', error)
      return null
    }
  }

  /**
   * Mock payment status polling with simulated completion
   */
  async pollPaymentStatus(
    orderTrackingId: string,
    onStatusUpdate: (status: PaymentStatus) => void,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<PaymentStatus | null> {
    const startTime = Date.now()
    const pollInterval = 10000 // Poll every 10 seconds
    let pollCount = 0

    return new Promise((resolve) => {
      const poll = async () => {
        try {
          pollCount++
          console.log(`Mock: Polling payment status (attempt ${pollCount}) for:`, orderTrackingId)
          
          const status = await this.checkPaymentStatus(orderTrackingId)
          
          if (status) {
            onStatusUpdate(status)
            
            // Simulate payment completion after 2-3 polls for testing
            if (pollCount >= 2 && status.status === 'pending') {
              const completedStatus: PaymentStatus = {
                ...status,
                status: 'completed',
                paid_at: new Date().toISOString()
              }
              onStatusUpdate(completedStatus)
              resolve(completedStatus)
              return
            }
            
            if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
              resolve(status)
              return
            }
          }

          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            console.log('Mock: Payment polling timeout')
            resolve(null)
            return
          }

          // Continue polling
          setTimeout(poll, pollInterval)
        } catch (error) {
          console.error('Mock: Error polling payment status:', error)
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
export const pesapalService = new MockPesapalService()

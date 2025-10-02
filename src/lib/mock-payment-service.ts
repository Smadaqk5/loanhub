// Mock Payment Service for Development
// This service simulates PesaPal functionality for testing and development

export interface MockPaymentRequest {
  loanId: string
  userId: string
  amount: number
  phoneNumber: string
  paymentMethod: 'mpesa' | 'airtel_money' | 'equitel'
  description: string
}

export interface MockPaymentResponse {
  success: boolean
  paymentId?: string
  orderTrackingId?: string
  merchantReference?: string
  redirectUrl?: string
  message?: string
  error?: string
}

export interface MockPaymentStatus {
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

class MockPaymentService {
  private baseUrl: string
  private isDevelopment: boolean

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * Generate mock payment ID
   */
  private generateMockPaymentId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `MOCK_${timestamp}_${random}`
  }

  /**
   * Generate mock order tracking ID
   */
  private generateMockOrderTrackingId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORDER_${timestamp}_${random}`
  }

  /**
   * Generate mock merchant reference
   */
  private generateMockMerchantReference(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `MERCHANT_${timestamp}_${random}`
  }

  /**
   * Simulate STK Push payment initiation
   */
  async initiateSTKPush(paymentRequest: MockPaymentRequest): Promise<MockPaymentResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const paymentId = this.generateMockPaymentId()
      const orderTrackingId = this.generateMockOrderTrackingId()
      const merchantReference = this.generateMockMerchantReference()

      // Simulate payment data storage
      const paymentData = {
        paymentId: paymentId,
        orderTrackingId: orderTrackingId,
        merchantReference: merchantReference,
        amount: paymentRequest.amount,
        phoneNumber: paymentRequest.phoneNumber,
        paymentMethod: paymentRequest.paymentMethod,
        loanId: paymentRequest.loanId,
        userId: paymentRequest.userId,
        status: 'pending',
        initiatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }

      // Store payment data (client-side storage will be handled by the client)
      console.log('Mock payment data created:', paymentData)

      // Simulate different outcomes based on amount
      let status: 'pending' | 'completed' | 'failed' = 'pending'
      let message = 'STK Push initiated successfully. Please check your phone and enter your PIN.'

      // For demo purposes, auto-complete small amounts
      if (paymentRequest.amount <= 100) {
        status = 'completed'
        message = 'Payment completed successfully! (Mock payment)'
        
        // Update payment data
        const completedPayment = {
          ...paymentData,
          status: 'completed',
          paidAt: new Date().toISOString()
        }
        
        console.log('Mock payment completed:', completedPayment)
      } else {
        // For larger amounts, simulate opening external window
        message = 'Payment window will open. Please complete payment in the opened window.'
        console.log('Mock payment window should open for payment:', paymentId)
      }

      return {
        success: true,
        paymentId: paymentId,
        orderTrackingId: orderTrackingId,
        merchantReference: merchantReference,
        redirectUrl: `${this.baseUrl}/payment/${paymentId}`,
        paymentUrl: paymentRequest.amount > 100 ? `/mock-payment-window?paymentId=${paymentId}` : undefined,
        message: message
      }

    } catch (error: any) {
      console.error('Mock STK Push initiation failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to initiate mock STK Push payment'
      }
    }
  }

  /**
   * Check mock payment status
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<MockPaymentStatus | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Try to find payment data in localStorage
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('payment_')) {
            const paymentData = localStorage.getItem(key)
            if (paymentData) {
              try {
                const data = JSON.parse(paymentData)
                if (data.orderTrackingId === orderTrackingId) {
                  return {
                    id: orderTrackingId,
                    amount: data.amount || 0,
                    currency: 'KES',
                    status: data.status || 'pending',
                    paymentMethod: data.paymentMethod || 'unknown',
                    phoneNumber: data.phoneNumber || '',
                    created_at: data.initiatedAt || new Date().toISOString(),
                    paid_at: data.paidAt,
                    expires_at: data.expiresAt
                  }
                }
              } catch (error) {
                console.error('Error parsing payment data:', error)
              }
            }
          }
        }
      }

      // Return mock status if not found
      return {
        id: orderTrackingId,
        amount: 500,
        currency: 'KES',
        status: 'pending',
        paymentMethod: 'mpesa',
        phoneNumber: '+254700000000',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }

    } catch (error) {
      console.error('Failed to check mock payment status:', error)
      return null
    }
  }

  /**
   * Poll mock payment status until completion or timeout
   */
  async pollPaymentStatus(
    orderTrackingId: string,
    onStatusUpdate: (status: MockPaymentStatus) => void,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<MockPaymentStatus | null> {
    const startTime = Date.now()
    const pollInterval = 5000 // Poll every 5 seconds

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
          console.error('Error polling mock payment status:', error)
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

  /**
   * Simulate payment completion (for testing)
   */
  async simulatePaymentCompletion(paymentId: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        const paymentData = localStorage.getItem(`payment_${paymentId}`)
        if (paymentData) {
          const data = JSON.parse(paymentData)
          const completedPayment = {
            ...data,
            status: 'completed',
            paidAt: new Date().toISOString()
          }
          localStorage.setItem(`payment_${paymentId}`, JSON.stringify(completedPayment))
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Failed to simulate payment completion:', error)
      return false
    }
  }
}

// Export singleton instance
export const mockPaymentService = new MockPaymentService()

export default MockPaymentService

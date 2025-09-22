// Mock Pesapal STK Push Service for Development/Testing
// This service simulates STK push behavior when the real API is not accessible

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

class MockPesapalSTKService {
  /**
   * Generate merchant reference
   */
  private generateMerchantReference(prefix: string = 'PROC'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}_${timestamp}_${random}`
  }

  /**
   * Initiate STK Push payment (Mock implementation)
   */
  async initiateSTKPush(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      const merchantReference = this.generateMerchantReference('PROC')
      const orderTrackingId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      // Store payment data in localStorage for tracking
      const paymentData = {
        paymentId: orderTrackingId,
        orderTrackingId: orderTrackingId,
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

      console.log('Mock STK Push initiated:', {
        merchantReference,
        orderTrackingId,
        amount: paymentRequest.amount,
        phoneNumber: paymentRequest.phoneNumber,
        paymentMethod: paymentRequest.paymentMethod
      })

      return {
        success: true,
        paymentId: orderTrackingId,
        orderTrackingId: orderTrackingId,
        merchantReference: merchantReference,
        message: 'Mock STK Push initiated successfully. This is a test environment - no actual payment will be processed.'
      }

    } catch (error: any) {
      console.error('Mock STK Push error:', error)
      return {
        success: false,
        error: error.message || 'Failed to initiate mock STK Push payment'
      }
    }
  }

  /**
   * Check payment status (Mock implementation)
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Find the payment data
      const storedPayment = Object.keys(localStorage)
        .filter(key => key.startsWith('payment_'))
        .map(key => JSON.parse(localStorage.getItem(key) || '{}'))
        .find(payment => payment.orderTrackingId === orderTrackingId)

      if (!storedPayment) {
        return null
      }

      const timeSinceInitiated = Date.now() - new Date(storedPayment.initiatedAt).getTime()
      
      // Simulate payment completion after 30 seconds
      let status: PaymentStatus['status'] = 'pending'
      if (timeSinceInitiated > 30000) {
        status = 'completed'
      }

      return {
        id: orderTrackingId,
        amount: storedPayment.amount,
        currency: 'KES',
        status: status,
        paymentMethod: storedPayment.paymentMethod,
        phoneNumber: storedPayment.phoneNumber,
        created_at: storedPayment.initiatedAt,
        paid_at: status === 'completed' ? new Date().toISOString() : undefined,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }

    } catch (error) {
      console.error('Failed to check mock payment status:', error)
      return null
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
}

// Export singleton instance
export const mockPesapalSTKService = new MockPesapalSTKService()
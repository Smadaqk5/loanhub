// Mock Pesapal URL Service for Development/Testing
// This service simulates the Pesapal API behavior when the real API is not accessible

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

class MockPesapalURLService {
  private baseUrl: string = 'https://cybqa.pesapal.com/pesapalv3/api'

  /**
   * Generate merchant reference
   */
  private generateMerchantReference(prefix: string = 'PROC'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}_${timestamp}_${random}`
  }

  /**
   * Create payment URL (Mock implementation)
   */
  async createPaymentURL(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const merchantReference = this.generateMerchantReference('PROC')
      const orderTrackingId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      // Generate a mock payment URL
      const mockPaymentUrl = `https://cybqa.pesapal.com/pesapalv3/api/checkout?order=${orderTrackingId}&merchant=${merchantReference}`

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

      console.log('Mock payment URL created:', {
        merchantReference,
        orderTrackingId,
        paymentUrl: mockPaymentUrl,
        amount: paymentRequest.amount,
        phoneNumber: paymentRequest.phoneNumber
      })

      return {
        success: true,
        paymentId: merchantReference,
        orderTrackingId: orderTrackingId,
        merchantReference: merchantReference,
        paymentUrl: mockPaymentUrl,
        message: 'Mock payment URL created successfully. This is a test environment.'
      }

    } catch (error: any) {
      console.error('Mock payment URL creation failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to create mock payment URL'
      }
    }
  }

  /**
   * Open payment URL in new window/tab
   */
  openPaymentURL(paymentUrl: string): void {
    if (typeof window !== 'undefined') {
      // Open in new window with specific dimensions
      const paymentWindow = window.open(
        paymentUrl,
        'pesapal_payment',
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes'
      )
      
      if (!paymentWindow) {
        // Fallback to new tab if popup is blocked
        window.open(paymentUrl, '_blank')
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

      // Mock status progression: pending -> completed (after 2-3 checks)
      const storedPayment = localStorage.getItem(`payment_${orderTrackingId.split('_')[1]}`)
      if (!storedPayment) {
        return null
      }

      const paymentData = JSON.parse(storedPayment)
      const timeSinceInitiated = Date.now() - new Date(paymentData.initiatedAt).getTime()
      
      // Simulate payment completion after 30 seconds
      let status: PaymentStatus['status'] = 'pending'
      if (timeSinceInitiated > 30000) {
        status = 'completed'
      }

      return {
        id: orderTrackingId,
        amount: paymentData.amount,
        currency: 'KES',
        status: status,
        paymentMethod: paymentData.paymentMethod,
        phoneNumber: paymentData.phoneNumber,
        created_at: paymentData.initiatedAt,
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
export const pesapalURLService = new MockPesapalURLService()

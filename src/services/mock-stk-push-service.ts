// Mock STK Push Service for Development
import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus, 
  PaymentService 
} from '@/types/payment'

class MockSTKPushService implements PaymentService {
  private payments: Map<string, PaymentStatus> = new Map()

  /**
   * Generate mock payment ID
   */
  private generatePaymentId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `MOCK_${timestamp}_${random}`
  }

  /**
   * Initiate mock STK Push payment
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentId = this.generatePaymentId()
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes

      const paymentStatus: PaymentStatus = {
        id: paymentId,
        orderTrackingId: paymentId,
        status: 'pending',
        amount: request.amount,
        currency: request.currency,
        phoneNumber: request.phoneNumber,
        paymentMethod: request.paymentMethod,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      }

      // Store payment status
      this.payments.set(paymentId, paymentStatus)

      // Simulate different outcomes based on amount
      let finalStatus: PaymentStatus['status'] = 'pending'
      let message = 'STK Push initiated successfully. Please check your phone and enter your PIN.'

      if (request.amount <= 100) {
        // Auto-complete small amounts
        finalStatus = 'completed'
        message = 'Payment completed successfully! (Mock payment)'
        
        setTimeout(() => {
          const status = this.payments.get(paymentId)
          if (status) {
            status.status = 'completed'
            status.completedAt = new Date().toISOString()
            status.updatedAt = new Date().toISOString()
            this.payments.set(paymentId, status)
          }
        }, 2000)
      } else {
        // For larger amounts, simulate processing
        setTimeout(() => {
          const status = this.payments.get(paymentId)
          if (status) {
            status.status = 'processing'
            status.updatedAt = new Date().toISOString()
            this.payments.set(paymentId, status)
          }
        }, 1000)

        // Simulate completion after 10 seconds
        setTimeout(() => {
          const status = this.payments.get(paymentId)
          if (status && status.status === 'processing') {
            status.status = 'completed'
            status.completedAt = new Date().toISOString()
            status.updatedAt = new Date().toISOString()
            this.payments.set(paymentId, status)
          }
        }, 10000)
      }

      return {
        success: true,
        paymentId: paymentId,
        orderTrackingId: paymentId,
        merchantReference: request.id,
        status: finalStatus,
        message: message
      }

    } catch (error) {
      console.error('Mock STK Push failed:', error)
      return {
        success: false,
        paymentId: request.id,
        orderTrackingId: request.id,
        merchantReference: request.id,
        status: 'failed',
        message: 'Mock payment failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check mock payment status
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null> {
    const status = this.payments.get(orderTrackingId)
    if (status) {
      // Update timestamp
      status.updatedAt = new Date().toISOString()
      this.payments.set(orderTrackingId, status)
    }
    return status || null
  }

  /**
   * Poll mock payment status
   */
  async pollPaymentStatus(
    orderTrackingId: string, 
    onUpdate: (status: PaymentStatus) => void,
    timeoutMs: number = 300000
  ): Promise<PaymentStatus | null> {
    const startTime = Date.now()
    const pollInterval = 2000 // Poll every 2 seconds for mock

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
          console.error('Mock polling error:', error)
          resolve(null)
        }
      }

      // Start polling
      poll()
    })
  }

  /**
   * Cancel mock payment
   */
  async cancelPayment(orderTrackingId: string): Promise<boolean> {
    const status = this.payments.get(orderTrackingId)
    if (status && status.status === 'pending') {
      status.status = 'cancelled'
      status.updatedAt = new Date().toISOString()
      this.payments.set(orderTrackingId, status)
      return true
    }
    return false
  }

  /**
   * Get all payments (for debugging)
   */
  getAllPayments(): PaymentStatus[] {
    return Array.from(this.payments.values())
  }

  /**
   * Clear all payments (for testing)
   */
  clearPayments(): void {
    this.payments.clear()
  }
}

// Export singleton instance
export const mockSTKPushService = new MockSTKPushService()
export { MockSTKPushService }

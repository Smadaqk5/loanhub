// Payment Service Factory - Chooses between real and mock services
import { PaymentService, PaymentRequest, PaymentResponse, PaymentStatus } from '@/types/payment'
import { stkPushService } from './stk-push-service'
import { mockSTKPushService } from './mock-stk-push-service'

class PaymentServiceFactory {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development' || 
                        (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    
    // Override for production if PesaPal credentials are available
    if (process.env.NODE_ENV === 'production' && 
        process.env.PESAPAL_CONSUMER_KEY && 
        process.env.PESAPAL_CONSUMER_SECRET) {
      this.isDevelopment = false
      console.log('🚀 Production mode with real PesaPal credentials detected')
    }
  }

  /**
   * Get the appropriate payment service
   */
  getPaymentService(): PaymentService {
    if (this.isDevelopment) {
      console.log('🔧 Using Mock Payment Service for development')
      return mockSTKPushService
    } else {
      console.log('🚀 Using Real STK Push Service for production')
      return stkPushService
    }
  }

  /**
   * Initiate payment with automatic service selection
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const service = this.getPaymentService()
    return service.initiatePayment(request)
  }

  /**
   * Check payment status with automatic service selection
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null> {
    const service = this.getPaymentService()
    return service.checkPaymentStatus(orderTrackingId)
  }

  /**
   * Poll payment status with automatic service selection
   */
  async pollPaymentStatus(
    orderTrackingId: string, 
    onUpdate: (status: PaymentStatus) => void,
    timeoutMs?: number
  ): Promise<PaymentStatus | null> {
    const service = this.getPaymentService()
    return service.pollPaymentStatus(orderTrackingId, onUpdate, timeoutMs)
  }

  /**
   * Cancel payment with automatic service selection
   */
  async cancelPayment(orderTrackingId: string): Promise<boolean> {
    const service = this.getPaymentService()
    return service.cancelPayment(orderTrackingId)
  }

  /**
   * Check if using mock service
   */
  isUsingMockService(): boolean {
    return this.isDevelopment
  }

  /**
   * Get service info for debugging
   */
  getServiceInfo(): { service: string; environment: string; mockMode: boolean } {
    return {
      service: this.isDevelopment ? 'MockSTKPushService' : 'STKPushService',
      environment: this.isDevelopment ? 'development' : 'production',
      mockMode: this.isDevelopment
    }
  }
}

// Export singleton instance
export const paymentServiceFactory = new PaymentServiceFactory()
export { PaymentServiceFactory }

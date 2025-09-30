// Payment Page Service - Integrates with PesaPal for individual payment pages
import { pesapalService } from './pesapal-service'
import { paymentPageGenerator, PaymentPageData } from './payment-page-generator'

export interface PaymentPageRequest {
  loanId: string
  userId: string
  amount: number
  phoneNumber: string
  paymentMethod: 'mpesa' | 'airtel_money' | 'equitel'
  description: string
}

export interface PaymentPageResponse {
  success: boolean
  paymentId?: string
  paymentUrl?: string
  error?: string
}

class PaymentPageService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  }

  /**
   * Create a new payment page for a transaction
   */
  async createPaymentPage(request: PaymentPageRequest): Promise<PaymentPageResponse> {
    try {
      // Generate unique payment ID
      const paymentId = this.generatePaymentId()
      
      // Create payment data
      const paymentData: PaymentPageData = {
        paymentId,
        orderTrackingId: '', // Will be set after PesaPal response
        merchantReference: this.generateMerchantReference(),
        amount: request.amount,
        currency: 'KES',
        phoneNumber: request.phoneNumber,
        paymentMethod: request.paymentMethod,
        description: request.description,
        loanId: request.loanId,
        userId: request.userId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        paymentUrl: undefined
      }

      // Store payment data in localStorage for tracking
      if (typeof window !== 'undefined') {
        localStorage.setItem(`payment_${paymentId}`, JSON.stringify(paymentData))
      }

      // Generate payment page URL
      const paymentUrl = paymentPageGenerator.generatePaymentPageUrl(paymentData)

      return {
        success: true,
        paymentId,
        paymentUrl
      }

    } catch (error) {
      console.error('Error creating payment page:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment page'
      }
    }
  }

  /**
   * Initiate payment for a specific payment page
   */
  async initiatePayment(paymentId: string): Promise<PaymentPageResponse> {
    try {
      // Get payment data from localStorage
      if (typeof window === 'undefined') {
        throw new Error('Payment data not available')
      }

      const storedPayment = localStorage.getItem(`payment_${paymentId}`)
      if (!storedPayment) {
        throw new Error('Payment not found')
      }

      const paymentData: PaymentPageData = JSON.parse(storedPayment)

      // Initiate PesaPal payment
      const pesapalResponse = await pesapalService.initiateSTKPush({
        loanId: paymentData.loanId || '',
        userId: paymentData.userId,
        amount: paymentData.amount,
        phoneNumber: paymentData.phoneNumber,
        paymentMethod: paymentData.paymentMethod,
        description: paymentData.description
      })

      if (pesapalResponse.success) {
        // Update payment data with PesaPal response
        const updatedPayment: PaymentPageData = {
          ...paymentData,
          orderTrackingId: pesapalResponse.orderTrackingId || '',
          paymentUrl: pesapalResponse.redirectUrl,
          status: 'pending'
        }

        // Store updated payment data
        localStorage.setItem(`payment_${paymentId}`, JSON.stringify(updatedPayment))

        return {
          success: true,
          paymentId,
          paymentUrl: pesapalResponse.redirectUrl
        }
      } else {
        throw new Error(pesapalResponse.error || 'Payment initiation failed')
      }

    } catch (error) {
      console.error('Error initiating payment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate payment'
      }
    }
  }

  /**
   * Get payment status for a specific payment page
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentPageData | null> {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const storedPayment = localStorage.getItem(`payment_${paymentId}`)
      if (!storedPayment) {
        return null
      }

      const paymentData: PaymentPageData = JSON.parse(storedPayment)

      // If payment is still pending and we have an order tracking ID, check with PesaPal
      if (paymentData.status === 'pending' && paymentData.orderTrackingId) {
        try {
          const statusResponse = await pesapalService.checkPaymentStatus(paymentData.orderTrackingId)
          
          if (statusResponse) {
            // Update payment data with new status
            const updatedPayment: PaymentPageData = {
              ...paymentData,
              status: statusResponse.status,
              paymentUrl: statusResponse.status === 'completed' ? undefined : paymentData.paymentUrl
            }

            // Store updated payment data
            localStorage.setItem(`payment_${paymentId}`, JSON.stringify(updatedPayment))
            
            return updatedPayment
          }
        } catch (error) {
          console.error('Error checking payment status:', error)
        }
      }

      return paymentData

    } catch (error) {
      console.error('Error getting payment status:', error)
      return null
    }
  }

  /**
   * Generate payment page HTML for a specific payment
   */
  generatePaymentPageHTML(paymentId: string): string | null {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const storedPayment = localStorage.getItem(`payment_${paymentId}`)
      if (!storedPayment) {
        return null
      }

      const paymentData: PaymentPageData = JSON.parse(storedPayment)
      return paymentPageGenerator.generatePaymentPageHTML(paymentData)

    } catch (error) {
      console.error('Error generating payment page HTML:', error)
      return null
    }
  }

  /**
   * Generate unique payment ID
   */
  private generatePaymentId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `PAY_${timestamp}_${random}`
  }

  /**
   * Generate merchant reference
   */
  private generateMerchantReference(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `MERCHANT_${timestamp}_${random}`
  }

  /**
   * Get all payment pages for a user
   */
  async getUserPaymentPages(userId: string): Promise<PaymentPageData[]> {
    try {
      if (typeof window === 'undefined') {
        return []
      }

      const payments: PaymentPageData[] = []
      
      // Get all payment keys from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('payment_')) {
          const paymentData = localStorage.getItem(key)
          if (paymentData) {
            try {
              const payment: PaymentPageData = JSON.parse(paymentData)
              if (payment.userId === userId) {
                payments.push(payment)
              }
            } catch (error) {
              console.error('Error parsing payment data:', error)
            }
          }
        }
      }

      return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    } catch (error) {
      console.error('Error getting user payment pages:', error)
      return []
    }
  }

  /**
   * Clean up expired payments
   */
  async cleanupExpiredPayments(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return
      }

      const now = new Date().getTime()
      const keysToRemove: string[] = []

      // Check all payment keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('payment_')) {
          const paymentData = localStorage.getItem(key)
          if (paymentData) {
            try {
              const payment: PaymentPageData = JSON.parse(paymentData)
              
              // Check if payment is expired
              if (payment.expiresAt && new Date(payment.expiresAt).getTime() < now) {
                keysToRemove.push(key)
              }
            } catch (error) {
              console.error('Error parsing payment data:', error)
              keysToRemove.push(key) // Remove corrupted data
            }
          }
        }
      }

      // Remove expired payments
      keysToRemove.forEach(key => localStorage.removeItem(key))

    } catch (error) {
      console.error('Error cleaning up expired payments:', error)
    }
  }
}

// Export singleton instance
export const paymentPageService = new PaymentPageService()

export default PaymentPageService

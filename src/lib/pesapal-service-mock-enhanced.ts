// Enhanced Mock Pesapal STK Push Service with Better Simulation
// This service provides more realistic payment simulation for development/testing

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

class EnhancedMockPesapalSTKService {
  private paymentSimulations: Map<string, any> = new Map()

  /**
   * Generate merchant reference
   */
  private generateMerchantReference(prefix: string = 'PROC'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}_${timestamp}_${random}`
  }

  /**
   * Enhanced STK Push initiation with better simulation
   */
  async initiateSTKPush(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🚀 Enhanced Mock STK Push initiated for:', {
        amount: paymentRequest.amount,
        phone: paymentRequest.phoneNumber,
        method: paymentRequest.paymentMethod
      })

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      const merchantReference = this.generateMerchantReference('STK')
      const orderTrackingId = `STK_ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      // Create payment simulation data
      const paymentSimulation = {
        orderTrackingId,
        merchantReference,
        amount: paymentRequest.amount,
        phoneNumber: paymentRequest.phoneNumber,
        paymentMethod: paymentRequest.paymentMethod,
        loanId: paymentRequest.loanId,
        userId: paymentRequest.userId,
        status: 'pending',
        initiatedAt: new Date().toISOString(),
        completionTime: Date.now() + (15000 + Math.random() * 15000), // Complete between 15-30 seconds
        service: 'enhanced-mock'
      }

      // Store in memory for faster access
      this.paymentSimulations.set(orderTrackingId, paymentSimulation)

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
        initiatedAt: new Date().toISOString(),
        service: 'enhanced-mock'
      }

      localStorage.setItem(`payment_${merchantReference}`, JSON.stringify(paymentData))

      console.log('✅ Enhanced Mock STK Push created:', {
        orderTrackingId,
        merchantReference,
        completionTime: new Date(paymentSimulation.completionTime).toLocaleTimeString()
      })

      // Simulate STK push being sent to phone
      setTimeout(() => {
        console.log('📱 Simulated STK Push sent to phone:', paymentRequest.phoneNumber)
      }, 2000)

      return {
        success: true,
        paymentId: orderTrackingId,
        orderTrackingId: orderTrackingId,
        merchantReference: merchantReference,
        message: 'Enhanced Mock STK Push initiated successfully. Check your phone for the payment prompt!'
      }

    } catch (error: any) {
      console.error('❌ Enhanced Mock STK Push failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to initiate enhanced mock STK Push payment'
      }
    }
  }

  /**
   * Enhanced payment status checking with realistic simulation
   */
  async checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      // Check memory first for faster access
      let paymentSimulation = this.paymentSimulations.get(orderTrackingId)
      
      if (!paymentSimulation) {
        // Fallback to localStorage
        const storedPayment = Object.keys(localStorage)
          .filter(key => key.startsWith('payment_'))
          .map(key => JSON.parse(localStorage.getItem(key) || '{}'))
          .find(payment => payment.orderTrackingId === orderTrackingId)

        if (!storedPayment) {
          console.warn('⚠️ No payment found for:', orderTrackingId)
          return null
        }

        paymentSimulation = {
          ...storedPayment,
          completionTime: new Date(storedPayment.initiatedAt).getTime() + 20000 // Default 20 seconds
        }
      }

      const now = Date.now()
      const timeSinceInitiated = now - new Date(paymentSimulation.initiatedAt).getTime()
      const completionTime = paymentSimulation.completionTime || (new Date(paymentSimulation.initiatedAt).getTime() + 20000)

      let status: PaymentStatus['status'] = 'pending'
      let paidAt: string | undefined = undefined

      // Determine status based on time
      if (timeSinceInitiated > 30000) {
        // After 30 seconds, mark as completed
        status = 'completed'
        paidAt = new Date().toISOString()
        console.log('✅ Payment completed after timeout:', orderTrackingId)
      } else if (now >= completionTime) {
        // Payment completed at scheduled time
        status = 'completed'
        paidAt = new Date().toISOString()
        console.log('✅ Payment completed at scheduled time:', orderTrackingId)
      } else {
        // Still pending
        const remainingTime = Math.ceil((completionTime - now) / 1000)
        console.log('⏳ Payment still pending, remaining:', remainingTime, 'seconds')
      }

      const result = {
        id: orderTrackingId,
        amount: paymentSimulation.amount,
        currency: 'KES',
        status: status,
        paymentMethod: paymentSimulation.paymentMethod,
        phoneNumber: paymentSimulation.phoneNumber,
        created_at: paymentSimulation.initiatedAt,
        paid_at: paidAt,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }

      console.log('📊 Payment status check result:', {
        orderTrackingId,
        status: result.status,
        timeSinceInitiated: Math.round(timeSinceInitiated / 1000) + 's',
        remainingTime: Math.ceil((completionTime - now) / 1000) + 's'
      })

      return result

    } catch (error) {
      console.error('❌ Failed to check enhanced mock payment status:', error)
      return null
    }
  }

  /**
   * Enhanced polling with better status updates
   */
  async pollPaymentStatus(
    orderTrackingId: string,
    onStatusUpdate: (status: PaymentStatus) => void,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<PaymentStatus | null> {
    const startTime = Date.now()
    const pollInterval = 3000 // Poll every 3 seconds for faster updates
    let consecutiveErrors = 0
    const maxConsecutiveErrors = 5

    console.log('🔄 Starting enhanced payment polling for:', orderTrackingId)

    return new Promise((resolve) => {
      const poll = async () => {
        try {
          const status = await this.checkPaymentStatus(orderTrackingId)
          
          if (status) {
            consecutiveErrors = 0 // Reset error counter on success
            console.log('📱 Status update:', status.status)
            onStatusUpdate(status)
            
            if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
              console.log('🏁 Payment polling completed with status:', status.status)
              resolve(status)
              return
            }
          } else {
            consecutiveErrors++
            console.warn(`⚠️ Payment status check returned null (attempt ${consecutiveErrors})`)
          }

          // Check for too many consecutive errors
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.error('❌ Too many consecutive errors, stopping polling')
            resolve(null)
            return
          }

          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            console.warn('⏰ Payment polling timeout reached')
            resolve(null)
            return
          }

          // Continue polling
          setTimeout(poll, pollInterval)
        } catch (error) {
          consecutiveErrors++
          console.error(`❌ Error polling payment status (attempt ${consecutiveErrors}):`, error)
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.error('❌ Too many consecutive errors, stopping polling')
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
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^(\+254|254|0)[0-9]{9}$/
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
   * Get service health status
   */
  getHealthStatus(): {
    isHealthy: boolean
    activeSimulations: number
    service: string
  } {
    return {
      isHealthy: true,
      activeSimulations: this.paymentSimulations.size,
      service: 'enhanced-mock'
    }
  }

  /**
   * Clear all simulations (for testing)
   */
  clearSimulations(): void {
    this.paymentSimulations.clear()
    console.log('🧹 Enhanced mock service simulations cleared')
  }
}

// Export singleton instance
export const enhancedMockPesapalSTKService = new EnhancedMockPesapalSTKService()

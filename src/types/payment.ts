// Payment System Types - Clean and Modern
export interface PaymentRequest {
  id: string
  amount: number
  currency: 'KES'
  phoneNumber: string
  paymentMethod: 'mpesa' | 'airtel_money' | 'equitel'
  description: string
  customerName?: string
  customerEmail?: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  paymentId: string
  orderTrackingId: string
  merchantReference: string
  status: PaymentStatus
  message: string
  error?: string
}

export interface PaymentStatus {
  id: string
  orderTrackingId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired'
  amount: number
  currency: string
  phoneNumber: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  failedAt?: string
  expiresAt: string
  errorMessage?: string
}

export interface STKPushRequest {
  amount: number
  phoneNumber: string
  accountReference: string
  transactionDesc: string
  callbackURL?: string
}

export interface STKPushResponse {
  success: boolean
  merchantRequestID: string
  checkoutRequestID: string
  responseCode: string
  responseDescription: string
  customerMessage: string
  error?: string
}

export interface PaymentCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{
          Name: string
          Value: string | number
        }>
      }
    }
  }
}

export interface PaymentConfig {
  baseUrl: string
  consumerKey: string
  consumerSecret: string
  environment: 'sandbox' | 'production'
}

export interface PaymentService {
  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>
  checkPaymentStatus(orderTrackingId: string): Promise<PaymentStatus | null>
  pollPaymentStatus(orderTrackingId: string, onUpdate: (status: PaymentStatus) => void): Promise<PaymentStatus | null>
  cancelPayment(orderTrackingId: string): Promise<boolean>
}

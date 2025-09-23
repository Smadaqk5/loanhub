'use client'

import React, { useState, useEffect, Suspense } from 'react'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Smartphone,
  ExternalLink,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PaymentData {
  orderId: string
  merchantId: string
  amount: number
  phone: string
  method: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

function OneTimePaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending')

  useEffect(() => {
    // Extract payment data from URL parameters
    const orderId = searchParams.get('order') || 'UNKNOWN'
    const merchantId = searchParams.get('merchant') || 'UNKNOWN'
    const amount = parseFloat(searchParams.get('amount') || '0')
    const phone = searchParams.get('phone') || '+254700000000'
    const method = searchParams.get('method') || 'mpesa'

    const data: PaymentData = {
      orderId,
      merchantId,
      amount,
      phone,
      method,
      status: 'pending'
    }

    setPaymentData(data)
    setIsLoading(false)

    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('processing')
      toast.success('Payment initiated! Please check your phone.')
    }, 2000)

    // Simulate payment completion
    setTimeout(() => {
      setPaymentStatus('completed')
      toast.success('Payment completed successfully!')
    }, 10000)
  }, [searchParams])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa'
      case 'airtel_money':
        return 'Airtel Money'
      case 'equitel':
        return 'Equitel'
      default:
        return method.toUpperCase()
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return '🟢'
      case 'airtel_money':
        return '🔵'
      case 'equitel':
        return '🟡'
      default:
        return '💳'
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'completed':
        return <CheckCircle className="h-16 w-16 text-green-600" />
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-600" />
      case 'processing':
        return <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-16 w-16 text-yellow-600" />
    }
  }

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'processing':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-yellow-200 bg-yellow-50'
    }
  }

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'Payment Successful!'
      case 'failed':
        return 'Payment Failed'
      case 'processing':
        return 'Processing Payment...'
      default:
        return 'Payment Pending'
    }
  }

  const getStatusDescription = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'Your payment has been processed successfully. You can now close this window.'
      case 'failed':
        return 'Your payment could not be processed. Please try again or contact support.'
      case 'processing':
        return 'Please check your phone and enter your mobile money PIN to complete the payment.'
      default:
        return 'Your payment is being prepared. Please wait...'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Payment</h1>
          <p className="text-gray-600 mb-6">The payment link is invalid or has expired.</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className={`${getStatusColor()}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {getStatusTitle()}
            </CardTitle>
            <CardDescription className="text-gray-700">
              {getStatusDescription()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-lg">{formatCurrency(paymentData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="flex items-center">
                    <span className="mr-2">{getPaymentMethodIcon(paymentData.method)}</span>
                    {getPaymentMethodName(paymentData.method)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-mono text-sm">{paymentData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-xs">{paymentData.orderId}</span>
                </div>
              </div>
            </div>

            {/* Status-specific content */}
            {paymentStatus === 'processing' && (
              <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-3">
                  <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">Check Your Phone</span>
                </div>
                <p className="text-blue-700 text-sm">
                  A payment request has been sent to your phone. Please check your mobile money app and enter your PIN to complete the payment.
                </p>
              </div>
            )}

            {paymentStatus === 'completed' && (
              <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Payment Successful</span>
                </div>
                <p className="text-green-700 text-sm">
                  Your payment of {formatCurrency(paymentData.amount)} has been processed successfully. You will receive a confirmation message shortly.
                </p>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="bg-red-100 p-4 rounded-lg border border-red-200">
                <div className="flex items-center mb-3">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">Payment Failed</span>
                </div>
                <p className="text-red-700 text-sm">
                  Your payment could not be processed. Please check your mobile money balance and try again.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {paymentStatus === 'completed' && (
                <Button
                  onClick={() => {
                    // Close the window or redirect to success page
                    if (window.opener) {
                      window.close()
                    } else {
                      router.push('/')
                    }
                  }}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Window
                </Button>
              )}

              {paymentStatus === 'failed' && (
                <>
                  <Button
                    onClick={() => {
                      // Retry payment
                      setPaymentStatus('processing')
                      toast.info('Retrying payment...')
                    }}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => {
                      if (window.opener) {
                        window.close()
                      } else {
                        router.push('/')
                      }
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                </>
              )}

              {paymentStatus === 'processing' && (
                <Button
                  onClick={() => {
                    // Check payment status
                    toast.info('Checking payment status...')
                    // Simulate status check
                    setTimeout(() => {
                      const random = Math.random()
                      if (random > 0.7) {
                        setPaymentStatus('completed')
                        toast.success('Payment completed!')
                      } else if (random > 0.3) {
                        setPaymentStatus('failed')
                        toast.error('Payment failed')
                      } else {
                        toast.info('Payment still processing...')
                      }
                    }, 2000)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Check Status
                </Button>
              )}

              <Button
                onClick={() => {
                  if (window.opener) {
                    window.close()
                  } else {
                    router.push('/')
                  }
                }}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {window.opener ? 'Close Window' : 'Go Home'}
              </Button>
            </div>

            {/* Debug Info */}
            <div className="text-xs text-gray-500 text-center">
              Order: {paymentData.orderId} | Status: {paymentStatus.toUpperCase()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Loading fallback component
function PaymentPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading payment details...</p>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function OneTimePaymentPage() {
  return (
    <Suspense fallback={<PaymentPageLoading />}>
      <OneTimePaymentContent />
    </Suspense>
  )
}
'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  CreditCard,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { pesapalService } from '@/lib/pesapal-service-mock'
import toast from 'react-hot-toast'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const [error, setError] = useState('')

  const orderTrackingId = searchParams.get('OrderTrackingId')
  const orderMerchantReference = searchParams.get('OrderMerchantReference')
  const orderNotificationType = searchParams.get('OrderNotificationType')

  useEffect(() => {
    if (orderTrackingId && orderMerchantReference) {
      handlePaymentCallback()
    } else {
      setError('Invalid payment callback parameters')
      setLoading(false)
    }
  }, [orderTrackingId, orderMerchantReference])

  const handlePaymentCallback = async () => {
    try {
      setLoading(true)

      // Get payment status from Pesapal
      const status = await pesapalService.checkPaymentStatus(orderTrackingId!)

      if (status) {
        setPaymentStatus(status)
        
        // Show appropriate toast message
        if (status.status === 'completed') {
          toast.success('Payment completed successfully!')
        } else if (status.status === 'failed') {
          toast.error('Payment failed. Please try again.')
        } else {
          toast('Payment status updated')
        }
      } else {
        setError('Unable to verify payment status')
      }
    } catch (error: any) {
      console.error('Payment callback error:', error)
      setError(error.message || 'Failed to process payment callback')
      toast.error('Failed to process payment callback')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return pesapalService.formatCurrency(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-16 w-16 text-green-600" />
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-600" />
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-600" />
      default:
        return <AlertCircle className="h-16 w-16 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'pending':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Payment Successful!'
      case 'failed':
        return 'Payment Failed'
      case 'pending':
        return 'Payment Pending'
      default:
        return 'Payment Status'
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Your payment has been processed successfully. Your loan application will now be reviewed.'
      case 'failed':
        return 'Your payment could not be processed. Please try again or contact support.'
      case 'pending':
        return 'Your payment is being processed. Please wait for confirmation.'
      default:
        return 'Payment status is being verified.'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600">Processing payment callback...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertCircle className="h-6 w-6 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card className={`${getStatusColor(paymentStatus?.status || '')}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon(paymentStatus?.status || '')}
            </div>
            <CardTitle className="text-2xl">
              {getStatusTitle(paymentStatus?.status || '')}
            </CardTitle>
            <CardDescription className="text-base">
              {getStatusDescription(paymentStatus?.status || '')}
            </CardDescription>
          </CardHeader>
          
          {paymentStatus && (
            <CardContent className="space-y-6">
              {/* Payment Details */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{formatCurrency(paymentStatus.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{paymentStatus.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{paymentStatus.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(paymentStatus.created_at)}</span>
                  </div>
                  {paymentStatus.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid At:</span>
                      <span className="font-medium">{formatDate(paymentStatus.paid_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Reference */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2">Transaction Reference</h3>
                <p className="font-mono text-sm text-gray-700 break-all">
                  {orderTrackingId}
                </p>
              </div>

              {/* Status-specific Actions */}
              <div className="space-y-3">
                {paymentStatus.status === 'completed' && (
                  <div className="bg-green-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        Payment completed successfully!
                      </span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Your loan application will now be reviewed. You can track its progress in your dashboard.
                    </p>
                  </div>
                )}

                {paymentStatus.status === 'failed' && (
                  <div className="bg-red-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-red-800 font-medium">
                        Payment failed
                      </span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      Please check your mobile money balance and try again. If the problem persists, contact support.
                    </p>
                  </div>
                )}

                {paymentStatus.status === 'pending' && (
                  <div className="bg-yellow-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-yellow-800 font-medium">
                        Payment pending
                      </span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      Please check your phone and complete the payment. This page will update automatically.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                
                {paymentStatus.status === 'failed' && (
                  <Button
                    onClick={() => router.push('/loans/apply')}
                    variant="outline"
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Try Payment Again
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Support Information */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@loanhubkenya.com" className="text-blue-600 hover:text-blue-500">
              support@loanhubkenya.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment status...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}

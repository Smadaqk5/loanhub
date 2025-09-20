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
  RefreshCw
} from 'lucide-react'

function PaymentStatusContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const status = searchParams.get('status')
  const paymentId = searchParams.get('payment_id')

  useEffect(() => {
    if (paymentId) {
      fetchPaymentStatus()
    } else {
      setLoading(false)
    }
  }, [paymentId])

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/pesapal/status/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setPaymentData(result.payment)
      } else {
        setError(result.error || 'Failed to fetch payment status')
      }
    } catch (error) {
      console.error('Error fetching payment status:', error)
      setError('Failed to fetch payment status')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
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
        return 'Payment Successful'
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
        return 'Your payment has been processed successfully. Your loan balance has been updated.'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment status...</p>
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
                  onClick={fetchPaymentStatus}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
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
        <Card className={`${getStatusColor(status || '')}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon(status || '')}
            </div>
            <CardTitle className="text-2xl">
              {getStatusTitle(status || '')}
            </CardTitle>
            <CardDescription className="text-base">
              {getStatusDescription(status || '')}
            </CardDescription>
          </CardHeader>
          
          {paymentData && (
            <CardContent className="space-y-6">
              {/* Payment Details */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{formatCurrency(paymentData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{paymentData.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{paymentData.phone_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(paymentData.created_at)}</span>
                  </div>
                  {paymentData.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid At:</span>
                      <span className="font-medium">{formatDate(paymentData.paid_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Reference */}
              {paymentData.payment_reference && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">Transaction Reference</h3>
                  <p className="font-mono text-sm text-gray-700 break-all">
                    {paymentData.payment_reference}
                  </p>
                </div>
              )}

              {/* Status-specific Actions */}
              <div className="space-y-3">
                {status === 'completed' && (
                  <div className="bg-green-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        Payment completed successfully!
                      </span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Your loan balance has been updated. You can view your updated loan details in your dashboard.
                    </p>
                  </div>
                )}

                {status === 'failed' && (
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

                {status === 'pending' && (
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
                
                {status === 'failed' && (
                  <Button
                    onClick={() => router.push('/loans/repay')}
                    variant="outline"
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Try Payment Again
                  </Button>
                )}

                {status === 'pending' && (
                  <Button
                    onClick={fetchPaymentStatus}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
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

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment status...</p>
        </div>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  )
}

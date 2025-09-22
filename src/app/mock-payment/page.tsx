'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Smartphone, CreditCard } from 'lucide-react'

export default function MockPaymentPage() {
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending')
  const [countdown, setCountdown] = useState(30)

  const orderId = searchParams.get('order')
  const merchantRef = searchParams.get('merchant')
  const amount = searchParams.get('amount')
  const phone = searchParams.get('phone')
  const method = searchParams.get('method')

  useEffect(() => {
    if (paymentStatus === 'pending') {
      // Simulate payment processing
      const timer = setTimeout(() => {
        setPaymentStatus('processing')
        setCountdown(30)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [paymentStatus])

  useEffect(() => {
    if (paymentStatus === 'processing') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setPaymentStatus('completed')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [paymentStatus])

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="h-8 w-8 text-green-600" />
      case 'airtel_money':
        return <Smartphone className="h-8 w-8 text-red-600" />
      case 'equitel':
        return <Smartphone className="h-8 w-8 text-blue-600" />
      default:
        return <CreditCard className="h-8 w-8 text-gray-600" />
    }
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
        return method
    }
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mock Payment Gateway
          </h1>
          <p className="text-gray-600 text-sm">
            This is a test payment page for development
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono text-sm">{orderId}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Amount:</span>
            <span className="font-bold text-lg">{formatCurrency(amount || '0')}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Phone:</span>
            <span className="font-mono">{phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Method:</span>
            <div className="flex items-center space-x-2">
              {getPaymentMethodIcon(method || '')}
              <span>{getPaymentMethodName(method || '')}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="text-center">
          {paymentStatus === 'pending' && (
            <div className="space-y-4">
              <Clock className="h-12 w-12 text-blue-500 mx-auto animate-pulse" />
              <h2 className="text-xl font-semibold text-gray-900">
                Preparing Payment...
              </h2>
              <p className="text-gray-600">
                Please wait while we prepare your payment request.
              </p>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="space-y-4">
              <div className="relative">
                <Clock className="h-12 w-12 text-yellow-500 mx-auto animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-yellow-600">{countdown}</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Processing Payment...
              </h2>
              <p className="text-gray-600">
                Simulating payment processing. This will complete in {countdown} seconds.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((30 - countdown) / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold text-green-900">
                Payment Successful!
              </h2>
              <p className="text-gray-600">
                Your payment has been processed successfully.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-green-800 mb-2">Transaction Details:</p>
                  <p className="font-mono text-xs text-green-700">
                    Ref: {merchantRef}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.close()}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Close Window
              </button>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold text-red-900">
                Payment Failed
              </h2>
              <p className="text-gray-600">
                There was an error processing your payment.
              </p>
              <button
                onClick={() => window.close()}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Close Window
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This is a mock payment gateway for development and testing purposes only.
          </p>
        </div>
      </div>
    </div>
  )
}

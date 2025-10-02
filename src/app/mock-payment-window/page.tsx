// Mock Payment Window - Simulates PesaPal Payment Interface
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function MockPaymentWindow() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('paymentId')
  const [step, setStep] = useState<'loading' | 'pin' | 'processing' | 'success' | 'failed'>('loading')
  const [pin, setPin] = useState('')
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setStep('pin')
    }, 2000)
  }, [])

  useEffect(() => {
    if (step === 'processing') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setStep('success')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [step])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length >= 4) {
      setStep('processing')
    }
  }

  const handlePaymentComplete = () => {
    // Update payment status in localStorage
    if (typeof window !== 'undefined' && paymentId) {
      try {
        const paymentData = localStorage.getItem(`payment_${paymentId}`)
        if (paymentData) {
          const data = JSON.parse(paymentData)
          const completedPayment = {
            ...data,
            status: 'completed',
            paidAt: new Date().toISOString()
          }
          localStorage.setItem(`payment_${paymentId}`, JSON.stringify(completedPayment))
        }
      } catch (error) {
        console.error('Failed to update payment status:', error)
      }
    }

    // Close window and notify parent
    if (typeof window !== 'undefined') {
      window.opener?.postMessage({ type: 'PAYMENT_COMPLETED', paymentId }, window.location.origin)
      window.close()
    }
  }

  const handlePaymentFailed = () => {
    // Update payment status in localStorage
    if (typeof window !== 'undefined' && paymentId) {
      try {
        const paymentData = localStorage.getItem(`payment_${paymentId}`)
        if (paymentData) {
          const data = JSON.parse(paymentData)
          const failedPayment = {
            ...data,
            status: 'failed',
            failedAt: new Date().toISOString()
          }
          localStorage.setItem(`payment_${paymentId}`, JSON.stringify(failedPayment))
        }
      } catch (error) {
        console.error('Failed to update payment status:', error)
      }
    }

    // Close window and notify parent
    if (typeof window !== 'undefined') {
      window.opener?.postMessage({ type: 'PAYMENT_FAILED', paymentId }, window.location.origin)
      window.close()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💰</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Mock Payment</h1>
          <p className="text-gray-600">Simulated PesaPal Payment</p>
        </div>

        {/* Loading Step */}
        {step === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing payment...</p>
          </div>
        )}

        {/* PIN Entry Step */}
        {step === 'pin' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Enter M-Pesa PIN</h2>
              <p className="text-gray-600">Amount: KES 500</p>
              <p className="text-gray-600">Phone: +254700000000</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your PIN"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={pin.length < 4}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay KES 500
                </button>
                <button
                  type="button"
                  onClick={handlePaymentFailed}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-gray-600 mb-4">Please wait while we process your payment...</p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 font-medium">Time remaining: {countdown} seconds</p>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-green-500">✅</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
            <button
              onClick={handlePaymentComplete}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            >
              Close Window
            </button>
          </div>
        )}

        {/* Failed Step */}
        {step === 'failed' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-red-500">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">Your payment could not be processed. Please try again.</p>
            <button
              onClick={handlePaymentFailed}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            >
              Close Window
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This is a mock payment window for development purposes
          </p>
        </div>
      </div>
    </div>
  )
}

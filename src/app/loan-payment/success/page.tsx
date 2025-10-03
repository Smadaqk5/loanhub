// Loan Payment Success Page
// Displays successful payment completion

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function LoanPaymentSuccessPage() {
  const searchParams = useSearchParams()
  const orderTrackingId = searchParams.get('orderTrackingId')
  const merchantReference = searchParams.get('merchantReference')
  
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (orderTrackingId) {
      checkPaymentStatus()
    } else {
      setIsLoading(false)
    }
  }, [orderTrackingId])

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/loan-payment?orderTrackingId=${orderTrackingId}`)
      const result = await response.json()
      
      if (result.success) {
        setPaymentStatus(result.data)
      }
    } catch (error) {
      console.error('Failed to check payment status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-green-500">✅</span>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your loan payment has been processed successfully.
        </p>

        {/* Payment Details */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
            <span className="text-gray-600">Loading payment details...</span>
          </div>
        ) : paymentStatus ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm text-green-700">
              <p><strong>Status:</strong> {paymentStatus.payment_status}</p>
              <p><strong>Amount:</strong> {paymentStatus.currency} {paymentStatus.amount?.toLocaleString()}</p>
              <p><strong>Method:</strong> {paymentStatus.payment_method}</p>
              <p><strong>Reference:</strong> {paymentStatus.payment_reference}</p>
              <p><strong>Date:</strong> {new Date(paymentStatus.created_date).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">Payment Information</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Order Tracking ID:</strong> {orderTrackingId}</p>
              <p><strong>Merchant Reference:</strong> {merchantReference}</p>
              <p><strong>Status:</strong> Processing</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.close()}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
          >
            Close Window
          </button>
          
          <button
            onClick={() => window.location.href = '/loan-payment-demo'}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium"
          >
            Make Another Payment
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Powered by PesaPal • Secure Payment Processing
          </p>
        </div>
      </div>
    </div>
  )
}

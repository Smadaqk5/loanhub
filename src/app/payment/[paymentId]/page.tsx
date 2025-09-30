// Dynamic Payment Page for Individual PesaPal Transactions
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { paymentPageGenerator, PaymentPageData } from '@/lib/payment-page-generator'
import { pesapalService } from '@/lib/pesapal-service'

export default function PaymentPage() {
  const params = useParams()
  const paymentId = params.paymentId as string
  const [paymentData, setPaymentData] = useState<PaymentPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPaymentData()
  }, [paymentId])

  const loadPaymentData = async () => {
    try {
      setLoading(true)
      
      // Try to get payment data from localStorage first
      const storedPayment = localStorage.getItem(`payment_${paymentId}`)
      if (storedPayment) {
        const data = JSON.parse(storedPayment)
        setPaymentData(data)
        setLoading(false)
        return
      }

      // If not in localStorage, try to fetch from API
      const response = await fetch(`/api/payment/${paymentId}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentData(data)
      } else {
        throw new Error('Payment not found')
      }
    } catch (err) {
      console.error('Error loading payment data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load payment data')
    } finally {
      setLoading(false)
    }
  }

  const initiatePayment = async () => {
    if (!paymentData) return

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
          orderTrackingId: paymentData.orderTrackingId,
          amount: paymentData.amount,
          phoneNumber: paymentData.phoneNumber,
          paymentMethod: paymentData.paymentMethod,
          description: paymentData.description,
          loanId: paymentData.loanId,
          userId: paymentData.userId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update payment data with new information
        const updatedPayment = {
          ...paymentData,
          orderTrackingId: result.orderTrackingId,
          paymentUrl: result.paymentUrl,
          status: 'pending' as const
        }
        
        setPaymentData(updatedPayment)
        localStorage.setItem(`payment_${paymentId}`, JSON.stringify(updatedPayment))
        
        // If there's a payment URL, redirect to it
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl
        }
      } else {
        throw new Error(result.error || 'Payment initiation failed')
      }
    } catch (err) {
      console.error('Payment initiation error:', err)
      alert('Payment initiation failed. Please try again.')
    }
  }

  const retryPayment = () => {
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading Payment...</h2>
          <p className="text-gray-600 mt-2">Please wait while we load your payment details.</p>
        </div>
      </div>
    )
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The payment you are looking for could not be found.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={retryPayment}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Generate the payment page HTML
  const paymentPageHTML = paymentPageGenerator.generatePaymentPageHTML(paymentData)

  return (
    <div className="min-h-screen">
      {/* Render the generated payment page */}
      <div 
        dangerouslySetInnerHTML={{ __html: paymentPageHTML }}
        className="payment-page-container"
      />
      
      {/* Add some additional React functionality */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Override the initiatePayment function to use React
            window.initiatePayment = function() {
              // This will be handled by the React component
              window.dispatchEvent(new CustomEvent('initiatePayment'));
            };
            
            // Override the retryPayment function
            window.retryPayment = function() {
              window.dispatchEvent(new CustomEvent('retryPayment'));
            };
          `
        }}
      />
      
      {/* Listen for custom events */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('initiatePayment', function() {
              // This will be handled by the React component
              console.log('Payment initiation requested');
            });
            
            document.addEventListener('retryPayment', function() {
              window.location.reload();
            });
          `
        }}
      />
    </div>
  )
}

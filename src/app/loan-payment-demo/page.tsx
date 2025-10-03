// Loan Payment Demo Page
// Showcases the complete loan payment system

'use client'

import { useState, useEffect } from 'react'
import { LoanPaymentForm } from '@/components/LoanPaymentForm'

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

export default function LoanPaymentDemoPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])

  useEffect(() => {
    testAuthentication()
  }, [])

  const testAuthentication = async () => {
    try {
      setIsLoadingAuth(true)
      const response = await fetch('/api/loan-payment/test-auth')
      const result = await response.json()
      setAuthStatus(result)
    } catch (error) {
      console.error('Authentication test failed:', error)
      setAuthStatus({ success: false, error: 'Authentication test failed' })
    } finally {
      setIsLoadingAuth(false)
    }
  }

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment successful:', data)
    
    // Add to payment history
    setPaymentHistory(prev => [{
      ...data,
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    }, ...prev.slice(0, 9)]) // Keep last 10 payments
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    alert(`Payment Error: ${error}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏦 Loanhub Payment System
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Professional loan payment processing with PesaPal
          </p>
          <p className="text-gray-500">
            Secure, mobile-optimized loan payments for Kenyan customers
          </p>
        </div>

        {/* Authentication Status */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔐 Authentication Status</h2>
            
            {isLoadingAuth ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-gray-600">Testing PesaPal authentication...</span>
              </div>
            ) : authStatus?.success ? (
              <div className="space-y-3">
                <div className="flex items-center text-green-600">
                  <span className="text-xl mr-2">✅</span>
                  <span className="font-medium">PesaPal Authentication Successful</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Service:</strong> {authStatus.data?.service}</p>
                    <p><strong>Environment:</strong> {authStatus.data?.environment}</p>
                    <p><strong>Mobile Optimized:</strong> {authStatus.data?.mobileOptimized ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p><strong>Supported Methods:</strong> {authStatus.data?.supportedMethods?.join(', ')}</p>
                    <p><strong>Payment Types:</strong> {authStatus.data?.loanPaymentTypes?.join(', ')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <span className="text-xl mr-2">❌</span>
                <span className="font-medium">Authentication Failed: {authStatus?.error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <LoanPaymentForm
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Recent Payments</h2>
            
            {paymentHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📝</span>
                <p>No payments yet</p>
                <p className="text-sm">Create your first loan payment to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-800">{payment.loanReference}</p>
                        <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">KES {payment.amount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{new Date(payment.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                      {payment.redirectUrl && (
                        <button
                          onClick={() => window.open(payment.redirectUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Open Payment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Mobile Optimized</h3>
            <p className="text-gray-600 text-sm">
              Payment URLs optimized for mobile devices with M-PESA integration
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Secure Processing</h3>
            <p className="text-gray-600 text-sm">
              All payments processed securely through PesaPal's production API
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Real-time Tracking</h3>
            <p className="text-gray-600 text-sm">
              Instant payment notifications and real-time status updates
            </p>
          </div>
        </div>

        {/* Payment Types */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">💳 Supported Payment Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                <span className="font-medium">Loan Repayment</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                <span className="font-medium">Application Fee</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                <span className="font-medium">Late Payment Fee</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                <span className="font-medium">Processing Fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">📋 How to Use</h2>
          <ol className="space-y-2 text-blue-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Fill in customer details and loan information</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Choose payment type (repayment, fees, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Click "Create Payment URL" or "Direct Mobile Payment"</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Open the payment URL on customer's mobile device</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">5.</span>
              <span>Customer completes M-PESA payment</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">6.</span>
              <span>Receive instant payment notification</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}

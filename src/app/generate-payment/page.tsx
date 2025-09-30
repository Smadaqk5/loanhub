// Payment Page Generation Test Page
'use client'

import { useState } from 'react'
import { PaymentPageGenerator, QuickPaymentPageGenerator } from '@/components/PaymentPageGenerator'
import { paymentPageService } from '@/lib/payment-page-service'
import { toast } from 'react-hot-toast'

export default function GeneratePaymentPage() {
  const [activeTab, setActiveTab] = useState<'custom' | 'quick'>('quick')
  const [userPayments, setUserPayments] = useState<any[]>([])

  const loadUserPayments = async () => {
    try {
      const payments = await paymentPageService.getUserPaymentPages('USER_123')
      setUserPayments(payments)
    } catch (error) {
      console.error('Error loading user payments:', error)
    }
  }

  const handlePaymentPageCreated = (paymentId: string, paymentUrl: string) => {
    console.log('Payment page created:', { paymentId, paymentUrl })
    loadUserPayments() // Refresh the list
  }

  const handleError = (error: string) => {
    console.error('Payment page creation error:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            PesaPal Payment Page Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Generate individual payment pages for each PesaPal transaction
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'quick'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Quick Generator
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'custom'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Custom Generator
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator */}
          <div>
            {activeTab === 'quick' ? (
              <QuickPaymentPageGenerator />
            ) : (
              <PaymentPageGenerator
                onPaymentPageCreated={handlePaymentPageCreated}
                onError={handleError}
              />
            )}
          </div>

          {/* User Payments */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Your Payment Pages
              </h2>
              <button
                onClick={loadUserPayments}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>

            {userPayments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📄</div>
                <p className="text-gray-600">No payment pages created yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Generate a payment page to see it here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPayments.map((payment) => (
                  <div
                    key={payment.paymentId}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {payment.paymentId}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <p>Amount: {payment.amount} {payment.currency}</p>
                      <p>Method: {payment.paymentMethod}</p>
                      <p>Phone: {payment.phoneNumber}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <a
                        href={`/payment/${payment.paymentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                      >
                        View Payment Page
                      </a>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/payment/${payment.paymentId}`)
                          toast.success('Payment URL copied to clipboard!')
                        }}
                        className="text-green-500 hover:text-green-600 text-sm font-medium"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Payment Page Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600 text-sm">
                Each payment page is secured with PesaPal's encryption and authentication
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Mobile Optimized
              </h3>
              <p className="text-gray-600 text-sm">
                Payment pages are fully responsive and optimized for mobile devices
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-600 text-sm">
                Payment status updates in real-time with automatic polling
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Customizable
              </h3>
              <p className="text-gray-600 text-sm">
                Customize branding, colors, and features for each payment page
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Analytics
              </h3>
              <p className="text-gray-600 text-sm">
                Track payment success rates and user behavior
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Retry Logic
              </h3>
              <p className="text-gray-600 text-sm">
                Automatic retry mechanisms for failed payments
              </p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">
            How to Use Payment Page Generator
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Generate Payment Page</h3>
                <p className="text-blue-700 text-sm">
                  Use the quick generator for common scenarios or the custom generator for specific requirements
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Share Payment URL</h3>
                <p className="text-blue-700 text-sm">
                  Copy the generated payment URL and share it with your customers
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Monitor Payments</h3>
                <p className="text-blue-700 text-sm">
                  Track payment status in real-time and receive notifications when payments are completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

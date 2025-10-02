// Payment System Demo Page
'use client'

import { useState } from 'react'
import { PaymentForm } from '@/components/PaymentForm'
import { PaymentStatusComponent } from '@/components/PaymentStatusComponent'
import { PaymentStatus } from '@/types/payment'
import { paymentServiceFactory } from '@/services/payment-service-factory'

export default function PaymentDemoPage() {
  const [currentPayment, setCurrentPayment] = useState<PaymentStatus | null>(null)
  const [showStatus, setShowStatus] = useState(false)
  const [serviceInfo, setServiceInfo] = useState(paymentServiceFactory.getServiceInfo())

  const handlePaymentSuccess = (status: PaymentStatus) => {
    console.log('Payment successful:', status)
    setCurrentPayment(status)
    setShowStatus(true)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    alert(`Payment Error: ${error}`)
  }

  const handlePaymentCancel = () => {
    console.log('Payment cancelled')
    setCurrentPayment(null)
    setShowStatus(false)
  }

  const handleNewPayment = () => {
    setCurrentPayment(null)
    setShowStatus(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Modern STK Push Payment System
          </h1>
          <p className="text-gray-600">
            Clean, modern payment system with real-time status tracking
          </p>
        </div>

        {/* Service Info */}
        <div className="mb-8 p-4 bg-white rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Service</div>
              <div className="font-medium text-gray-800">{serviceInfo.service}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Environment</div>
              <div className="font-medium text-gray-800">{serviceInfo.environment}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Mode</div>
              <div className={`font-medium ${serviceInfo.mockMode ? 'text-orange-600' : 'text-green-600'}`}>
                {serviceInfo.mockMode ? 'Mock Payments' : 'Real STK Push'}
              </div>
            </div>
          </div>
          
          {/* Production Warning */}
          {!serviceInfo.mockMode && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-500 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="font-semibold text-red-800">Production Mode Active</h3>
                  <p className="text-sm text-red-700">
                    Real STK Push is enabled. Payments will charge actual money to the phone number provided.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Development Info */}
          {serviceInfo.mockMode && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-blue-500 text-xl mr-3">🔧</div>
                <div>
                  <h3 className="font-semibold text-blue-800">Development Mode</h3>
                  <p className="text-sm text-blue-700">
                    Mock payments are active. No real money will be charged.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Initiate Payment</h2>
              <p className="text-gray-600">
                Fill in the details below to initiate an STK Push payment
              </p>
            </div>
            
            <PaymentForm
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onPaymentCancel={handlePaymentCancel}
              defaultAmount={100}
              defaultPhoneNumber="+254700000000"
              defaultDescription="Demo payment via STK Push"
            />
          </div>

          {/* Payment Status */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Payment Status</h2>
              {showStatus && (
                <button
                  onClick={handleNewPayment}
                  className="bg-gray-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-700"
                >
                  New Payment
                </button>
              )}
            </div>
            
            {showStatus && currentPayment ? (
              <PaymentStatusComponent
                orderTrackingId={currentPayment.orderTrackingId}
                onStatusUpdate={(status) => setCurrentPayment(status)}
                onPaymentComplete={(status) => {
                  setCurrentPayment(status)
                  console.log('Payment completed:', status)
                }}
                onPaymentFailed={(status) => {
                  setCurrentPayment(status)
                  console.log('Payment failed:', status)
                }}
                autoRefresh={true}
                refreshInterval={3000}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">💳</div>
                  <p>No active payment</p>
                  <p className="text-sm">Initiate a payment to see status updates</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            System Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-800 mb-2">STK Push</h3>
              <p className="text-sm text-gray-600">
                Direct mobile money payments via STK Push
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-800 mb-2">Real-time</h3>
              <p className="text-sm text-gray-600">
                Live payment status updates and tracking
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="font-semibold text-gray-800 mb-2">Development</h3>
              <p className="text-sm text-gray-600">
                Mock service for development and testing
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-gray-800 mb-2">Secure</h3>
              <p className="text-sm text-gray-600">
                Secure payment processing with callbacks
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">How to Test</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Development Mode (Mock)</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Uses mock payment service</li>
                <li>• Payments auto-complete for amounts ≤ KES 100</li>
                <li>• Larger amounts simulate processing delays</li>
                <li>• No real money is charged</li>
                <li>• Safe for testing and development</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Production Mode (Real STK Push)</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Uses real PesaPal STK Push API</li>
                <li>• Requires valid PesaPal production credentials</li>
                <li>• Real mobile money payments</li>
                <li>• Actual money will be charged</li>
                <li>• Test with your own phone number</li>
              </ul>
            </div>
          </div>
          
          {/* Setup Instructions */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-300">
            <h4 className="font-semibold text-blue-800 mb-3">🚀 To Enable Real STK Push:</h4>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li>Get PesaPal production credentials from <a href="https://developer.pesapal.com/" target="_blank" rel="noopener noreferrer" className="underline">developer.pesapal.com</a></li>
              <li>Create <code className="bg-blue-100 px-1 rounded">.env.local</code> file with your credentials</li>
              <li>Set <code className="bg-blue-100 px-1 rounded">NODE_ENV=production</code></li>
              <li>Add your PesaPal Consumer Key, Secret, Pass Key, and Short Code</li>
              <li>Restart the development server</li>
              <li>Test with your own phone number and small amounts</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

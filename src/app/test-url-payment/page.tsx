'use client'

import React, { useState } from 'react'
import { URLPaymentForm } from '@/components/URLPaymentForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  ExternalLink,
  AlertCircle,
  Info,
  Globe
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TestURLPaymentPage() {
  const router = useRouter()
  const [showPayment, setShowPayment] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData)
    setPaymentHistory(prev => [...prev, { ...paymentData, timestamp: new Date().toISOString() }])
    alert('🎉 Payment completed successfully! Check console for details.')
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    alert(`❌ Payment error: ${error}`)
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => setShowPayment(false)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Page
            </Button>
          </div>
          
          <URLPaymentForm
            loanId="test-loan-123"
            userId="test-user-456"
            processingFeeAmount={2500.00}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🌐 URL-Based Payment Test
          </h1>
          <p className="text-gray-600">
            Test the Pesapal payment URL integration for processing fee payments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                URL Payment Test
              </CardTitle>
              <CardDescription>
                This page tests the URL-based payment functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Test Details</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Processing Fee:</strong> KES 2,500.00 (5% of KES 50,000)</p>
                  <p><strong>Payment Methods:</strong> M-Pesa, Airtel Money, Equitel</p>
                  <p><strong>Test Phone:</strong> Use any valid Kenyan phone number</p>
                  <p><strong>Environment:</strong> Pesapal Sandbox</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">How to Test</h3>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Click "Start URL Payment Test" below</li>
                  <li>Select a payment method (M-Pesa, Airtel Money, or Equitel)</li>
                  <li>Enter a valid Kenyan phone number</li>
                  <li>Click "Create Payment URL" to generate payment URL</li>
                  <li>Click "Open Payment Page" to open Pesapal payment page</li>
                  <li>Complete payment on the Pesapal page</li>
                  <li>Return to this page to see status updates</li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">URL Features</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>✅ Payment URL generation</li>
                  <li>✅ New window/tab opening</li>
                  <li>✅ Real-time status polling</li>
                  <li>✅ Automatic completion detection</li>
                  <li>✅ Error handling</li>
                </ul>
              </div>

              <Button
                onClick={() => setShowPayment(true)}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Start URL Payment Test
              </Button>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Payment History
              </CardTitle>
              <CardDescription>
                Recent test payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ExternalLink className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payments yet</p>
                  <p className="text-sm">Start a test payment to see history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-900">
                            Payment #{index + 1}
                          </p>
                          <p className="text-sm text-green-700">
                            {payment.paymentId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-900">
                            KES {payment.amount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600">
                            {new Date(payment.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>URL-Based Payment Implementation</CardTitle>
            <CardDescription>
              Features implemented in this URL-based payment integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">URL Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Payment URL generation</li>
                  <li>✅ New window opening</li>
                  <li>✅ Popup handling</li>
                  <li>✅ URL validation</li>
                  <li>✅ Cross-window communication</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">User Experience</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Clear instructions</li>
                  <li>✅ Status updates</li>
                  <li>✅ Error handling</li>
                  <li>✅ Success feedback</li>
                  <li>✅ Payment history</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Technical</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ OAuth authentication</li>
                  <li>✅ Status polling</li>
                  <li>✅ Local storage</li>
                  <li>✅ Toast notifications</li>
                  <li>✅ Responsive design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison with STK Push */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>URL vs STK Push Comparison</CardTitle>
            <CardDescription>
              Differences between URL-based and STK Push payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  URL-Based Payment
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Opens Pesapal payment page</li>
                  <li>✅ User completes payment on Pesapal site</li>
                  <li>✅ More familiar payment experience</li>
                  <li>✅ Works on all devices</li>
                  <li>✅ No STK push required</li>
                  <li>✅ Better for web applications</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  STK Push Payment
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Direct STK push to phone</li>
                  <li>✅ Payment completed in app</li>
                  <li>✅ Seamless user experience</li>
                  <li>✅ Requires mobile money app</li>
                  <li>✅ Better for mobile apps</li>
                  <li>✅ More integrated experience</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <div className="mt-8 text-center">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Status:</strong> URL-based payment implementation active - Opens Pesapal payment pages
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Check browser console for detailed logs and debugging information
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { ProcessingFeePayment } from '@/components/ProcessingFeePayment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  Smartphone,
  AlertCircle,
  Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TestSTKPage() {
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
          
          <ProcessingFeePayment
            loanId="test-loan-123"
            userId="test-user-456"
            processingFeeAmount={500.00}
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
            🧪 STK Push Payment Test
          </h1>
          <p className="text-gray-600">
            Test the mock STK Push integration for processing fee payments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Test Information
              </CardTitle>
              <CardDescription>
                This page tests the STK Push payment functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Test Details</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Processing Fee:</strong> KES 500.00</p>
                  <p><strong>Payment Methods:</strong> M-Pesa, Airtel Money, Equitel</p>
                  <p><strong>Test Phone:</strong> Use any valid Kenyan phone number</p>
                  <p><strong>Environment:</strong> Mock Implementation</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">How to Test</h3>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Click "Start Payment Test" below</li>
                  <li>Select a payment method (M-Pesa, Airtel Money, or Equitel)</li>
                  <li>Enter a valid Kenyan phone number</li>
                  <li>Click "Pay KES 500" to initiate STK Push</li>
                  <li>Watch the payment status updates in real-time</li>
                  <li>Payment will complete automatically after 2-3 status checks</li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">Mock Features</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>✅ Simulated STK Push initiation</li>
                  <li>✅ Real-time status polling</li>
                  <li>✅ Automatic payment completion</li>
                  <li>✅ Error handling simulation</li>
                  <li>✅ Local storage tracking</li>
                </ul>
              </div>

              <Button
                onClick={() => setShowPayment(true)}
                className="w-full"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Start Payment Test
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
                  <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              Features implemented in this STK Push integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Payment Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ STK Push initiation</li>
                  <li>✅ Real-time status polling</li>
                  <li>✅ Payment method selection</li>
                  <li>✅ Phone number validation</li>
                  <li>✅ Currency formatting</li>
                  <li>✅ Local storage tracking</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">User Experience</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Loading states</li>
                  <li>✅ Error handling</li>
                  <li>✅ Success feedback</li>
                  <li>✅ Toast notifications</li>
                  <li>✅ Responsive design</li>
                  <li>✅ Payment history</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Mock Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Simulated API delays</li>
                  <li>✅ Realistic status updates</li>
                  <li>✅ Automatic completion</li>
                  <li>✅ Error simulation</li>
                  <li>✅ Console logging</li>
                  <li>✅ Local storage</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <div className="mt-8 text-center">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Status:</strong> Mock implementation active - No real payments will be processed
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

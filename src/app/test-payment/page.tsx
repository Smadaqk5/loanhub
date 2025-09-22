'use client'

import React, { useState } from 'react'
import { ProcessingFeePayment } from '@/components/ProcessingFeePayment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CreditCard, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TestPaymentPage() {
  const router = useRouter()
  const [showPayment, setShowPayment] = useState(false)

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData)
    alert('Payment completed successfully! Check console for details.')
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    alert(`Payment error: ${error}`)
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
      <div className="max-w-2xl mx-auto">
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
            STK Push Payment Test
          </h1>
          <p className="text-gray-600">
            Test the Pesapal STK Push integration for processing fee payments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Integration Test
            </CardTitle>
            <CardDescription>
              This page allows you to test the STK Push payment functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Test Information</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Processing Fee:</strong> KES 2,500.00 (5% of KES 50,000)</p>
                <p><strong>Payment Methods:</strong> M-Pesa, Airtel Money, Equitel</p>
                <p><strong>Test Phone:</strong> Use any valid Kenyan phone number</p>
                <p><strong>Environment:</strong> Pesapal Sandbox</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• This is a test environment - no real money will be charged</li>
                <li>• Use any valid Kenyan phone number format (+254 or 0)</li>
                <li>• You may receive a test STK Push on your phone</li>
                <li>• The payment will be simulated in the sandbox environment</li>
                <li>• Check the browser console for detailed logs</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">How to Test</h3>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>Click "Start Payment Test" below</li>
                <li>Select a payment method (M-Pesa, Airtel Money, or Equitel)</li>
                <li>Enter a valid Kenyan phone number</li>
                <li>Click "Pay KES 2,500" to initiate STK Push</li>
                <li>Check your phone for the payment prompt (if in test mode)</li>
                <li>Observe the payment status updates in real-time</li>
              </ol>
            </div>

            <Button
              onClick={() => setShowPayment(true)}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Start Payment Test
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                This test uses Pesapal sandbox credentials and will not process real payments
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Integration Features</CardTitle>
            <CardDescription>
              Features implemented in this STK Push integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Payment Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ STK Push initiation</li>
                  <li>✅ Real-time status polling</li>
                  <li>✅ Payment method selection</li>
                  <li>✅ Phone number validation</li>
                  <li>✅ Currency formatting</li>
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
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { URLOnlyPaymentForm } from '@/components/URLOnlyPaymentForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  ExternalLink,
  AlertCircle,
  Info,
  Globe,
  Smartphone
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

function LoanPaymentContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loanData, setLoanData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])

  // Helper function to safely calculate processing fee
  const calculateProcessingFee = (data: any): number => {
    console.log('Calculating processing fee for data:', data)
    
    // Try to get processing fee from various sources
    const processingFee = data?.processing_fee || data?.calculation?.processingFee;
    if (processingFee && !isNaN(processingFee) && processingFee > 0) {
      console.log('Using stored processing fee:', processingFee)
      return processingFee;
    }
    
    // Fallback: calculate 5% of loan amount
    const loanAmount = data?.amount_requested || data?.amount || 0;
    if (loanAmount && !isNaN(loanAmount) && loanAmount > 0) {
      const calculatedFee = loanAmount * 0.05;
      console.log('Calculated processing fee:', calculatedFee, 'from loan amount:', loanAmount)
      return calculatedFee;
    }
    
    // Final fallback: default amount
    console.log('Using default processing fee: 500')
    return 500;
  }

  useEffect(() => {
    if (user && !loading) {
      fetchLoanData()
    }
  }, [user, loading])

  const fetchLoanData = async () => {
    try {
      const loanId = searchParams.get('loanId')
      if (!loanId) {
        setError('No loan ID provided')
        setIsLoading(false)
        return
      }

      // Fetch loan data from localStorage or database
      const storedLoanData = localStorage.getItem(`loan_${loanId}`)
      if (storedLoanData) {
        const parsedData = JSON.parse(storedLoanData)
        console.log('Loaded loan data from localStorage:', parsedData)
        setLoanData(parsedData)
      } else {
        // Try to fetch from database
        const { data, error } = await supabase
          .from('loans')
          .select('*')
          .eq('id', loanId)
          .single()

        if (error) throw error
        setLoanData(data)
      }
    } catch (err: any) {
      console.error('Error fetching loan data:', err)
      setError('Failed to load loan data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      if (!loanData) {
        throw new Error('No loan data available')
      }

      // Update loan status in database
      const { error: updateError } = await supabase
        .from('loans')
        .update({
          status: 'processing_fee_paid',
          payment_method: 'url_payment',
          processing_fee_paid_at: new Date().toISOString(),
          payment_reference: paymentData.paymentId
        })
        .eq('id', loanData.id || searchParams.get('loanId'))

      if (updateError) throw updateError

      // Add to payment history
      setPaymentHistory(prev => [...prev, { ...paymentData, timestamp: new Date().toISOString() }])

      toast.success('Payment completed successfully! Your loan application is being processed.')
      
      // Redirect to dashboard with success message
      router.push('/dashboard?success=payment_completed&loan_id=' + (loanData.id || searchParams.get('loanId')))
    } catch (err: any) {
      console.error('Error processing payment success:', err)
      toast.error('Payment completed but failed to update loan status. Please contact support.')
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    toast.error(`Payment failed: ${error}`)
  }

  const handlePaymentCancel = () => {
    router.push('/loans/apply')
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment page...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
        <div className="max-w-md mx-auto py-12 px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
              <CardDescription>
                You must be logged in to access the payment page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => router.push('/auth/signin')}
                className="w-full"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/auth/signup')}
                variant="outline"
                className="w-full"
              >
                Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !loanData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-red-600">Error</CardTitle>
              <CardDescription className="text-red-700">
                {error || 'Loan data not found'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => router.push('/loans/apply')}
                className="w-full"
              >
                Apply for Loan
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={() => router.push('/loans/apply')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Application
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💳 Complete Your Payment
          </h1>
          <p className="text-gray-600">
            Pay your processing fee to complete your loan application
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <URLOnlyPaymentForm
              loanId={loanData.id || searchParams.get('loanId') || 'unknown'}
              userId={user.id}
              processingFeeAmount={calculateProcessingFee(loanData)}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </div>

          {/* Loan Details */}
          <div className="space-y-6">
            {/* Loan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Loan Summary
                </CardTitle>
                <CardDescription>
                  Details of your loan application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Amount:</span>
                    <span className="font-semibold">
                      KES {loanData.amount_requested?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee (5%):</span>
                    <span className="font-semibold text-red-600">
                      KES {calculateProcessingFee(loanData).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-semibold">
                      {loanData.interest_rate || 15}% per annum
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repayment Period:</span>
                    <span className="font-semibold">
                      {Math.ceil((new Date(loanData.repayment_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Repayment:</span>
                    <span className="font-semibold">
                      KES {loanData.total_repayment?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Secure payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <ExternalLink className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">URL Payment Method</p>
                      <p>Your payment will be processed through Pesapal's secure payment gateway. Click "Create Payment URL" to open the payment page.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Secure & Fast</p>
                      <p>Your payment is processed securely and your loan application will be updated automatically.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            {paymentHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Payment History
                  </CardTitle>
                  <CardDescription>
                    Recent payments for this loan
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>• Processing fee is non-refundable once paid</li>
                <li>• Your loan application will be reviewed after payment</li>
                <li>• You will receive email/SMS notifications about your application status</li>
                <li>• Payment is processed securely through Pesapal</li>
                <li>• If you encounter any issues, contact our support team</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoanPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment page...</p>
        </div>
      </div>
    }>
      <LoanPaymentContent />
    </Suspense>
  )
}

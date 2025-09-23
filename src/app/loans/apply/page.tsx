'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoanCalculator } from '@/components/LoanCalculator'
import { RateDisplay } from '@/components/RateDisplay'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { calculateLoan, formatCurrency } from '@/lib/loan-calculator'
import { systemSettingsService, SystemSettings } from '@/lib/system-settings'
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react'

const loanApplicationSchema = z.object({
  amount: z.number().min(1000, 'Minimum loan amount is KES 1,000'),
  repayment_period_days: z.number().min(30, 'Minimum repayment period is 30 days').max(365, 'Maximum repayment period is 365 days'),
  loan_purpose: z.string().min(10, 'Please provide a detailed loan purpose'),
  terms_accepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
})

type LoanApplicationForm = z.infer<typeof loanApplicationSchema>

export default function LoanApplicationPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    processing_fee_percentage: 5.0,
    interest_rate_percentage: 15.0,
    max_loan_amount: 100000,
    min_loan_amount: 1000,
    max_repayment_period_days: 365,
    late_payment_fee: 500,
    extension_fee_percentage: 2.0,
    auto_approval_threshold: 50000,
    maintenance_mode: false,
    email_notifications: true,
    sms_notifications: true
  })
  const [calculation, setCalculation] = useState<any>(null)
  const [pendingLoanData, setPendingLoanData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanApplicationForm>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      amount: 10000,
      repayment_period_days: 90,
      loan_purpose: '',
      terms_accepted: false,
    }
  })

  const watchedAmount = watch('amount')
  const watchedPeriod = watch('repayment_period_days')

  useEffect(() => {
    if (user) {
      fetchSystemSettings()
    }
  }, [user])

  useEffect(() => {
    if (watchedAmount && watchedPeriod) {
      const calc = calculateLoan(
        watchedAmount,
        systemSettings.processing_fee_percentage,
        systemSettings.interest_rate_percentage,
        watchedPeriod
      )
      setCalculation(calc)
    }
  }, [watchedAmount, watchedPeriod, systemSettings])

  const fetchSystemSettings = async () => {
    try {
      const settings = await systemSettingsService.getSettings()
      setSystemSettings(settings)
    } catch (error) {
      console.error('Error fetching system settings:', error)
      // Keep default settings if fetch fails
    }
  }

  const onSubmit = async (data: LoanApplicationForm) => {
    if (!user) {
      setError('You must be logged in to apply for a loan')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const calc = calculateLoan(
        data.amount,
        systemSettings.processing_fee_percentage,
        systemSettings.interest_rate_percentage,
        data.repayment_period_days
      )

      // Store the loan data for payment step
      setPendingLoanData({
        user_id: user.id,
        amount_requested: data.amount,
        processing_fee: calc.processingFee,
        interest_rate: systemSettings.interest_rate_percentage,
        net_disbursed: calc.netDisbursed,
        total_repayment: calc.totalRepayment,
        repayment_deadline: new Date(Date.now() + data.repayment_period_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        loan_purpose: data.loan_purpose,
        calculation: calc
      })

      // Store loan data in localStorage for payment page
      const loanId = `loan_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      const loanDataToStore = {
        id: loanId,
        user_id: user.id,
        amount_requested: data.amount,
        processing_fee: calc.processingFee,
        interest_rate: systemSettings.interest_rate_percentage,
        net_disbursed: calc.netDisbursed,
        total_repayment: calc.totalRepayment,
        repayment_deadline: new Date(Date.now() + data.repayment_period_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        loan_purpose: data.loan_purpose,
        calculation: calc
      }
      localStorage.setItem(`loan_${loanId}`, JSON.stringify(loanDataToStore))
      
      // Redirect to payment page
      router.push(`/loans/payment?loanId=${loanId}`)
    } catch (err: any) {
      console.error('Error in onSubmit:', err)
      setError(err.message || 'An error occurred while processing your application')
    } finally {
      setIsSubmitting(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading loan application..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="bg-lime-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CreditCard className="h-10 w-10 text-lime-600" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">Apply for Your Loan</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with your loan application. Create an account or sign in to continue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* New User - Create Account */}
            <Card className="loan-card enhanced-card group">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gradient">New to LoanHub?</CardTitle>
                <CardDescription className="text-center">
                  Create your account and start your loan application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-lime-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-lime-600" />
                    </div>
                    <span className="text-gray-700">Quick account setup</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-lime-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-lime-600" />
                    </div>
                    <span className="text-gray-700">Secure loan application</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-lime-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-lime-600" />
                    </div>
                    <span className="text-gray-700">Fast approval process</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => router.push('/auth/signup?returnUrl=/loans/apply')}
                  className="w-full btn-primary shimmer-effect"
                  size="lg"
                >
                  Create Account & Apply
                </Button>
                
                <p className="text-sm text-gray-500 text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>

            {/* Existing User - Sign In */}
            <Card className="loan-card enhanced-card group">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gradient">Already have an account?</CardTitle>
                <CardDescription className="text-center">
                  Sign in to continue your loan application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">Access your dashboard</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">Track loan status</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">Manage repayments</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => router.push('/auth/signin?returnUrl=/loans/apply')}
                  variant="outline"
                  className="w-full btn-secondary glass-effect"
                  size="lg"
                >
                  Sign In
                </Button>
                
                <p className="text-sm text-gray-500 text-center">
                  Forgot your password? <a href="/auth/reset-password" className="text-lime-600 hover:text-lime-700 underline">Reset it here</a>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="mt-12 text-center">
            <Card className="loan-card">
              <CardContent className="py-8">
                <h3 className="text-xl font-bold text-gradient mb-4">Why Choose LoanHub Kenya?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-lime-100 p-3 rounded-xl w-fit mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-lime-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Quick Approval</h4>
                    <p className="text-sm text-gray-600">Get approved within 24 hours</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-emerald-100 p-3 rounded-xl w-fit mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Secure Process</h4>
                    <p className="text-sm text-gray-600">Bank-level security for your data</p>
                  </div>
        <div className="text-center">
                    <div className="bg-green-100 p-3 rounded-xl w-fit mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Flexible Terms</h4>
                    <p className="text-sm text-gray-600">Choose your repayment period</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Apply for a Loan</h1>
          <p className="text-gray-600 mt-2">
            Fill out the form below to apply for your loan
          </p>
        </div>

        {/* Current Rates Display */}
        <div className="mb-8">
          <RateDisplay 
            processingFeePercentage={systemSettings.processing_fee_percentage}
            interestRatePercentage={systemSettings.interest_rate_percentage}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Loan Application Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Loan Application
                </CardTitle>
                <CardDescription>
                  Provide your loan details and requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Debug Information */}
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
                    <p className="text-blue-800 font-medium">Debug Info:</p>
                    <p className="text-blue-700">User: {user ? `${(user as any).full_name || user.email} (${user.email})` : 'Not logged in'}</p>
                    <p className="text-blue-700">Loading: {loading ? 'Yes' : 'No'}</p>
                    <p className="text-blue-700">Is Submitting: {isSubmitting ? 'Yes' : 'No'}</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount (KES)
                    </label>
                    <input
                      {...register('amount', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter loan amount"
                      min={systemSettings.min_loan_amount}
                      max={systemSettings.max_loan_amount}
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Min: {formatCurrency(systemSettings.min_loan_amount)} | Max: {formatCurrency(systemSettings.max_loan_amount)}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="repayment_period_days" className="block text-sm font-medium text-gray-700 mb-2">
                      Repayment Period (Days)
                    </label>
                    <input
                      {...register('repayment_period_days', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter repayment period"
                      min="30"
                      max={systemSettings.max_repayment_period_days}
                    />
                    {errors.repayment_period_days && (
                      <p className="mt-1 text-sm text-red-600">{errors.repayment_period_days.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Min: 30 days | Max: {systemSettings.max_repayment_period_days} days
                    </p>
                  </div>

                  <div>
                    <label htmlFor="loan_purpose" className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Purpose
                    </label>
                    <textarea
                      {...register('loan_purpose')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what you need the loan for..."
                    />
                    {errors.loan_purpose && (
                      <p className="mt-1 text-sm text-red-600">{errors.loan_purpose.message}</p>
                    )}
                  </div>

                  <div className="flex items-start">
                    <input
                      {...register('terms_accepted')}
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms_accepted" className="ml-2 text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {errors.terms_accepted && (
                    <p className="text-sm text-red-600">{errors.terms_accepted.message}</p>
                  )}

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Important Information:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Processing fee of {systemSettings.processing_fee_percentage}% will be deducted upfront</li>
                          <li>Interest rate: {systemSettings.interest_rate_percentage}% per annum</li>
                          <li>Your application will be reviewed within 24 hours</li>
                          <li>You will receive email notifications about your application status</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                    </Button>
                    
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Loan Calculator */}
          <div>
            <LoanCalculator
              onCalculate={setCalculation}
              initialAmount={watchedAmount || 10000}
              initialPeriod={watchedPeriod || 90}
            />

            {calculation && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Your Loan Summary</CardTitle>
                  <CardDescription>
                    Based on your current inputs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Requested Amount:</span>
                      <span className="font-semibold">{formatCurrency(calculation.requestedAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Processing Fee:</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(calculation.processingFee)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Interest:</span>
                      <span className="font-semibold text-blue-600">+{formatCurrency(calculation.interestAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Net Disbursed:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(calculation.netDisbursed)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-lg font-bold">
                      <span>Total Repayment:</span>
                      <span>{formatCurrency(calculation.totalRepayment)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

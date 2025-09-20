'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { CreditCard, Smartphone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  phone_number: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^(\+254|0)[0-9]{9}$/, 'Please enter a valid Kenyan phone number'),
  payment_method: z.enum(['mpesa', 'airtel_money', 'equitel'])
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  loanId: string
  userId: string
  maxAmount: number
  onPaymentInitiated: (paymentData: any) => void
  onPaymentCompleted: (paymentData: any) => void
  onError: (error: string) => void
}

export function PaymentForm({
  loanId,
  userId,
  maxAmount,
  onPaymentInitiated,
  onPaymentCompleted,
  onError
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiated' | 'processing' | 'completed' | 'failed'>('idle')
  const [paymentData, setPaymentData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: maxAmount,
      payment_method: 'mpesa'
    }
  })

  const watchedAmount = watch('amount')
  const watchedPaymentMethod = watch('payment_method')

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true)
    setPaymentStatus('initiated')

    try {
      const response = await fetch('/api/pesapal/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          loan_id: loanId,
          user_id: userId,
          amount: data.amount,
          phone_number: data.phone_number,
          payment_method: data.payment_method,
          description: `Loan repayment for loan ${loanId.slice(-8)}`
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initiate payment')
      }

      setPaymentData(result)
      setPaymentStatus('processing')
      onPaymentInitiated(result)

      // Poll for payment status
      pollPaymentStatus(result.payment_id)

    } catch (error: any) {
      console.error('Payment initiation error:', error)
      setPaymentStatus('failed')
      onError(error.message || 'Failed to initiate payment')
    } finally {
      setIsLoading(false)
    }
  }

  const pollPaymentStatus = async (paymentId: string) => {
    const maxAttempts = 30 // 5 minutes with 10-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/pesapal/status/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        const result = await response.json()

        if (result.success) {
          const status = result.payment.status

          if (status === 'completed') {
            setPaymentStatus('completed')
            onPaymentCompleted(result.payment)
            return
          } else if (status === 'failed') {
            setPaymentStatus('failed')
            onError('Payment failed. Please try again.')
            return
          }

          // Continue polling if still pending
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 10000) // Poll every 10 seconds
          } else {
            setPaymentStatus('failed')
            onError('Payment timeout. Please check your phone or try again.')
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000)
        } else {
          setPaymentStatus('failed')
          onError('Unable to verify payment status. Please contact support.')
        }
      }
    }

    // Start polling after a short delay
    setTimeout(poll, 5000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="h-5 w-5 text-green-600" />
      case 'airtel_money':
        return <Smartphone className="h-5 w-5 text-red-600" />
      case 'equitel':
        return <Smartphone className="h-5 w-5 text-blue-600" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa'
      case 'airtel_money':
        return 'Airtel Money'
      case 'equitel':
        return 'Equitel'
      default:
        return method
    }
  }

  if (paymentStatus === 'completed') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="h-6 w-6 mr-2" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-green-800 font-medium">
                Your payment of {formatCurrency(paymentData?.amount || 0)} has been processed successfully.
              </p>
            </div>
            <div className="text-sm text-green-700">
              <p>Payment Reference: {paymentData?.payment_reference || 'N/A'}</p>
              <p>Transaction ID: {paymentData?.order_tracking_id || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'failed') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-800">
            <AlertCircle className="h-6 w-6 mr-2" />
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-100 p-4 rounded-lg">
              <p className="text-red-800">
                Your payment could not be processed. Please try again or contact support.
              </p>
            </div>
            <Button
              onClick={() => {
                setPaymentStatus('idle')
                setPaymentData(null)
              }}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'processing') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Loader2 className="h-6 w-6 mr-2 animate-spin" />
            Processing Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-blue-800 font-medium">
                Please check your phone and complete the payment on your mobile device.
              </p>
            </div>
            <div className="text-sm text-blue-700">
              <p>Amount: {formatCurrency(paymentData?.amount || 0)}</p>
              <p>Method: {getPaymentMethodName(paymentData?.payment_method || '')}</p>
              <p>Phone: {paymentData?.phone_number || ''}</p>
            </div>
            <div className="text-xs text-blue-600">
              <p>⏱️ This may take a few minutes. Please do not close this page.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Make Payment
        </CardTitle>
        <CardDescription>
          Complete your loan repayment using mobile money
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES)
            </label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount to pay"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Maximum: {formatCurrency(maxAmount)}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-3">
              {[
                { value: 'mpesa', label: 'M-Pesa', description: 'Safaricom M-Pesa' },
                { value: 'airtel_money', label: 'Airtel Money', description: 'Airtel Money' },
                { value: 'equitel', label: 'Equitel', description: 'Equity Bank Equitel' }
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    watchedPaymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    {...register('payment_method')}
                    type="radio"
                    value={method.value}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    {getPaymentMethodIcon(method.value)}
                    <div className="ml-3">
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.payment_method && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              {...register('phone_number')}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+254 700 000 000 or 0700 000 000"
            />
            {errors.phone_number && (
              <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter the phone number registered with your mobile money account
            </p>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{formatCurrency(watchedAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium">{getPaymentMethodName(watchedPaymentMethod)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(watchedAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure you have sufficient balance in your mobile money account</li>
                  <li>You will receive a payment prompt on your phone</li>
                  <li>Enter your mobile money PIN to complete the payment</li>
                  <li>Do not close this page until payment is confirmed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || watchedAmount <= 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Initiating Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay {formatCurrency(watchedAmount || 0)}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

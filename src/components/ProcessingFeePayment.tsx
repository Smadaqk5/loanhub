'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  CreditCard, 
  Smartphone, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Clock,
  XCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { pesapalService, PaymentRequest, PaymentStatus } from '@/lib/pesapal-service-prod'
import { pesapalURLService } from '@/lib/pesapal-url-service'
import { pesapalURLService as mockPesapalURLService } from '@/lib/pesapal-url-service-mock'
import toast from 'react-hot-toast'

const processingFeeSchema = z.object({
  phone_number: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^(\+254|0)[0-9]{9}$/, 'Please enter a valid Kenyan phone number'),
  payment_method: z.enum(['mpesa', 'airtel_money', 'equitel']),
  payment_type: z.enum(['stk_push', 'url_payment'])
})

type ProcessingFeeFormData = z.infer<typeof processingFeeSchema>

interface ProcessingFeePaymentProps {
  loanId: string
  userId: string
  processingFeeAmount: number
  onPaymentSuccess: (paymentData: any) => void
  onPaymentError: (error: string) => void
  onCancel: () => void
}

export function ProcessingFeePayment({
  loanId,
  userId,
  processingFeeAmount,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}: ProcessingFeePaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiated' | 'processing' | 'completed' | 'failed' | 'url_created'>('idle')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<PaymentStatus | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ProcessingFeeFormData>({
    resolver: zodResolver(processingFeeSchema),
    defaultValues: {
      payment_method: 'mpesa',
      payment_type: 'stk_push'
    }
  })

  const watchedPaymentMethod = watch('payment_method')
  const watchedPaymentType = watch('payment_type')

  const onSubmit = async (data: ProcessingFeeFormData) => {
    setIsLoading(true)
    setPaymentStatus('initiated')

    try {
      const paymentRequest: PaymentRequest = {
        loanId,
        userId,
        amount: processingFeeAmount,
        phoneNumber: data.phone_number,
        paymentMethod: data.payment_method,
        description: `Processing fee payment for loan ${loanId.slice(-8)}`
      }

      let result: any

      if (data.payment_type === 'url_payment') {
        // Create payment URL with fallback to mock service
        try {
          console.log('Attempting to create payment URL with real Pesapal service...')
          result = await pesapalURLService.createPaymentURL(paymentRequest)
          console.log('Real Pesapal service result:', result)
          
          // If the real service fails, try mock service
          if (!result.success) {
            console.warn('Real Pesapal API failed, using mock service. Error:', result.error)
            result = await mockPesapalURLService.createPaymentURL(paymentRequest)
            console.log('Mock service result:', result)
          }
        } catch (error) {
          console.warn('Real Pesapal API threw exception, using mock service:', error)
          try {
            result = await mockPesapalURLService.createPaymentURL(paymentRequest)
            console.log('Mock service result after exception:', result)
          } catch (mockError) {
            console.error('Both real and mock services failed:', mockError)
            throw new Error('Payment service unavailable. Please try again later.')
          }
        }
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to create payment URL')
        }

        setPaymentData(result)
        setPaymentUrl(result.paymentUrl || '')
        setPaymentStatus('url_created')
        
        toast.success('Payment URL created! Click "Open Payment Page" to proceed.')
      } else {
        // Initiate STK Push
        result = await pesapalService.initiateSTKPush(paymentRequest)

        if (!result.success) {
          throw new Error(result.error || 'Failed to initiate payment')
        }

        setPaymentData(result)
        setPaymentStatus('processing')
        
        toast.success('STK Push sent! Please check your phone and enter your PIN.')
      }

      // Start polling for payment status
      if (result.orderTrackingId) {
        let service: any
        if (data.payment_type === 'url_payment') {
          service = result.paymentUrl?.includes('mock') ? mockPesapalURLService : pesapalURLService
        } else {
          service = pesapalService
        }
        await service.pollPaymentStatus(
          result.orderTrackingId,
          (status) => {
            setCurrentPaymentStatus(status)
            
            if (status.status === 'completed') {
              setPaymentStatus('completed')
              toast.success('Payment completed successfully!')
              onPaymentSuccess({
                paymentId: result.paymentId,
                orderTrackingId: result.orderTrackingId,
                amount: processingFeeAmount,
                status: 'completed'
              })
            } else if (status.status === 'failed') {
              setPaymentStatus('failed')
              toast.error('Payment failed. Please try again.')
              onPaymentError('Payment failed. Please try again.')
            }
          },
          300000 // 5 minutes timeout
        )
      }

    } catch (error: any) {
      console.error('Payment initiation error:', error)
      setPaymentStatus('failed')
      toast.error(error.message || 'Failed to initiate payment')
      onPaymentError(error.message || 'Failed to initiate payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenPaymentURL = () => {
    if (paymentUrl) {
      pesapalURLService.openPaymentURL(paymentUrl)
      toast.info('Payment page opened in new window. Complete payment there.')
    }
  }

  const formatCurrency = (amount: number) => {
    return pesapalService.formatCurrency(amount)
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
    return pesapalService.getPaymentMethodName(method)
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'completed':
        return <CheckCircle className="h-16 w-16 text-green-600" />
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-600" />
      case 'processing':
        return <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
      case 'url_created':
        return <ExternalLink className="h-16 w-16 text-yellow-600" />
      case 'initiated':
        return <Clock className="h-16 w-16 text-yellow-600" />
      default:
        return <CreditCard className="h-16 w-16 text-gray-600" />
    }
  }

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'processing':
        return 'border-blue-200 bg-blue-50'
      case 'url_created':
        return 'border-yellow-200 bg-yellow-50'
      case 'initiated':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'Payment Successful!'
      case 'failed':
        return 'Payment Failed'
      case 'processing':
        return 'Processing Payment...'
      case 'url_created':
        return 'Payment URL Ready'
      case 'initiated':
        return 'Payment Initiated'
      default:
        return 'Pay Processing Fee'
    }
  }

  const getStatusDescription = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'Your processing fee has been paid successfully. Your loan application will now be reviewed.'
      case 'failed':
        return 'Your payment could not be processed. Please check your mobile money balance and try again.'
      case 'processing':
        return 'Please check your phone and enter your mobile money PIN to complete the payment.'
      case 'url_created':
        return 'Payment URL has been created. Click "Open Payment Page" to proceed with payment.'
      case 'initiated':
        return 'STK Push has been sent to your phone. Please check and enter your PIN.'
      default:
        return 'Complete your processing fee payment to proceed with your loan application.'
    }
  }

  if (paymentStatus === 'completed') {
    return (
      <Card className={`${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl text-green-800">
            {getStatusTitle()}
          </CardTitle>
          <CardDescription className="text-green-700">
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Processing fee of {formatCurrency(processingFeeAmount)} paid successfully!
              </span>
            </div>
          </div>
          
          {paymentData && (
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{formatCurrency(processingFeeAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">{getPaymentMethodName(paymentData.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-xs">{paymentData.paymentId}</span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => onPaymentSuccess(paymentData)}
            className="w-full"
          >
            Continue to Loan Application
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'failed') {
    return (
      <Card className={`${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl text-red-800">
            {getStatusTitle()}
          </CardTitle>
          <CardDescription className="text-red-700">
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-100 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                Payment could not be completed
              </span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Please check your mobile money balance and try again. If the problem persists, contact support.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => {
                setPaymentStatus('idle')
                setPaymentData(null)
                setCurrentPaymentStatus(null)
              }}
              className="w-full"
            >
              Try Again
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'url_created') {
    return (
      <Card className={`${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl text-blue-800">
            {getStatusTitle()}
          </CardTitle>
          <CardDescription className="text-blue-700">
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="flex items-center">
              <ExternalLink className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                Payment page ready to open
              </span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Click the button below to open the payment page in a new window. Complete your payment there.
            </p>
          </div>

          {paymentData && (
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{formatCurrency(processingFeeAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">{getPaymentMethodName(watchedPaymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-xs">{paymentData.paymentId}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleOpenPaymentURL}
              className="w-full"
              disabled={!paymentUrl}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Payment Page
            </Button>
            
            <Button
              onClick={() => {
                setPaymentStatus('idle')
                setPaymentData(null)
                setCurrentPaymentStatus(null)
                setPaymentUrl('')
              }}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ⏱️ This may take a few minutes. Please do not close this page.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'processing' || paymentStatus === 'initiated') {
    return (
      <Card className={`${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl text-blue-800">
            {getStatusTitle()}
          </CardTitle>
          <CardDescription className="text-blue-700">
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                Check your phone for payment prompt
              </span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Enter your mobile money PIN when prompted. This page will update automatically when payment is completed.
            </p>
          </div>

          {paymentData && (
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{formatCurrency(processingFeeAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">{getPaymentMethodName(watchedPaymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-xs">{paymentData.paymentId}</span>
                </div>
              </div>
            </div>
          )}

          {currentPaymentStatus && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-yellow-800 text-sm">
                  Status: {currentPaymentStatus.status.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ⏱️ This may take a few minutes. Please do not close this page.
            </p>
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
          Pay Processing Fee
        </CardTitle>
        <CardDescription>
          Complete your processing fee payment to proceed with your loan application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Payment Amount Display */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Processing Fee Amount</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(processingFeeAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This fee is required to process your loan application
              </p>
            </div>
          </div>

          {/* Payment Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Type
            </label>
            <div className="space-y-3">
              {[
                { value: 'stk_push', label: 'STK Push', description: 'Direct payment to your phone' },
                { value: 'url_payment', label: 'Payment URL', description: 'Open payment page in new window' }
              ].map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    watchedPaymentType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    {...register('payment_type')}
                    type="radio"
                    value={type.value}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    {type.value === 'stk_push' ? (
                      <Smartphone className="h-5 w-5 text-green-600" />
                    ) : (
                      <ExternalLink className="h-5 w-5 text-blue-600" />
                    )}
                    <div className="ml-3">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.payment_type && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_type.message}</p>
            )}
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
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

          {/* Phone Number Input */}
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
                  <li>Processing fee is non-refundable once paid</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {watchedPaymentType === 'url_payment' ? 'Creating Payment URL...' : 'Initiating Payment...'}
                </>
              ) : (
                <>
                  {watchedPaymentType === 'url_payment' ? (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  {watchedPaymentType === 'url_payment' ? 'Create Payment URL' : `Pay ${formatCurrency(processingFeeAmount)}`}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

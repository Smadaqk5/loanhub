// Payment Page Generator Component
'use client'

import { useState } from 'react'
import { paymentPageService, PaymentPageRequest } from '@/lib/payment-page-service'
import { toast } from 'react-hot-toast'

interface PaymentPageGeneratorProps {
  onPaymentPageCreated?: (paymentId: string, paymentUrl: string) => void
  onError?: (error: string) => void
}

export function PaymentPageGenerator({ 
  onPaymentPageCreated, 
  onError 
}: PaymentPageGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<PaymentPageRequest>({
    loanId: '',
    userId: '',
    amount: 0,
    phoneNumber: '',
    paymentMethod: 'mpesa',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentRequest.loanId || !paymentRequest.userId || !paymentRequest.amount || !paymentRequest.phoneNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await paymentPageService.createPaymentPage(paymentRequest)
      
      if (response.success && response.paymentId && response.paymentUrl) {
        toast.success('Payment page created successfully!')
        onPaymentPageCreated?.(response.paymentId, response.paymentUrl)
      } else {
        throw new Error(response.error || 'Failed to create payment page')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment page'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof PaymentPageRequest, value: string | number) => {
    setPaymentRequest(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Generate Payment Page
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan ID *
          </label>
          <input
            type="text"
            value={paymentRequest.loanId}
            onChange={(e) => handleInputChange('loanId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter loan ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID *
          </label>
          <input
            type="text"
            value={paymentRequest.userId}
            onChange={(e) => handleInputChange('userId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter user ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (KES) *
          </label>
          <input
            type="number"
            value={paymentRequest.amount}
            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            min="1"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={paymentRequest.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+254700000000"
            pattern="^(\+254|0)[0-9]{9}$"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method *
          </label>
          <select
            value={paymentRequest.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value as 'mpesa' | 'airtel_money' | 'equitel')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="mpesa">M-Pesa</option>
            <option value="airtel_money">Airtel Money</option>
            <option value="equitel">Equitel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={paymentRequest.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter payment description"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Payment Page...' : 'Generate Payment Page'}
        </button>
      </form>
    </div>
  )
}

// Quick Payment Page Generator for common scenarios
export function QuickPaymentPageGenerator() {
  const [generatedPayment, setGeneratedPayment] = useState<{
    paymentId: string
    paymentUrl: string
  } | null>(null)

  const generateProcessingFeePayment = async () => {
    const paymentRequest: PaymentPageRequest = {
      loanId: `LOAN_${Date.now()}`,
      userId: `USER_${Date.now()}`,
      amount: 500,
      phoneNumber: '+254700000000',
      paymentMethod: 'mpesa',
      description: 'Processing fee payment for loan application'
    }

    try {
      const response = await paymentPageService.createPaymentPage(paymentRequest)
      
      if (response.success && response.paymentId && response.paymentUrl) {
        setGeneratedPayment({
          paymentId: response.paymentId,
          paymentUrl: response.paymentUrl
        })
        toast.success('Processing fee payment page created!')
      } else {
        throw new Error(response.error || 'Failed to create payment page')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment page'
      toast.error(errorMessage)
    }
  }

  const generateLoanRepayment = async () => {
    const paymentRequest: PaymentPageRequest = {
      loanId: `LOAN_${Date.now()}`,
      userId: `USER_${Date.now()}`,
      amount: 5000,
      phoneNumber: '+254700000000',
      paymentMethod: 'mpesa',
      description: 'Loan repayment'
    }

    try {
      const response = await paymentPageService.createPaymentPage(paymentRequest)
      
      if (response.success && response.paymentId && response.paymentUrl) {
        setGeneratedPayment({
          paymentId: response.paymentId,
          paymentUrl: response.paymentUrl
        })
        toast.success('Loan repayment page created!')
      } else {
        throw new Error(response.error || 'Failed to create payment page')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment page'
      toast.error(errorMessage)
    }
  }

  if (generatedPayment) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-green-500 text-4xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Payment Page Created!
          </h2>
          <p className="text-gray-600 mb-6">
            Your payment page has been generated successfully.
          </p>
          
          <div className="space-y-3">
            <a
              href={generatedPayment.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Open Payment Page
            </a>
            
            <button
              onClick={() => setGeneratedPayment(null)}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Create Another Payment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Quick Payment Page Generator
      </h2>
      
      <div className="space-y-4">
        <button
          onClick={generateProcessingFeePayment}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition-colors"
        >
          Generate Processing Fee Payment (KES 500)
        </button>
        
        <button
          onClick={generateLoanRepayment}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Generate Loan Repayment (KES 5,000)
        </button>
      </div>
    </div>
  )
}

export default PaymentPageGenerator

// PesaPal Payment Link Generator Component
'use client'

import { useState } from 'react'
import { pesapalPaymentLinkGenerator, PesaPalPaymentRequest } from '@/lib/pesapal-payment-link-generator'
import { toast } from 'react-hot-toast'

interface PesaPalPaymentLinkGeneratorProps {
  onPaymentLinkCreated?: (paymentLink: string, merchantReference: string) => void
  onError?: (error: string) => void
}

export function PesaPalPaymentLinkGenerator({ 
  onPaymentLinkCreated, 
  onError 
}: PesaPalPaymentLinkGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<Partial<PesaPalPaymentRequest>>({
    amount: 0,
    currency: 'KES',
    description: '',
    phoneNumber: '',
    paymentMethod: 'mpesa',
    customerEmail: '',
    customerName: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentRequest.amount || !paymentRequest.description || !paymentRequest.phoneNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const paymentLink = await pesapalPaymentLinkGenerator.createPaymentLink({
        amount: paymentRequest.amount!,
        currency: paymentRequest.currency!,
        description: paymentRequest.description!,
        phoneNumber: paymentRequest.phoneNumber!,
        paymentMethod: paymentRequest.paymentMethod!,
        merchantReference: pesapalPaymentLinkGenerator['generateMerchantReference'](),
        callbackUrl: `${window.location.origin}/payment/callback`,
        customerEmail: paymentRequest.customerEmail,
        customerName: paymentRequest.customerName
      })
      
      toast.success('PesaPal payment link created successfully!')
      onPaymentLinkCreated?.(paymentLink.paymentUrl, paymentLink.merchantReference)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment link'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof PesaPalPaymentRequest, value: string | number) => {
    setPaymentRequest(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Generate PesaPal Payment Link
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
            Description *
          </label>
          <input
            type="text"
            value={paymentRequest.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter payment description"
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
            Customer Email
          </label>
          <input
            type="email"
            value={paymentRequest.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="customer@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name
          </label>
          <input
            type="text"
            value={paymentRequest.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Customer Name"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Payment Link...' : 'Generate PesaPal Payment Link'}
        </button>
      </form>
    </div>
  )
}

// Quick PesaPal Payment Link Generator for common scenarios
export function QuickPesaPalPaymentLinkGenerator() {
  const [generatedLink, setGeneratedLink] = useState<{
    paymentUrl: string
    merchantReference: string
  } | null>(null)

  const generateProcessingFeePayment = async () => {
    try {
      const paymentLink = await pesapalPaymentLinkGenerator.createProcessingFeePaymentLink(
        `LOAN_${Date.now()}`,
        500,
        '+254700000000',
        'mpesa'
      )
      
      setGeneratedLink({
        paymentUrl: paymentLink.paymentUrl,
        merchantReference: paymentLink.merchantReference
      })
      toast.success('Processing fee payment link created!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment link'
      toast.error(errorMessage)
    }
  }

  const generateLoanRepayment = async () => {
    try {
      const paymentLink = await pesapalPaymentLinkGenerator.createLoanRepaymentLink(
        `LOAN_${Date.now()}`,
        5000,
        '+254700000000',
        'mpesa'
      )
      
      setGeneratedLink({
        paymentUrl: paymentLink.paymentUrl,
        merchantReference: paymentLink.merchantReference
      })
      toast.success('Loan repayment link created!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment link'
      toast.error(errorMessage)
    }
  }

  const generateQuickPayment = async () => {
    try {
      const paymentLink = await pesapalPaymentLinkGenerator.createQuickPaymentLink(
        100,
        'Quick payment test',
        '+254700000000',
        'mpesa'
      )
      
      setGeneratedLink({
        paymentUrl: paymentLink.paymentUrl,
        merchantReference: paymentLink.merchantReference
      })
      toast.success('Quick payment link created!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment link'
      toast.error(errorMessage)
    }
  }

  if (generatedLink) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-green-500 text-4xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            PesaPal Payment Link Created!
          </h2>
          <p className="text-gray-600 mb-6">
            Your payment link has been generated successfully. Click the button below to open the PesaPal payment interface.
          </p>
          
          <div className="space-y-3">
            <a
              href={generatedLink.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              Open PesaPal Payment Page
            </a>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink.paymentUrl)
                toast.success('Payment URL copied to clipboard!')
              }}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Copy Payment URL
            </button>
            
            <button
              onClick={() => setGeneratedLink(null)}
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
        Quick PesaPal Payment Links
      </h2>
      
      <div className="space-y-4">
        <button
          onClick={generateQuickPayment}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition-colors"
        >
          Generate Quick Payment (KES 100)
        </button>
        
        <button
          onClick={generateProcessingFeePayment}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Generate Processing Fee Payment (KES 500)
        </button>
        
        <button
          onClick={generateLoanRepayment}
          className="w-full bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600 transition-colors"
        >
          Generate Loan Repayment (KES 5,000)
        </button>
      </div>
    </div>
  )
}

export default PesaPalPaymentLinkGenerator

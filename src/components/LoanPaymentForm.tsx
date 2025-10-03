// Loan Payment Form Component
// Professional loan payment interface for Loanhub

'use client'

import { useState } from 'react'

interface LoanPaymentFormProps {
  onPaymentSuccess?: (data: any) => void
  onPaymentError?: (error: string) => void
}

export function LoanPaymentForm({ onPaymentSuccess, onPaymentError }: LoanPaymentFormProps) {
  const [formData, setFormData] = useState({
    customerPhone: '',
    loanAmount: '',
    loanReference: '',
    paymentType: 'repayment' as 'repayment' | 'application_fee' | 'late_fee' | 'processing_fee',
    customerName: '',
    customerEmail: '',
    description: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Format as +254XXXXXXXXX
    if (cleaned.startsWith('254')) {
      return `+${cleaned}`
    } else if (cleaned.startsWith('0')) {
      return `+254${cleaned.substring(1)}`
    } else if (cleaned.length === 9) {
      return `+254${cleaned}`
    }
    return phone
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData(prev => ({
      ...prev,
      customerPhone: formatted
    }))
  }

  const validateForm = () => {
    if (!formData.customerPhone || !formData.loanAmount || !formData.loanReference || !formData.customerName) {
      return 'Please fill in all required fields'
    }

    if (Number(formData.loanAmount) <= 0) {
      return 'Loan amount must be greater than 0'
    }

    const phoneRegex = /^(\+254|0)[0-9]{9}$/
    if (!phoneRegex.test(formData.customerPhone.replace(/\s/g, ''))) {
      return 'Please enter a valid Kenyan phone number'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      onPaymentError?.(validationError)
      return
    }

    setIsLoading(true)
    setPaymentResult(null)

    try {
      console.log('🏦 Submitting loan payment request...')
      
      const response = await fetch('/api/loan-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Loan payment created successfully:', result.data)
        setPaymentResult(result.data)
        onPaymentSuccess?.(result.data)
      } else {
        console.error('❌ Loan payment failed:', result.error)
        onPaymentError?.(result.error)
      }
    } catch (error: any) {
      console.error('❌ Loan payment request failed:', error)
      onPaymentError?.(error.message || 'Payment request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectPayment = async () => {
    const validationError = validateForm()
    if (validationError) {
      onPaymentError?.(validationError)
      return
    }

    setIsLoading(true)
    setPaymentResult(null)

    try {
      console.log('📱 Creating direct mobile loan payment...')
      
      const response = await fetch('/api/loan-payment/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Direct loan payment created successfully:', result.data)
        setPaymentResult(result.data)
        onPaymentSuccess?.(result.data)
      } else {
        console.error('❌ Direct loan payment failed:', result.error)
        onPaymentError?.(result.error)
      }
    } catch (error: any) {
      console.error('❌ Direct loan payment request failed:', error)
      onPaymentError?.(error.message || 'Direct payment request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const openPaymentUrl = () => {
    if (paymentResult?.redirectUrl) {
      window.open(paymentResult.redirectUrl, '_blank')
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🏦</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loan Payment</h2>
        <p className="text-gray-600">Secure loan payment processing with PesaPal</p>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+254XXXXXXXXX or 0XXXXXXXXX"
              required
            />
          </div>
        </div>

        {/* Loan Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Reference *
            </label>
            <input
              type="text"
              name="loanReference"
              value={formData.loanReference}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., LH001234"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type *
            </label>
            <select
              name="paymentType"
              value={formData.paymentType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="repayment">Loan Repayment</option>
              <option value="application_fee">Application Fee</option>
              <option value="late_fee">Late Payment Fee</option>
              <option value="processing_fee">Processing Fee</option>
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount (KES) *
          </label>
          <input
            type="number"
            name="loanAmount"
            value={formData.loanAmount}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount in KES"
            min="1"
            required
          />
        </div>

        {/* Email (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address (Optional)
          </label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="customer@example.com"
          />
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional payment details"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Processing...' : 'Create Payment URL'}
          </button>

          <button
            type="button"
            onClick={handleDirectPayment}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Processing...' : 'Direct Mobile Payment'}
          </button>
        </div>
      </form>

      {/* Payment Result */}
      {paymentResult && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <span className="text-green-500 text-xl mr-2">✅</span>
            <h3 className="font-semibold text-green-800">Payment URL Created Successfully!</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><strong>Order Tracking ID:</strong> {paymentResult.orderTrackingId}</p>
            <p><strong>Loan Reference:</strong> {paymentResult.loanReference}</p>
            <p><strong>Amount:</strong> KES {paymentResult.amount?.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> {paymentResult.paymentMethod}</p>
            <p><strong>Mobile Optimized:</strong> {paymentResult.mobileOptimized ? 'Yes' : 'No'}</p>
          </div>

          <button
            onClick={openPaymentUrl}
            className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
          >
            📱 Open Payment Page
          </button>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <span className="text-blue-500 text-xl mr-2">🔒</span>
          <div>
            <h4 className="font-semibold text-blue-800">Secure Payment Processing</h4>
            <p className="text-sm text-blue-700">
              All payments are processed securely through PesaPal. Your financial information is protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

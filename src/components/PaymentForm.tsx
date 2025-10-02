// Modern Payment Component
'use client'

import { useState, useEffect } from 'react'
import { PaymentRequest, PaymentResponse, PaymentStatus } from '@/types/payment'
import { paymentServiceFactory } from '@/services/payment-service-factory'

interface PaymentFormProps {
  onPaymentSuccess?: (status: PaymentStatus) => void
  onPaymentError?: (error: string) => void
  onPaymentCancel?: () => void
  defaultAmount?: number
  defaultPhoneNumber?: string
  defaultDescription?: string
}

export function PaymentForm({
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
  defaultAmount = 0,
  defaultPhoneNumber = '+254700000000',
  defaultDescription = 'Payment via STK Push'
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: defaultAmount,
    phoneNumber: defaultPhoneNumber,
    paymentMethod: 'mpesa' as const,
    description: defaultDescription,
    customerName: '',
    customerEmail: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [currentPayment, setCurrentPayment] = useState<PaymentStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Initiate payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.phoneNumber || !formData.description) {
      onPaymentError?.('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const paymentRequest: PaymentRequest = {
        id: `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        amount: formData.amount,
        currency: 'KES',
        phoneNumber: formData.phoneNumber,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail
      }

      const response = await paymentServiceFactory.initiatePayment(paymentRequest)

      if (response.success) {
        // Start polling for status updates
        setIsPolling(true)
        pollPaymentStatus(response.orderTrackingId)
      } else {
        onPaymentError?.(response.error || 'Payment initiation failed')
      }

    } catch (error) {
      console.error('Payment error:', error)
      onPaymentError?.(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Poll payment status
  const pollPaymentStatus = async (orderTrackingId: string) => {
    try {
      const finalStatus = await paymentServiceFactory.pollPaymentStatus(
        orderTrackingId,
        (status) => {
          setCurrentPayment(status)
          console.log('Payment status update:', status)
        },
        300000 // 5 minutes timeout
      )

      if (finalStatus) {
        setCurrentPayment(finalStatus)
        
        if (finalStatus.status === 'completed') {
          onPaymentSuccess?.(finalStatus)
        } else if (finalStatus.status === 'failed') {
          onPaymentError?.(finalStatus.errorMessage || 'Payment failed')
        }
      } else {
        onPaymentError?.('Payment timeout - please check your phone')
      }

    } catch (error) {
      console.error('Polling error:', error)
      onPaymentError?.('Status checking failed')
    } finally {
      setIsPolling(false)
    }
  }

  // Cancel payment
  const handleCancel = async () => {
    if (currentPayment) {
      await paymentServiceFactory.cancelPayment(currentPayment.orderTrackingId)
    }
    setCurrentPayment(null)
    setIsPolling(false)
    onPaymentCancel?.()
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get status color
  const getStatusColor = (status: PaymentStatus['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">STK Push Payment</h2>
        <p className="text-gray-600 mt-2">Secure mobile money payment</p>
      </div>

      {/* Service Info */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-800">
            {paymentServiceFactory.isUsingMockService() ? '🔧 Development Mode' : '🚀 Production Mode'}
          </span>
          <span className="text-blue-600">
            {paymentServiceFactory.isUsingMockService() ? 'Mock Payments' : 'Real Payments'}
          </span>
        </div>
      </div>

      {/* Payment Status */}
      {currentPayment && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-800">Payment Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentPayment.status)}`}>
              {currentPayment.status.toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <p>Amount: {formatCurrency(currentPayment.amount)}</p>
            <p>Phone: {currentPayment.phoneNumber}</p>
            <p>Method: {currentPayment.paymentMethod.toUpperCase()}</p>
            {currentPayment.completedAt && (
              <p>Completed: {new Date(currentPayment.completedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (KES) *
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter amount"
            min="1"
            step="0.01"
            required
            disabled={isLoading || isPolling}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+254700000000 or 0700000000"
            pattern="^(\+254|0)[0-9]{9}$"
            required
            disabled={isLoading || isPolling}
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method *
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading || isPolling}
          >
            <option value="mpesa">M-Pesa</option>
            <option value="airtel_money">Airtel Money</option>
            <option value="equitel">Equitel</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Payment description"
            required
            disabled={isLoading || isPolling}
          />
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Customer name (optional)"
            disabled={isLoading || isPolling}
          />
        </div>

        {/* Customer Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Email
          </label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="customer@example.com (optional)"
            disabled={isLoading || isPolling}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isPolling ? (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Initiating Payment...' : `Pay ${formatCurrency(formData.amount)}`}
            </button>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Processing Payment...
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full mt-3 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel Payment
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">Instructions:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Ensure you have sufficient balance in your mobile money account</li>
          <li>• You will receive a payment prompt on your phone</li>
          <li>• Enter your mobile money PIN to complete the payment</li>
          <li>• Do not close this page until payment is confirmed</li>
        </ul>
      </div>
    </div>
  )
}
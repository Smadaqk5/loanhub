// Payment Status Component
'use client'

import { useState, useEffect } from 'react'
import { PaymentStatus } from '@/types/payment'
import { paymentServiceFactory } from '@/services/payment-service-factory'

interface PaymentStatusProps {
  orderTrackingId: string
  onStatusUpdate?: (status: PaymentStatus) => void
  onPaymentComplete?: (status: PaymentStatus) => void
  onPaymentFailed?: (status: PaymentStatus) => void
  autoRefresh?: boolean
  refreshInterval?: number
}

export function PaymentStatusComponent({
  orderTrackingId,
  onStatusUpdate,
  onPaymentComplete,
  onPaymentFailed,
  autoRefresh = true,
  refreshInterval = 5000
}: PaymentStatusProps) {
  const [status, setStatus] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch payment status
  const fetchStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const paymentStatus = await paymentServiceFactory.checkPaymentStatus(orderTrackingId)
      
      if (paymentStatus) {
        setStatus(paymentStatus)
        onStatusUpdate?.(paymentStatus)
        
        // Trigger callbacks based on status
        if (paymentStatus.status === 'completed') {
          onPaymentComplete?.(paymentStatus)
        } else if (paymentStatus.status === 'failed') {
          onPaymentFailed?.(paymentStatus)
        }
      } else {
        setError('Payment not found')
      }
    } catch (err) {
      console.error('Failed to fetch payment status:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch status')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !orderTrackingId) return

    // Initial fetch
    fetchStatus()

    // Set up interval
    const interval = setInterval(fetchStatus, refreshInterval)

    return () => clearInterval(interval)
  }, [orderTrackingId, autoRefresh, refreshInterval])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Get status color
  const getStatusColor = (status: PaymentStatus['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'expired': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Get status icon
  const getStatusIcon = (status: PaymentStatus['status']) => {
    switch (status) {
      case 'completed': return '✅'
      case 'failed': return '❌'
      case 'cancelled': return '🚫'
      case 'processing': return '⏳'
      case 'pending': return '⏱️'
      case 'expired': return '⏰'
      default: return '❓'
    }
  }

  // Loading state
  if (isLoading && !status) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment status...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No status found
  if (!status) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="text-gray-500 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Not Found</h3>
          <p className="text-gray-600">No payment found with ID: {orderTrackingId}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{getStatusIcon(status.status)}</div>
        <h2 className="text-xl font-bold text-gray-800">Payment Status</h2>
        <p className="text-gray-600">Order ID: {status.orderTrackingId}</p>
      </div>

      {/* Status Badge */}
      <div className="text-center mb-6">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}>
          {status.status.toUpperCase()}
        </span>
      </div>

      {/* Payment Details */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-gray-800">{formatCurrency(status.amount)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">Phone:</span>
          <span className="font-semibold text-gray-800">{status.phoneNumber}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">Method:</span>
          <span className="font-semibold text-gray-800">{status.paymentMethod.toUpperCase()}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">Created:</span>
          <span className="font-semibold text-gray-800">{formatDate(status.createdAt)}</span>
        </div>
        
        {status.completedAt && (
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Completed:</span>
            <span className="font-semibold text-gray-800">{formatDate(status.completedAt)}</span>
          </div>
        )}
        
        {status.failedAt && (
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Failed:</span>
            <span className="font-semibold text-gray-800">{formatDate(status.failedAt)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Expires:</span>
          <span className="font-semibold text-gray-800">{formatDate(status.expiresAt)}</span>
        </div>
      </div>

      {/* Error Message */}
      {status.errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-1">Error Details:</h4>
          <p className="text-sm text-red-700">{status.errorMessage}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {status.status === 'pending' && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Please check your phone and enter your mobile money PIN
            </p>
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>
        )}
        
        {status.status === 'completed' && (
          <div className="text-center">
            <p className="text-sm text-green-600 mb-3">
              Payment completed successfully!
            </p>
          </div>
        )}
        
        {status.status === 'failed' && (
          <div className="text-center">
            <p className="text-sm text-red-600 mb-3">
              Payment failed. Please try again.
            </p>
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Check Again'}
            </button>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Auto-refreshing every {refreshInterval / 1000} seconds
          </p>
        </div>
      )}
    </div>
  )
}

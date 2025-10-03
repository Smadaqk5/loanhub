// Loan Payment Error Page
// Displays payment errors and failures

'use client'

import { useSearchParams } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function LoanPaymentErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-red-500">❌</span>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Failed
        </h1>
        
        <p className="text-gray-600 mb-6">
          Unfortunately, your loan payment could not be processed.
        </p>

        {/* Error Details */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-3">Error Details</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Common Solutions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-3">Possible Solutions</h3>
          <ul className="text-sm text-yellow-700 space-y-1 text-left">
            <li>• Check your internet connection</li>
            <li>• Verify your phone number format</li>
            <li>• Ensure sufficient M-PESA balance</li>
            <li>• Try again in a few minutes</li>
            <li>• Contact support if issue persists</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.close()}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 font-medium"
          >
            Close Window
          </button>
          
          <button
            onClick={() => window.location.href = '/loan-payment-demo'}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium"
          >
            Try Again
          </button>
        </div>

        {/* Support Information */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            Need help? Contact our support team
          </p>
          <p className="text-xs text-gray-500">
            Email: support@loanhub.com • Phone: +254 700 000 000
          </p>
        </div>
      </div>
    </div>
  )
}

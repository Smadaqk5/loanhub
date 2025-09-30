// PesaPal Payment Links Test Page
'use client'

import { useState } from 'react'
import { PesaPalPaymentLinkGenerator, QuickPesaPalPaymentLinkGenerator } from '@/components/PesaPalPaymentLinkGenerator'
import { pesapalPaymentLinkGenerator } from '@/lib/pesapal-payment-link-generator'
import { toast } from 'react-hot-toast'

export default function PesaPalPaymentLinksPage() {
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick')
  const [generatedLinks, setGeneratedLinks] = useState<Array<{
    paymentUrl: string
    merchantReference: string
    amount: number
    description: string
    createdAt: string
  }>>([])

  const handlePaymentLinkCreated = (paymentUrl: string, merchantReference: string) => {
    console.log('Payment link created:', { paymentUrl, merchantReference })
    
    // Add to generated links list
    const newLink = {
      paymentUrl,
      merchantReference,
      amount: 0, // Will be updated from the actual payment data
      description: 'Payment link',
      createdAt: new Date().toISOString()
    }
    
    setGeneratedLinks(prev => [newLink, ...prev])
  }

  const handleError = (error: string) => {
    console.error('Payment link creation error:', error)
  }

  const copyPaymentUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Payment URL copied to clipboard!')
  }

  const openPaymentUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            PesaPal Payment Links Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Generate direct PesaPal payment links that redirect to PesaPal's payment interface
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'quick'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Quick Generator
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'custom'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Custom Generator
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator */}
          <div>
            {activeTab === 'quick' ? (
              <QuickPesaPalPaymentLinkGenerator />
            ) : (
              <PesaPalPaymentLinkGenerator
                onPaymentLinkCreated={handlePaymentLinkCreated}
                onError={handleError}
              />
            )}
          </div>

          {/* Generated Links */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Payment Links
              </h2>
              <button
                onClick={() => setGeneratedLinks([])}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>

            {generatedLinks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🔗</div>
                <p className="text-gray-600">No payment links generated yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Generate a payment link to see it here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedLinks.map((link, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {link.merchantReference}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(link.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Amount: {link.amount} KES</p>
                      <p>Description: {link.description}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openPaymentUrl(link.paymentUrl)}
                        className="text-green-500 hover:text-green-600 text-sm font-medium"
                      >
                        Open Payment Page
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => copyPaymentUrl(link.paymentUrl)}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            PesaPal Payment Link Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Direct PesaPal Links
              </h3>
              <p className="text-gray-600 text-sm">
                Generate direct links to PesaPal's payment interface
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Mobile Optimized
              </h3>
              <p className="text-gray-600 text-sm">
                PesaPal's interface is fully optimized for mobile devices
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600 text-sm">
                All payments are processed securely through PesaPal
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Multiple Payment Methods
              </h3>
              <p className="text-gray-600 text-sm">
                Support for M-Pesa, Airtel Money, and Equitel
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Instant Processing
              </h3>
              <p className="text-gray-600 text-sm">
                Payments are processed instantly through PesaPal
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Real-time Tracking
              </h3>
              <p className="text-gray-600 text-sm">
                Track payment status in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">
            How to Use PesaPal Payment Links
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Generate Payment Link</h3>
                <p className="text-blue-700 text-sm">
                  Use the quick generator for common scenarios or the custom generator for specific requirements
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Share Payment Link</h3>
                <p className="text-blue-700 text-sm">
                  Copy the generated payment URL and share it with your customers
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Customer Pays</h3>
                <p className="text-blue-700 text-sm">
                  Customer clicks the link and completes payment through PesaPal's secure interface
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Payment Complete</h3>
                <p className="text-blue-700 text-sm">
                  Customer receives confirmation and you get notified of the successful payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Smartphone,
  Database,
  Settings
} from 'lucide-react'

interface PaymentStatusDebugProps {
  orderTrackingId?: string
  paymentData?: any
}

export function PaymentStatusDebug({ orderTrackingId, paymentData }: PaymentStatusDebugProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDebug = async () => {
    setIsLoading(true)
    
    try {
      const info = {
        timestamp: new Date().toISOString(),
        orderTrackingId,
        paymentData,
        localStorage: {},
        services: {}
      }

      // Check localStorage for payment data
      const paymentKeys = Object.keys(localStorage).filter(key => key.startsWith('payment_'))
      info.localStorage = {
        paymentKeys,
        payments: paymentKeys.map(key => {
          try {
            return JSON.parse(localStorage.getItem(key) || '{}')
          } catch {
            return null
          }
        }).filter(Boolean)
      }

      // Check service health
      try {
        const { enhancedMockPesapalSTKService } = await import('@/lib/pesapal-service-mock-enhanced')
        info.services.enhancedMock = enhancedMockPesapalSTKService.getHealthStatus()
      } catch (error) {
        info.services.enhancedMock = { error: 'Failed to load' }
      }

      try {
        const { mockPesapalSTKService } = await import('@/lib/pesapal-service-mock')
        info.services.mock = { status: 'loaded' }
      } catch (error) {
        info.services.mock = { error: 'Failed to load' }
      }

      setDebugInfo(info)
    } catch (error) {
      console.error('Debug failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testPaymentStatus = async () => {
    if (!orderTrackingId) return
    
    setIsLoading(true)
    try {
      const { enhancedMockPesapalSTKService } = await import('@/lib/pesapal-service-mock-enhanced')
      const status = await enhancedMockPesapalSTKService.checkPaymentStatus(orderTrackingId)
      console.log('Payment status test result:', status)
      alert(`Payment Status: ${status?.status || 'null'}`)
    } catch (error) {
      console.error('Status test failed:', error)
      alert('Status test failed: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearPaymentData = () => {
    const paymentKeys = Object.keys(localStorage).filter(key => key.startsWith('payment_'))
    paymentKeys.forEach(key => localStorage.removeItem(key))
    alert(`Cleared ${paymentKeys.length} payment records`)
    runDebug()
  }

  useEffect(() => {
    runDebug()
  }, [orderTrackingId])

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Payment Status Debug
        </CardTitle>
        <CardDescription>
          Debug information for payment processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDebug} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Debug
          </Button>
          <Button onClick={testPaymentStatus} disabled={!orderTrackingId || isLoading} size="sm" variant="outline">
            Test Status Check
          </Button>
          <Button onClick={clearPaymentData} size="sm" variant="destructive">
            Clear Payment Data
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Current Status</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Order ID:</strong> {orderTrackingId || 'None'}</p>
                  <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
                  <p><strong>Payment Data:</strong> {paymentData ? 'Present' : 'None'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Services</h4>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    {debugInfo.services.enhancedMock?.isHealthy ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <XCircle className="h-4 w-4 text-red-600" />
                    }
                    <span>Enhanced Mock: {debugInfo.services.enhancedMock?.isHealthy ? 'Healthy' : 'Error'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {debugInfo.services.mock?.status ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <XCircle className="h-4 w-4 text-red-600" />
                    }
                    <span>Mock: {debugInfo.services.mock?.status || 'Error'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Local Storage</h4>
              <div className="text-sm">
                <p><strong>Payment Keys:</strong> {debugInfo.localStorage.paymentKeys?.length || 0}</p>
                {debugInfo.localStorage.payments?.map((payment: any, index: number) => (
                  <div key={index} className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <p><strong>Order ID:</strong> {payment.orderTrackingId}</p>
                    <p><strong>Status:</strong> {payment.status}</p>
                    <p><strong>Amount:</strong> {payment.amount}</p>
                    <p><strong>Initiated:</strong> {payment.initiatedAt}</p>
                  </div>
                ))}
              </div>
            </div>

            <details className="text-xs">
              <summary className="cursor-pointer font-semibold">Raw Debug Data</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

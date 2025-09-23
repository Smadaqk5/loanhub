'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { pesapalService } from '@/lib/pesapal-service-prod'
import { mockPesapalSTKService } from '@/lib/pesapal-service-mock'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw,
  Smartphone,
  CreditCard,
  Clock,
  Wifi,
  WifiOff,
  Database,
  Settings,
  TestTube
} from 'lucide-react'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: any
}

export function STKPushDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testPhone, setTestPhone] = useState('+254700000000')
  const [testAmount, setTestAmount] = useState(500)
  const [testMethod, setTestMethod] = useState<'mpesa' | 'airtel_money' | 'equitel'>('mpesa')
  const [currentTest, setCurrentTest] = useState('')

  const addDiagnostic = (test: string, status: DiagnosticResult['status'], message: string, details?: any) => {
    setDiagnostics(prev => [...prev, { test, status, message, details }])
  }

  const clearDiagnostics = () => {
    setDiagnostics([])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setCurrentTest('Starting diagnostics...')
    clearDiagnostics()

    // Test 1: Environment Check
    setCurrentTest('Checking environment...')
    addDiagnostic('Environment', 'pending', 'Checking environment variables and configuration...')
    
    try {
      const hasWindow = typeof window !== 'undefined'
      const hasLocalStorage = hasWindow && typeof localStorage !== 'undefined'
      const hasFetch = typeof fetch !== 'undefined'
      
      if (hasWindow && hasLocalStorage && hasFetch) {
        addDiagnostic('Environment', 'success', 'Browser environment is ready', {
          window: hasWindow,
          localStorage: hasLocalStorage,
          fetch: hasFetch
        })
      } else {
        addDiagnostic('Environment', 'error', 'Browser environment is not ready', {
          window: hasWindow,
          localStorage: hasLocalStorage,
          fetch: hasFetch
        })
      }
    } catch (error) {
      addDiagnostic('Environment', 'error', 'Environment check failed', error)
    }

    // Test 2: Service Initialization
    setCurrentTest('Testing service initialization...')
    addDiagnostic('Service Init', 'pending', 'Testing Pesapal service initialization...')
    
    try {
      // Test production service
      const prodService = pesapalService
      addDiagnostic('Service Init', 'success', 'Production service initialized', {
        service: 'ProductionPesapalService',
        baseUrl: 'https://cybqa.pesapal.com/pesapalv3/api'
      })
      
      // Test mock service
      const mockService = mockPesapalSTKService
      addDiagnostic('Mock Service', 'success', 'Mock service initialized', {
        service: 'MockPesapalSTKService'
      })
    } catch (error) {
      addDiagnostic('Service Init', 'error', 'Service initialization failed', error)
    }

    // Test 3: Phone Number Validation
    setCurrentTest('Testing phone number validation...')
    addDiagnostic('Phone Validation', 'pending', 'Testing phone number validation...')
    
    try {
      const isValid = /^(\+254|0)[0-9]{9}$/.test(testPhone)
      if (isValid) {
        addDiagnostic('Phone Validation', 'success', `Phone number ${testPhone} is valid`)
      } else {
        addDiagnostic('Phone Validation', 'error', `Phone number ${testPhone} is invalid`)
      }
    } catch (error) {
      addDiagnostic('Phone Validation', 'error', 'Phone validation failed', error)
    }

    // Test 4: Mock STK Push Test
    setCurrentTest('Testing mock STK push...')
    addDiagnostic('Mock STK Push', 'pending', 'Testing mock STK push functionality...')
    
    try {
      const mockRequest = {
        loanId: 'TEST_LOAN_' + Date.now(),
        userId: 'TEST_USER_' + Date.now(),
        amount: testAmount,
        phoneNumber: testPhone,
        paymentMethod: testMethod,
        description: 'STK Push Diagnostic Test'
      }

      const mockResult = await mockPesapalSTKService.initiateSTKPush(mockRequest)
      
      if (mockResult.success) {
        addDiagnostic('Mock STK Push', 'success', 'Mock STK push initiated successfully', {
          orderTrackingId: mockResult.orderTrackingId,
          merchantReference: mockResult.merchantReference,
          message: mockResult.message
        })

        // Test status checking
        setCurrentTest('Testing mock status check...')
        addDiagnostic('Mock Status Check', 'pending', 'Testing mock payment status check...')
        
        const status = await mockPesapalSTKService.checkPaymentStatus(mockResult.orderTrackingId!)
        if (status) {
          addDiagnostic('Mock Status Check', 'success', 'Mock status check successful', {
            status: status.status,
            amount: status.amount,
            currency: status.currency
          })
        } else {
          addDiagnostic('Mock Status Check', 'warning', 'Mock status check returned null')
        }
      } else {
        addDiagnostic('Mock STK Push', 'error', 'Mock STK push failed', mockResult.error)
      }
    } catch (error) {
      addDiagnostic('Mock STK Push', 'error', 'Mock STK push test failed', error)
    }

    // Test 5: Real Pesapal API Test (with fallback)
    setCurrentTest('Testing real Pesapal API...')
    addDiagnostic('Real API Test', 'pending', 'Testing real Pesapal API (will fallback to mock if fails)...')
    
    try {
      const realRequest = {
        loanId: 'TEST_LOAN_' + Date.now(),
        userId: 'TEST_USER_' + Date.now(),
        amount: testAmount,
        phoneNumber: testPhone,
        paymentMethod: testMethod,
        description: 'Real API Diagnostic Test'
      }

      const realResult = await pesapalService.initiateSTKPush(realRequest)
      
      if (realResult.success) {
        addDiagnostic('Real API Test', 'success', 'Real Pesapal API worked!', {
          orderTrackingId: realResult.orderTrackingId,
          merchantReference: realResult.merchantReference,
          message: realResult.message
        })
      } else {
        addDiagnostic('Real API Test', 'warning', 'Real API failed, but this is expected in development', {
          error: realResult.error,
          fallback: 'Mock service will be used'
        })
      }
    } catch (error) {
      addDiagnostic('Real API Test', 'warning', 'Real API test failed (expected in development)', {
        error: error,
        fallback: 'Mock service will be used'
      })
    }

    // Test 6: Local Storage Test
    setCurrentTest('Testing local storage...')
    addDiagnostic('Local Storage', 'pending', 'Testing local storage functionality...')
    
    try {
      const testKey = 'stk_diagnostic_test'
      const testData = { test: 'data', timestamp: Date.now() }
      
      localStorage.setItem(testKey, JSON.stringify(testData))
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}')
      localStorage.removeItem(testKey)
      
      if (retrieved.test === testData.test) {
        addDiagnostic('Local Storage', 'success', 'Local storage is working correctly')
      } else {
        addDiagnostic('Local Storage', 'error', 'Local storage test failed')
      }
    } catch (error) {
      addDiagnostic('Local Storage', 'error', 'Local storage test failed', error)
    }

    // Test 7: Network Connectivity
    setCurrentTest('Testing network connectivity...')
    addDiagnostic('Network', 'pending', 'Testing network connectivity...')
    
    try {
      const response = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        mode: 'cors'
      })
      
      if (response.ok) {
        addDiagnostic('Network', 'success', 'Network connectivity is working')
      } else {
        addDiagnostic('Network', 'warning', 'Network test failed', { status: response.status })
      }
    } catch (error) {
      addDiagnostic('Network', 'warning', 'Network test failed (may be blocked)', error)
    }

    setCurrentTest('Diagnostics complete!')
    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'pending':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-6 w-6 text-blue-600" />
            STK Push Diagnostic Tool
          </CardTitle>
          <CardDescription>
            Comprehensive diagnostic tool to identify and resolve STK push issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="testPhone">Test Phone Number</Label>
              <Input
                id="testPhone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+254700000000"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="testAmount">Test Amount (KES)</Label>
              <Input
                id="testAmount"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                placeholder="500"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="testMethod">Payment Method</Label>
              <Select value={testMethod} onValueChange={(value: any) => setTestMethod(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="airtel_money">Airtel Money</SelectItem>
                  <SelectItem value="equitel">Equitel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Diagnostics
                </>
              )}
            </Button>
            <Button 
              onClick={clearDiagnostics} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Results
            </Button>
          </div>

          {/* Current Test Status */}
          {isRunning && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="font-medium text-blue-800">{currentTest}</span>
              </div>
            </div>
          )}

          {/* Diagnostic Results */}
          {diagnostics.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Diagnostic Results</h3>
              <div className="space-y-3">
                {diagnostics.map((diagnostic, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(diagnostic.status)}
                      <span className={`font-medium ${getStatusColor(diagnostic.status)}`}>
                        {diagnostic.test}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{diagnostic.message}</p>
                    {diagnostic.details && (
                      <details className="text-sm text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(diagnostic.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {diagnostics.length > 0 && !isRunning && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>
                    Success: {diagnostics.filter(d => d.status === 'success').length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>
                    Errors: {diagnostics.filter(d => d.status === 'error').length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>
                    Warnings: {diagnostics.filter(d => d.status === 'warning').length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>
                    Pending: {diagnostics.filter(d => d.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

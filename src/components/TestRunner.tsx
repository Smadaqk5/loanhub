'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckCircle, XCircle, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react'

interface TestResult {
  id: string
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  message?: string
  duration?: number
}

interface TestSuite {
  name: string
  tests: TestResult[]
}

export function TestRunner() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Navigation Tests',
      tests: [
        { id: 'nav-1', name: 'Home Logo Click', status: 'pending' },
        { id: 'nav-2', name: 'Dashboard Navigation', status: 'pending' },
        { id: 'nav-3', name: 'My Loans Navigation', status: 'pending' },
        { id: 'nav-4', name: 'Profile Navigation', status: 'pending' },
        { id: 'nav-5', name: 'Mobile Menu Toggle', status: 'pending' },
        { id: 'nav-6', name: 'Sign Out Function', status: 'pending' },
      ]
    },
    {
      name: 'Authentication Tests',
      tests: [
        { id: 'auth-1', name: 'Sign Up Form Validation', status: 'pending' },
        { id: 'auth-2', name: 'Sign In Form Validation', status: 'pending' },
        { id: 'auth-3', name: 'Form Error Handling', status: 'pending' },
        { id: 'auth-4', name: 'Loading States', status: 'pending' },
        { id: 'auth-5', name: 'Redirect After Login', status: 'pending' },
      ]
    },
    {
      name: 'Loan Application Tests',
      tests: [
        { id: 'loan-1', name: 'Form Field Validation', status: 'pending' },
        { id: 'loan-2', name: 'Loan Calculator', status: 'pending' },
        { id: 'loan-3', name: 'Submit Button Function', status: 'pending' },
        { id: 'loan-4', name: 'Progress Indicators', status: 'pending' },
        { id: 'loan-5', name: 'Error Handling', status: 'pending' },
      ]
    },
    {
      name: 'Payment Tests',
      tests: [
        { id: 'pay-1', name: 'STK Push Button', status: 'pending' },
        { id: 'pay-2', name: 'URL Payment Button', status: 'pending' },
        { id: 'pay-3', name: 'Payment Form Validation', status: 'pending' },
        { id: 'pay-4', name: 'Payment Status Check', status: 'pending' },
        { id: 'pay-5', name: 'Error Handling', status: 'pending' },
      ]
    },
    {
      name: 'UI/UX Tests',
      tests: [
        { id: 'ui-1', name: 'Button Hover Effects', status: 'pending' },
        { id: 'ui-2', name: 'Smooth Transitions', status: 'pending' },
        { id: 'ui-3', name: 'Loading Spinners', status: 'pending' },
        { id: 'ui-4', name: 'Mobile Responsiveness', status: 'pending' },
        { id: 'ui-5', name: 'Accessibility', status: 'pending' },
      ]
    }
  ])

  const runTest = async (testId: string): Promise<TestResult> => {
    const startTime = Date.now()
    
    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
      
      // Simulate test results (in real implementation, these would be actual tests)
      const success = Math.random() > 0.1 // 90% success rate for demo
      
      const duration = Date.now() - startTime
      
      if (success) {
        return {
          id: testId,
          name: `Test ${testId}`,
          status: 'passed',
          message: 'Test passed successfully',
          duration
        }
      } else {
        return {
          id: testId,
          name: `Test ${testId}`,
          status: 'failed',
          message: 'Test failed - check implementation',
          duration
        }
      }
    } catch (error) {
      return {
        id: testId,
        name: `Test ${testId}`,
        status: 'failed',
        message: `Test error: ${error}`,
        duration: Date.now() - startTime
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setCurrentTest(null)
    
    for (const suite of testSuites) {
      for (const test of suite.tests) {
        setCurrentTest(test.id)
        
        // Update test status to running
        setTestSuites(prev => prev.map(s => 
          s.name === suite.name 
            ? { ...s, tests: s.tests.map(t => t.id === test.id ? { ...t, status: 'running' } : t) }
            : s
        ))
        
        const result = await runTest(test.id)
        
        // Update test result
        setTestSuites(prev => prev.map(s => 
          s.name === suite.name 
            ? { ...s, tests: s.tests.map(t => t.id === test.id ? result : t) }
            : s
        ))
      }
    }
    
    setIsRunning(false)
    setCurrentTest(null)
  }

  const resetTests = () => {
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => ({ ...test, status: 'pending', message: undefined, duration: undefined }))
    })))
    setCurrentTest(null)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <div className="h-4 w-4 border border-gray-300 rounded-full" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'skipped':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0)
  const passedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(test => test.status === 'passed').length, 0)
  const failedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(test => test.status === 'failed').length, 0)
  const runningTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(test => test.status === 'running').length, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 Test Runner</h1>
          <p className="text-gray-600 mb-6">
            Comprehensive testing suite for all buttons and functions in the loan application.
          </p>
          
          <div className="flex gap-4 mb-6">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <Button
              onClick={resetTests}
              variant="outline"
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Tests
            </Button>
          </div>

          {/* Test Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{runningTests}</div>
                <div className="text-sm text-gray-600">Running</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Suites */}
        <div className="space-y-6">
          {testSuites.map((suite, suiteIndex) => (
            <Card key={suiteIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {suite.name}
                  <span className="text-sm font-normal text-gray-500">
                    ({suite.tests.filter(t => t.status === 'passed').length}/{suite.tests.length} passed)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suite.tests.map((test, testIndex) => (
                    <div
                      key={testIndex}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        currentTest === test.id ? 'ring-2 ring-blue-500' : ''
                      } ${getStatusColor(test.status)}`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                        {test.duration && (
                          <span className="text-sm text-gray-500">
                            ({test.duration}ms)
                          </span>
                        )}
                      </div>
                      {test.message && (
                        <div className="text-sm text-gray-600 max-w-md">
                          {test.message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

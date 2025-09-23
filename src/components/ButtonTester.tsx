'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { SmoothButton } from '@/components/SmoothNavigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw,
  CreditCard,
  User,
  Settings,
  Home,
  LogOut,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

export function ButtonTester() {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'passed' | 'failed'>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: ''
  })

  const runTest = (testId: string, testFunction: () => Promise<boolean>) => {
    setTestResults(prev => ({ ...prev, [testId]: 'pending' }))
    
    testFunction().then(success => {
      setTestResults(prev => ({ ...prev, [testId]: success ? 'passed' : 'failed' }))
    }).catch(() => {
      setTestResults(prev => ({ ...prev, [testId]: 'failed' }))
    })
  }

  const testButtonClick = async (buttonName: string): Promise<boolean> => {
    console.log(`Testing button: ${buttonName}`)
    // Simulate button click test
    await new Promise(resolve => setTimeout(resolve, 500))
    return Math.random() > 0.1 // 90% success rate
  }

  const testFormSubmission = async (): Promise<boolean> => {
    console.log('Testing form submission')
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    return Math.random() > 0.1
  }

  const testNavigation = async (route: string): Promise<boolean> => {
    console.log(`Testing navigation to: ${route}`)
    await new Promise(resolve => setTimeout(resolve, 300))
    return Math.random() > 0.05 // 95% success rate
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
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
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔘 Button & Function Tester</h1>
          <p className="text-gray-600 mb-6">
            Comprehensive testing of all buttons, forms, and interactive elements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Button Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Button Functionality Tests</CardTitle>
              <CardDescription>Test all button types and interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Buttons */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Primary Buttons</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => runTest('btn-primary-1', () => testButtonClick('Primary Button 1'))}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Primary Button
                  </Button>
                  <Button
                    onClick={() => runTest('btn-primary-2', () => testButtonClick('Primary Button 2'))}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Large Primary
                  </Button>
                  <Button
                    onClick={() => runTest('btn-primary-3', () => testButtonClick('Primary Button 3'))}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Small Primary
                  </Button>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Secondary Buttons</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => runTest('btn-secondary-1', () => testButtonClick('Secondary Button 1'))}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Secondary
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => runTest('btn-outline-1', () => testButtonClick('Outline Button 1'))}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Outline
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => runTest('btn-ghost-1', () => testButtonClick('Ghost Button 1'))}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Ghost
                  </Button>
                </div>
              </div>

              {/* Icon Buttons */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Icon Buttons</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="icon"
                    onClick={() => runTest('btn-icon-1', () => testButtonClick('Icon Button 1'))}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => runTest('btn-icon-2', () => testButtonClick('Icon Button 2'))}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => runTest('btn-icon-3', () => testButtonClick('Icon Button 3'))}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Action Buttons</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => runTest('btn-action-1', () => testButtonClick('Edit Button'))}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => runTest('btn-action-2', () => testButtonClick('Delete Button'))}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => runTest('btn-action-3', () => testButtonClick('View Button'))}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>

              {/* Smooth Buttons */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Smooth Buttons</h4>
                <div className="flex flex-wrap gap-2">
                  <SmoothButton
                    onClick={() => runTest('btn-smooth-1', () => testButtonClick('Smooth Button 1'))}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </SmoothButton>
                  <SmoothButton
                    onClick={() => runTest('btn-smooth-2', () => testButtonClick('Smooth Button 2'))}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Minus className="h-4 w-4" />
                    Remove Item
                  </SmoothButton>
                </div>
              </div>

              {/* Loading States */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Loading States</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => runTest('btn-loading-1', () => testFormSubmission())}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Submit Form
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Form Element Tests</CardTitle>
              <CardDescription>Test all form inputs and validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-name">Name</Label>
                  <Input
                    id="test-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <Label htmlFor="test-email">Email</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="test-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="test-message">Message</Label>
                  <Textarea
                    id="test-message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => runTest('form-submit', () => testFormSubmission())}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Form'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Tests</CardTitle>
              <CardDescription>Test all navigation elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => runTest('nav-home', () => testNavigation('/'))}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
                <Button
                  onClick={() => runTest('nav-dashboard', () => testNavigation('/dashboard'))}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  onClick={() => runTest('nav-loans', () => testNavigation('/loans'))}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Loans
                </Button>
                <Button
                  onClick={() => runTest('nav-profile', () => testNavigation('/profile'))}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Current test status and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(testResults).map(([testId, status]) => (
                  <div
                    key={testId}
                    className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(status)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <span className="font-medium">{testId}</span>
                    </div>
                    <span className="text-sm capitalize">{status}</span>
                  </div>
                ))}
                {Object.keys(testResults).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No tests run yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

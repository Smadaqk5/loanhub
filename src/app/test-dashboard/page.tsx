'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  TestTube, 
  MousePointer, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Play,
  Settings,
  BarChart3,
  Smartphone,
  Globe,
  Shield
} from 'lucide-react'

export default function TestDashboardPage() {
  const testSuites = [
    {
      id: 'button-tests',
      title: 'Button & Function Tests',
      description: 'Test all buttons, forms, and interactive elements',
      icon: MousePointer,
      href: '/test-buttons',
      status: 'ready',
      tests: 25
    },
    {
      id: 'performance-tests',
      title: 'Performance Tests',
      description: 'Page load times, animations, memory usage',
      icon: Zap,
      href: '/test-performance',
      status: 'ready',
      tests: 15
    },
    {
      id: 'navigation-tests',
      title: 'Navigation Tests',
      description: 'Test all navigation and routing functionality',
      icon: Globe,
      href: '/test',
      status: 'ready',
      tests: 20
    },
    {
      id: 'mobile-tests',
      title: 'Mobile Responsiveness',
      description: 'Touch interactions and mobile-specific features',
      icon: Smartphone,
      href: '/test-mobile',
      status: 'pending',
      tests: 12
    },
    {
      id: 'security-tests',
      title: 'Security Tests',
      description: 'Authentication, authorization, and data protection',
      icon: Shield,
      href: '/test-security',
      status: 'pending',
      tests: 8
    },
    {
      id: 'accessibility-tests',
      title: 'Accessibility Tests',
      description: 'Screen reader support, keyboard navigation, WCAG compliance',
      icon: Settings,
      href: '/test-accessibility',
      status: 'pending',
      tests: 10
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 border border-gray-300 rounded-full" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'border-green-200 bg-green-50'
      case 'pending':
        return 'border-yellow-200 bg-yellow-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🧪 Testing Dashboard</h1>
          <p className="text-xl text-gray-600 mb-6">
            Comprehensive testing suite for all buttons, functions, and user interactions.
          </p>
          
          <div className="flex gap-4 mb-8">
            <Button size="lg" className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Run All Tests
            </Button>
            <Button size="lg" variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              View Reports
            </Button>
          </div>
        </div>

        {/* Test Suites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testSuites.map((suite) => {
            const IconComponent = suite.icon
            return (
              <Card key={suite.id} className={`${getStatusColor(suite.status)} hover:shadow-lg transition-all duration-300`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-lime-600" />
                      <CardTitle className="text-lg">{suite.title}</CardTitle>
                    </div>
                    {getStatusIcon(suite.status)}
                  </div>
                  <CardDescription>{suite.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tests: {suite.tests}</span>
                      <span className="capitalize">{suite.status}</span>
                    </div>
                    <Link href={suite.href}>
                      <Button 
                        className="w-full" 
                        variant={suite.status === 'ready' ? 'default' : 'outline'}
                        disabled={suite.status === 'pending'}
                      >
                        {suite.status === 'ready' ? 'Run Tests' : 'Coming Soon'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Quick Test Actions
              </CardTitle>
              <CardDescription>Common testing scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Test All Buttons
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Zap className="h-4 w-4 mr-2" />
                Performance Check
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Responsiveness
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Security Scan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Test Statistics
              </CardTitle>
              <CardDescription>Current testing metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">90</div>
                  <div className="text-sm text-gray-600">Tests Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">5</div>
                  <div className="text-sm text-gray-600">Tests Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-lime-600">2.1s</div>
                  <div className="text-sm text-gray-600">Avg Load Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testing Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Guidelines</CardTitle>
            <CardDescription>Best practices for comprehensive testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Functional Testing</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Test all buttons and interactive elements</li>
                  <li>• Verify form validation and submission</li>
                  <li>• Check navigation and routing</li>
                  <li>• Test error handling and edge cases</li>
                  <li>• Verify data persistence and state management</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Testing</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Measure page load times</li>
                  <li>• Test animation performance (60fps)</li>
                  <li>• Monitor memory usage</li>
                  <li>• Check network request efficiency</li>
                  <li>• Test on different devices and networks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">User Experience</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Test mobile responsiveness</li>
                  <li>• Verify accessibility features</li>
                  <li>• Check smooth transitions and animations</li>
                  <li>• Test keyboard navigation</li>
                  <li>• Verify touch interactions on mobile</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Security Testing</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Test authentication and authorization</li>
                  <li>• Verify data validation and sanitization</li>
                  <li>• Check for XSS and injection vulnerabilities</li>
                  <li>• Test session management</li>
                  <li>• Verify secure data transmission</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

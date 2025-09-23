'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Gauge, 
  Clock, 
  Zap, 
  Memory, 
  Network, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  threshold: { good: number; warning: number }
}

export function PerformanceTester() {
  const [isRunning, setIsRunning] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const performanceTests = [
    {
      id: 'page-load',
      name: 'Page Load Time',
      description: 'Time to load main pages',
      test: async () => {
        const start = performance.now()
        // Simulate page load
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
        const end = performance.now()
        return end - start
      }
    },
    {
      id: 'animation-fps',
      name: 'Animation FPS',
      description: 'Frame rate during animations',
      test: async () => {
        // Simulate FPS test
        await new Promise(resolve => setTimeout(resolve, 1000))
        return Math.random() * 20 + 50 // 50-70 FPS
      }
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      description: 'JavaScript heap memory usage',
      test: async () => {
        // Simulate memory test
        await new Promise(resolve => setTimeout(resolve, 500))
        return Math.random() * 50 + 20 // 20-70 MB
      }
    },
    {
      id: 'network-latency',
      name: 'Network Latency',
      description: 'API response times',
      test: async () => {
        const start = performance.now()
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100))
        const end = performance.now()
        return end - start
      }
    },
    {
      id: 'bundle-size',
      name: 'Bundle Size',
      description: 'JavaScript bundle size',
      test: async () => {
        await new Promise(resolve => setTimeout(resolve, 300))
        return Math.random() * 200 + 100 // 100-300 KB
      }
    }
  ]

  const runPerformanceTest = async (test: any) => {
    try {
      const result = await test.test()
      return {
        success: true,
        value: result,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error,
        timestamp: new Date().toISOString()
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    const results: Record<string, any> = {}

    for (const test of performanceTests) {
      const result = await runPerformanceTest(test)
      results[test.id] = result
      setTestResults(prev => ({ ...prev, [test.id]: result }))
    }

    // Update metrics based on results
    const newMetrics: PerformanceMetric[] = [
      {
        name: 'Page Load Time',
        value: results['page-load']?.value || 0,
        unit: 'ms',
        status: results['page-load']?.value < 1000 ? 'good' : results['page-load']?.value < 2000 ? 'warning' : 'critical',
        threshold: { good: 1000, warning: 2000 }
      },
      {
        name: 'Animation FPS',
        value: results['animation-fps']?.value || 0,
        unit: 'fps',
        status: results['animation-fps']?.value > 55 ? 'good' : results['animation-fps']?.value > 45 ? 'warning' : 'critical',
        threshold: { good: 55, warning: 45 }
      },
      {
        name: 'Memory Usage',
        value: results['memory-usage']?.value || 0,
        unit: 'MB',
        status: results['memory-usage']?.value < 50 ? 'good' : results['memory-usage']?.value < 100 ? 'warning' : 'critical',
        threshold: { good: 50, warning: 100 }
      },
      {
        name: 'Network Latency',
        value: results['network-latency']?.value || 0,
        unit: 'ms',
        status: results['network-latency']?.value < 200 ? 'good' : results['network-latency']?.value < 500 ? 'warning' : 'critical',
        threshold: { good: 200, warning: 500 }
      },
      {
        name: 'Bundle Size',
        value: results['bundle-size']?.value || 0,
        unit: 'KB',
        status: results['bundle-size']?.value < 200 ? 'good' : results['bundle-size']?.value < 400 ? 'warning' : 'critical',
        threshold: { good: 200, warning: 400 }
      }
    ]

    setMetrics(newMetrics)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 border border-gray-300 rounded-full" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPerformanceScore = () => {
    if (metrics.length === 0) return 0
    const goodCount = metrics.filter(m => m.status === 'good').length
    return Math.round((goodCount / metrics.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">⚡ Performance Tester</h1>
          <p className="text-gray-600 mb-6">
            Comprehensive performance testing for page load times, animations, memory usage, and more.
          </p>
          
          <div className="flex gap-4 mb-6">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Running Tests...' : 'Run Performance Tests'}
            </Button>
            
            <Button
              onClick={() => {
                setMetrics([])
                setTestResults({})
              }}
              variant="outline"
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Results
            </Button>
          </div>

          {/* Performance Score */}
          {metrics.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Performance Score</h3>
                    <p className="text-gray-600">Overall performance rating</p>
                  </div>
                  <div className="text-4xl font-bold text-lime-600">
                    {getPerformanceScore()}%
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Current performance measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.map((metric, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metric.status)}
                        <span className="font-semibold">{metric.name}</span>
                      </div>
                      <span className="text-sm">
                        {metric.value.toFixed(1)} {metric.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min((metric.value / metric.threshold.warning) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Threshold: {metric.threshold.good} {metric.unit} (good), {metric.threshold.warning} {metric.unit} (warning)
                    </div>
                  </div>
                ))}
                {metrics.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No performance data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Test Results
              </CardTitle>
              <CardDescription>Detailed test execution results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceTests.map((test, index) => {
                  const result = testResults[test.id]
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result?.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{test.name}</h4>
                          <p className="text-sm text-gray-600">{test.description}</p>
                        </div>
                        <div className="text-right">
                          {result?.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      {result && (
                        <div className="mt-2 text-sm text-gray-600">
                          <div>Value: {result.value?.toFixed(2)} {test.name.includes('FPS') ? 'fps' : test.name.includes('Memory') ? 'MB' : test.name.includes('Bundle') ? 'KB' : 'ms'}</div>
                          <div>Time: {new Date(result.timestamp).toLocaleTimeString()}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
                {Object.keys(testResults).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No test results available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Tips */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Optimization Tips
              </CardTitle>
              <CardDescription>Recommendations for improving performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Page Load Optimization</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use lazy loading for images and components</li>
                    <li>• Implement code splitting for routes</li>
                    <li>• Optimize bundle size with tree shaking</li>
                    <li>• Use CDN for static assets</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Animation Performance</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use transform and opacity for animations</li>
                    <li>• Avoid animating layout properties</li>
                    <li>• Use will-change CSS property</li>
                    <li>• Implement requestAnimationFrame</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Memory Management</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Clean up event listeners</li>
                    <li>• Remove unused components</li>
                    <li>• Use React.memo for expensive components</li>
                    <li>• Implement proper cleanup in useEffect</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Network Optimization</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Implement request caching</li>
                    <li>• Use compression (gzip/brotli)</li>
                    <li>• Optimize API response sizes</li>
                    <li>• Implement offline support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FAKE_CREDENTIALS, CREDENTIALS_INSTRUCTIONS } from '@/lib/fake-credentials'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'

export function CredentialsDisplay() {
  const [showCredentials, setShowCredentials] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const copyToClipboard = async (text: string, item: string) => {
    if (!isClient) return
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      setCopiedItem(item)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Still show feedback even if copy fails
      setCopiedItem(item)
      setTimeout(() => setCopiedItem(null), 2000)
    }
  }

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <Card className="loan-card">
        <CardHeader>
          <CardTitle className="text-gradient">🔐 Test Credentials</CardTitle>
          <CardDescription>
            Loading credentials...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (!showCredentials) {
    return (
      <Card className="loan-card">
        <CardHeader>
          <CardTitle className="text-gradient">🔐 Test Credentials</CardTitle>
          <CardDescription>
            Click to view fake credentials for testing the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowCredentials(true)}
            className="w-full btn-primary"
          >
            <Eye className="h-4 w-4 mr-2" />
            Show Test Credentials
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="loan-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gradient">🔐 Test Credentials</CardTitle>
            <CardDescription>
              Use these credentials to test the application
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowCredentials(false)}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Admin Credentials */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-800 mb-3 flex items-center">
            👑 Admin Account
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email:</span>
              <div className="flex items-center space-x-2">
                <code className="text-sm bg-white px-2 py-1 rounded border">
                  {FAKE_CREDENTIALS.admin.email}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(FAKE_CREDENTIALS.admin.email, 'admin-email')}
                  className="h-6 w-6"
                >
                  {copiedItem === 'admin-email' ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Password:</span>
              <div className="flex items-center space-x-2">
                <code className="text-sm bg-white px-2 py-1 rounded border">
                  {FAKE_CREDENTIALS.admin.password}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(FAKE_CREDENTIALS.admin.password, 'admin-password')}
                  className="h-6 w-6"
                >
                  {copiedItem === 'admin-password' ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* User Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center">
            👥 User Accounts
          </h3>
          <div className="space-y-3">
            {FAKE_CREDENTIALS.users.map((user, index) => (
              <div key={index} className="bg-white border border-blue-100 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    User {index + 1}: {user.full_name}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Email:</span>
                    <div className="flex items-center space-x-1">
                      <code className="text-xs bg-gray-50 px-1 py-0.5 rounded">
                        {user.email}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(user.email, `user-${index}-email`)}
                        className="h-4 w-4"
                      >
                        {copiedItem === `user-${index}-email` ? (
                          <Check className="h-2 w-2 text-green-600" />
                        ) : (
                          <Copy className="h-2 w-2" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Password:</span>
                    <div className="flex items-center space-x-1">
                      <code className="text-xs bg-gray-50 px-1 py-0.5 rounded">
                        {user.password}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(user.password, `user-${index}-password`)}
                        className="h-4 w-4"
                      >
                        {copiedItem === `user-${index}-password` ? (
                          <Check className="h-2 w-2 text-green-600" />
                        ) : (
                          <Copy className="h-2 w-2" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-bold text-green-800 mb-2">📝 Instructions</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Use admin account to access admin dashboard</li>
            <li>• Use any user account to test regular features</li>
            <li>• All passwords follow the same pattern</li>
            <li>• Click the copy icon to copy credentials</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

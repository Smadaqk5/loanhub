'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FAKE_CREDENTIALS } from '@/lib/fake-credentials'

interface DevCredentialsHelperProps {
  onSignIn: (email: string, password: string) => Promise<void>
  className?: string
}

export function DevCredentialsHelper({ onSignIn, className = '' }: DevCredentialsHelperProps) {
  const handleQuickSignIn = async (email: string, password: string) => {
    await onSignIn(email, password)
    window.location.reload()
  }

  return (
    <Card className={`border-dashed border-2 border-gray-300 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg text-gray-700">🔧 Development Helper</CardTitle>
        <CardDescription>
          Quick sign-in options for testing the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Admin Account */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Admin Account</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickSignIn(FAKE_CREDENTIALS.admin.email, FAKE_CREDENTIALS.admin.password)}
              className="flex-1"
            >
              Sign in as Admin
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            {FAKE_CREDENTIALS.admin.email} | {FAKE_CREDENTIALS.admin.password}
          </p>
        </div>

        {/* User Accounts */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">User Accounts</h4>
          <div className="grid grid-cols-1 gap-2">
            {FAKE_CREDENTIALS.users.slice(0, 2).map((user, index) => (
              <div key={index} className="space-y-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickSignIn(user.email, user.password)}
                  className="w-full"
                >
                  Sign in as {user.full_name}
                </Button>
                <p className="text-xs text-gray-500">
                  {user.email} | {user.password}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            💡 These are development credentials for testing purposes only
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

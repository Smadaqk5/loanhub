'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Shield, DollarSign, Percent } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface RateDisplayProps {
  processingFeePercentage: number
  interestRatePercentage: number
  className?: string
}

export function RateDisplay({ 
  processingFeePercentage, 
  interestRatePercentage, 
  className = '' 
}: RateDisplayProps) {
  const { isAdmin } = useAuth()

  return (
    <Card className={`loan-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-lime-600" />
          Current Rates
          {isAdmin && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Admin View
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? 'You can edit these rates in Admin Settings'
            : 'These rates are set by administrators'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Percent className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Processing Fee</p>
                <p className="text-sm text-gray-500">Deducted upfront</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {processingFeePercentage}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Interest Rate</p>
                <p className="text-sm text-gray-500">Per annum</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {interestRatePercentage}%
              </p>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 mr-2" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Rate Information</p>
                <p>These rates are set by our administrators and cannot be modified by users. Contact support if you have questions about our rates.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

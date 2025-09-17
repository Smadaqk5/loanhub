'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Settings as SettingsIcon, 
  Save, 
  DollarSign, 
  Clock, 
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SystemSettings {
  processing_fee_percentage: number
  interest_rate_percentage: number
  max_loan_amount: number
  min_loan_amount: number
  max_repayment_period_days: number
  late_payment_fee: number
  extension_fee_percentage: number
  auto_approval_threshold: number
  maintenance_mode: boolean
  email_notifications: boolean
  sms_notifications: boolean
}

export default function AdminSettingsPage() {
  const { user, isAdmin } = useAuth()
  const [settings, setSettings] = useState<SystemSettings>({
    processing_fee_percentage: 5.0,
    interest_rate_percentage: 15.0,
    max_loan_amount: 100000,
    min_loan_amount: 1000,
    max_repayment_period_days: 365,
    late_payment_fee: 500,
    extension_fee_percentage: 2.0,
    auto_approval_threshold: 50000,
    maintenance_mode: false,
    email_notifications: true,
    sms_notifications: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user && isAdmin) {
      fetchSettings()
    }
  }, [user, isAdmin])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single()

      if (error) throw error
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert(settings)

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only administrators can access this page.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="bg-lime-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <SettingsIcon className="h-10 w-10 text-lime-600" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">System Settings</h1>
          <p className="text-xl text-gray-600">
            Configure loan parameters and system preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="loan-card">
              <CardHeader>
                <CardTitle>Settings Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-lime-100 text-lime-700 font-semibold">
                    Loan Parameters
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
                    Fees & Charges
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
                    Notifications
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
                    System Status
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Parameters */}
            <Card className="loan-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-lime-600" />
                  Loan Parameters
                </CardTitle>
                <CardDescription>
                  Configure loan amounts, periods, and approval settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Loan Amount (KES)
                    </label>
                    <input
                      type="number"
                      value={settings.min_loan_amount}
                      onChange={(e) => handleInputChange('min_loan_amount', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Loan Amount (KES)
                    </label>
                    <input
                      type="number"
                      value={settings.max_loan_amount}
                      onChange={(e) => handleInputChange('max_loan_amount', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Repayment Period (Days)
                    </label>
                    <input
                      type="number"
                      value={settings.max_repayment_period_days}
                      onChange={(e) => handleInputChange('max_repayment_period_days', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-Approval Threshold (KES)
                    </label>
                    <input
                      type="number"
                      value={settings.auto_approval_threshold}
                      onChange={(e) => handleInputChange('auto_approval_threshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Loans below this amount are auto-approved
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fees & Charges */}
            <Card className="loan-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-lime-600" />
                  Fees & Charges
                </CardTitle>
                <CardDescription>
                  Set processing fees, interest rates, and penalty charges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processing Fee (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.processing_fee_percentage}
                      onChange={(e) => handleInputChange('processing_fee_percentage', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Deducted upfront from loan amount
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (% per annum)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.interest_rate_percentage}
                      onChange={(e) => handleInputChange('interest_rate_percentage', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Late Payment Fee (KES)
                    </label>
                    <input
                      type="number"
                      value={settings.late_payment_fee}
                      onChange={(e) => handleInputChange('late_payment_fee', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extension Fee (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.extension_fee_percentage}
                      onChange={(e) => handleInputChange('extension_fee_percentage', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Of outstanding amount
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="loan-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-lime-600" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure system notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Send email alerts for loan updates</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('email_notifications', !settings.email_notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.email_notifications ? 'bg-lime-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Send SMS alerts for important updates</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('sms_notifications', !settings.sms_notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.sms_notifications ? 'bg-lime-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.sms_notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="loan-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-lime-600" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Control system maintenance and operational status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-500">Temporarily disable the system for maintenance</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('maintenance_mode', !settings.maintenance_mode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.maintenance_mode ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.maintenance_mode && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium mb-1">Maintenance Mode Active</p>
                          <p>Users will see a maintenance message when trying to access the system.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center">
                {saved && (
                  <div className="flex items-center text-green-600 mr-4">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Settings saved successfully</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={fetchSettings}
                  disabled={isSaving}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

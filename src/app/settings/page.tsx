'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  CheckCircle,
  User,
  Mail,
  Phone,
  Lock
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile settings
  const [profileData, setProfileData] = useState({
    full_name: (user as any)?.full_name || '',
    email: (user as any)?.email || '',
    phone_number: (user as any)?.phone_number || '',
    national_id: (user as any)?.national_id || '',
    kra_pin: (user as any)?.kra_pin || ''
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: true,
    loan_updates: true,
    payment_reminders: true,
    marketing_emails: false
  })

  // Security settings
  const [securityData, setSecurityData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const handleSave = async (section: string) => {
    setIsLoading(true)
    setSaved(false)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
    const { name, value } = e.target
    if (section === 'profile') {
      setProfileData(prev => ({ ...prev, [name]: value }))
    } else if (section === 'security') {
      setSecurityData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleNotificationChange = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }))
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="bg-lime-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <SettingsIcon className="h-10 w-10 text-lime-600" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">Account Settings</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your account preferences, notifications, and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="loan-card">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-lime-100 text-lime-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className="h-5 w-5 mr-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card className="loan-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-lime-600" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={profileData.full_name}
                          onChange={(e) => handleInputChange(e, 'profile')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange(e, 'profile')}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            value={profileData.phone_number}
                            onChange={(e) => handleInputChange(e, 'profile')}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="national_id" className="block text-sm font-medium text-gray-700 mb-2">
                          National ID
                        </label>
                        <input
                          type="text"
                          id="national_id"
                          name="national_id"
                          value={profileData.national_id}
                          onChange={(e) => handleInputChange(e, 'profile')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="kra_pin" className="block text-sm font-medium text-gray-700 mb-2">
                          KRA PIN
                        </label>
                        <input
                          type="text"
                          id="kra_pin"
                          name="kra_pin"
                          value={profileData.kra_pin}
                          onChange={(e) => handleInputChange(e, 'profile')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {saved && (
                          <div className="flex items-center text-green-600 mr-4">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Saved successfully</span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleSave('profile')}
                        disabled={isLoading}
                        className="btn-primary"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="loan-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-lime-600" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about your account and loans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {Object.entries(notificationSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900 capitalize">
                              {key.replace(/_/g, ' ')}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {key === 'email_notifications' && 'Receive notifications via email'}
                              {key === 'sms_notifications' && 'Receive notifications via SMS'}
                              {key === 'loan_updates' && 'Get updates about your loan applications'}
                              {key === 'payment_reminders' && 'Receive payment due reminders'}
                              {key === 'marketing_emails' && 'Receive promotional offers and updates'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange(key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-lime-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {saved && (
                          <div className="flex items-center text-green-600 mr-4">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Settings saved</span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleSave('notifications')}
                        disabled={isLoading}
                        className="btn-primary"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="loan-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-lime-600" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Update your password and manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          id="current_password"
                          name="current_password"
                          value={securityData.current_password}
                          onChange={(e) => handleInputChange(e, 'security')}
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="new_password"
                          name="new_password"
                          value={securityData.new_password}
                          onChange={(e) => handleInputChange(e, 'security')}
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirm_password"
                          name="confirm_password"
                          value={securityData.confirm_password}
                          onChange={(e) => handleInputChange(e, 'security')}
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">Password Requirements:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Minimum 8 characters</li>
                            <li>At least one uppercase letter</li>
                            <li>At least one lowercase letter</li>
                            <li>At least one number</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {saved && (
                          <div className="flex items-center text-green-600 mr-4">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Password updated</span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleSave('security')}
                        disabled={isLoading}
                        className="btn-primary"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

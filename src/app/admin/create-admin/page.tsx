'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Shield, UserPlus, Eye, EyeOff } from 'lucide-react'

const createAdminSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  national_id: z.string().min(8, 'National ID must be at least 8 characters'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  kra_pin: z.string().min(11, 'KRA PIN must be 11 characters').max(11, 'KRA PIN must be 11 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type CreateAdminForm = z.infer<typeof createAdminSchema>

export default function CreateAdminPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
  })

  // Redirect if not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only administrators can create admin accounts.</p>
          <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: CreateAdminForm) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Create admin user in the database
      const { data: newAdmin, error: insertError } = await supabase
        .from('users')
        .insert({
          full_name: data.full_name,
          national_id: data.national_id,
          phone_number: data.phone_number,
          email: data.email,
          kra_pin: data.kra_pin,
          password_hash: data.password, // In production, hash this password
          status: 'active',
          role: 'admin' // Set as admin
        })

      if (insertError) throw insertError

      setSuccess('Admin account created successfully!')
      
      // Reset form
      setTimeout(() => {
        router.push('/admin')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the admin account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <UserPlus className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">Create Admin Account</h1>
          <p className="text-xl text-gray-600">
            Create a new administrator account for the loan system
          </p>
        </div>

        <Card className="loan-card">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Shield className="h-6 w-6 mr-2 text-red-600" />
              Admin Account Details
            </CardTitle>
            <CardDescription>
              Fill in the details for the new administrator account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    {...register('full_name')}
                    type="text"
                    className="form-input"
                    placeholder="Enter full name"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="national_id" className="block text-sm font-medium text-gray-700 mb-2">
                    National ID
                  </label>
                  <input
                    {...register('national_id')}
                    type="text"
                    className="form-input"
                    placeholder="Enter National ID"
                  />
                  {errors.national_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.national_id.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register('phone_number')}
                    type="tel"
                    className="form-input"
                    placeholder="+254 700 000 000"
                  />
                  {errors.phone_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="form-input"
                    placeholder="admin@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="kra_pin" className="block text-sm font-medium text-gray-700 mb-2">
                    KRA PIN
                  </label>
                  <input
                    {...register('kra_pin')}
                    type="text"
                    className="form-input"
                    placeholder="Enter KRA PIN"
                  />
                  {errors.kra_pin && (
                    <p className="mt-1 text-sm text-red-600">{errors.kra_pin.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="form-input pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input pr-10"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important Security Notice:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Admin accounts have full access to the system</li>
                      <li>Use strong passwords (minimum 8 characters)</li>
                      <li>Only create admin accounts for trusted personnel</li>
                      <li>Admin accounts can manage all users and loans</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Admin...' : 'Create Admin Account'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

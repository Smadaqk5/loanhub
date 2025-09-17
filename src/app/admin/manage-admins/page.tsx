'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { Shield, UserPlus, Users, Mail, Phone, Calendar } from 'lucide-react'
import Link from 'next/link'

interface AdminUser {
  id: string
  full_name: string
  email: string
  phone_number: string
  national_id: string
  kra_pin: string
  status: string
  created_at: string
}

export default function ManageAdminsPage() {
  const { user, isAdmin } = useAuth()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isAdmin) {
      fetchAdmins()
    }
  }, [user, isAdmin])

  const fetchAdmins = async () => {
    try {
      // In a real app, you'd filter by role='admin'
      // For now, we'll show all users as potential admins
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">Manage Administrators</h1>
          <p className="text-xl text-gray-600">
            View and manage administrator accounts
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Accounts</h2>
              <p className="text-gray-600">Total: {admins.length} administrator(s)</p>
            </div>
          </div>
          <Link href="/admin/create-admin">
            <Button className="btn-primary flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Create New Admin
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading administrators...</p>
          </div>
        ) : admins.length === 0 ? (
          <Card className="loan-card">
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Administrators Found</h3>
              <p className="text-gray-600 mb-6">No administrator accounts have been created yet.</p>
              <Link href="/admin/create-admin">
                <Button className="btn-primary">Create First Admin</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {admins.map((admin) => (
              <Card key={admin.id} className="loan-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{admin.full_name}</CardTitle>
                        <CardDescription>Administrator</CardDescription>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      admin.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{admin.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{admin.phone_number}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Created: {formatDate(admin.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Current Admin Info */}
        <Card className="loan-card mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              Current Session
            </CardTitle>
            <CardDescription>
              Information about your current admin session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Logged in as:</label>
                <p className="text-lg font-semibold text-gray-900">{(user as any).full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email:</label>
                <p className="text-lg font-semibold text-gray-900">{(user as any).email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role:</label>
                <p className="text-lg font-semibold text-red-600">Administrator</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status:</label>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

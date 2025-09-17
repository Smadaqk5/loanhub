'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoanCalculator } from '@/components/LoanCalculator'
import { 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { supabase, Loan } from '@/lib/supabase'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoadingLoans, setIsLoadingLoans] = useState(true)

  useEffect(() => {
    if (user) {
      fetchLoans()
    }
  }, [user])

  const fetchLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLoans(data || [])
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setIsLoadingLoans(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'disbursed':
        return <CreditCard className="h-4 w-4 text-blue-600" />
      case 'repaid':
        return <CheckCircle className="h-4 w-4 text-gray-600" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending'
      case 'approved':
        return 'status-approved'
      case 'disbursed':
        return 'status-disbursed'
      case 'repaid':
        return 'status-repaid'
      case 'overdue':
        return 'status-overdue'
      default:
        return 'status-pending'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const activeLoans = loans.filter(loan => ['pending', 'approved', 'disbursed'].includes(loan.status))
  const totalBorrowed = loans.reduce((sum, loan) => sum + loan.amount_requested, 0)
  const totalRepaid = loans.filter(loan => loan.status === 'repaid').reduce((sum, loan) => sum + loan.total_repayment, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {(user as any).full_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your loans and track your financial journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBorrowed)}</div>
              <p className="text-xs text-muted-foreground">
                Across {loans.length} loan{loans.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLoans.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRepaid)}</div>
              <p className="text-xs text-muted-foreground">
                Successfully repaid
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loan Calculator */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Loan Calculator</h2>
          <LoanCalculator />
        </div>

        {/* Recent Loans */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Loans</h2>
            <Link href="/loans/apply">
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Apply for Loan
              </Button>
            </Link>
          </div>

          {isLoadingLoans ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading loans...</p>
            </div>
          ) : loans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No loans yet</h3>
                <p className="text-gray-600 mb-4">You haven't applied for any loans yet.</p>
                <Link href="/loans/apply">
                  <Button>Apply for Your First Loan</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loans.slice(0, 6).map((loan) => (
                <Card key={loan.id} className="loan-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {formatCurrency(loan.amount_requested)}
                      </CardTitle>
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                        {getStatusIcon(loan.status)}
                        <span className="ml-1 capitalize">{loan.status}</span>
                      </div>
                    </div>
                    <CardDescription>
                      {loan.loan_purpose}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Net Disbursed:</span>
                        <span className="font-medium">{formatCurrency(loan.net_disbursed)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Repayment:</span>
                        <span className="font-medium">{formatCurrency(loan.total_repayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">{formatDate(loan.repayment_deadline)}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href={`/loans/${loan.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Get support with your loans and account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/support" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/faq" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    FAQ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    Update Profile
                  </Button>
                </Link>
                <Link href="/settings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

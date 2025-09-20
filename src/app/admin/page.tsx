'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { supabase, Loan, User as SupabaseUser } from '@/lib/supabase'

export default function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    disbursedLoans: 0,
    repaidLoans: 0,
    overdueLoans: 0,
    totalFeesCollected: 0,
    totalInterestCollected: 0,
  })
  const [recentLoans, setRecentLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData()
    }
  }, [user, isAdmin])

  const fetchDashboardData = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Fetch loans count by status
      const { data: loansData } = await supabase
        .from('loans')
        .select('status, processing_fee, interest_rate, net_disbursed, total_repayment')

      // Fetch recent loans
      const { data: recentLoansData } = await supabase
        .from('loans')
        .select(`
          *,
          users!loans_user_id_fkey (
            full_name,
            email,
            phone_number
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (loansData) {
        const loanStats = loansData.reduce((acc: any, loan: any) => {
          acc.totalLoans++
          acc.totalFeesCollected += loan.processing_fee
          
          switch (loan.status) {
            case 'pending':
              acc.pendingLoans++
              break
            case 'approved':
              acc.approvedLoans++
              break
            case 'disbursed':
              acc.disbursedLoans++
              break
            case 'repaid':
              acc.repaidLoans++
              acc.totalInterestCollected += (loan.total_repayment - loan.net_disbursed)
              break
            case 'overdue':
              acc.overdueLoans++
              break
          }
          return acc
        }, {
          totalLoans: 0,
          pendingLoans: 0,
          approvedLoans: 0,
          disbursedLoans: 0,
          repaidLoans: 0,
          overdueLoans: 0,
          totalFeesCollected: 0,
          totalInterestCollected: 0,
        })

        setStats({
          totalUsers: usersCount || 0,
          ...loanStats,
        })
      }

      setRecentLoans(recentLoansData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
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

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">
            {!user 
              ? "Please sign in to access the admin dashboard." 
              : "You need admin privileges to access this area."
            }
          </p>
          
          {/* Quick Sign In Options */}
          <div className="space-y-3 mb-6">
            {!user && (
              <>
                <p className="text-sm text-gray-500">Quick Sign In (Development):</p>
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/auth/signin">
                    <Button className="w-full">Sign In with Email</Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={async () => {
                      // Auto sign in with admin user
                      const { mockAuth } = await import('@/lib/mock-auth')
                      await mockAuth.signIn('admin@loanhubkenya.com', 'Admin123!')
                      window.location.reload()
                    }}
                  >
                    Quick Admin Demo
                  </Button>
                </div>
                
                <div className="text-xs text-gray-400 space-y-1">
                  <p><strong>Admin Credentials:</strong></p>
                  <p>Email: admin@loanhubkenya.com</p>
                  <p>Password: Admin123!</p>
                </div>
              </>
            )}
            
            {user && !isAdmin && (
              <div className="space-y-2">
                <Link href="/dashboard">
                  <Button className="w-full">Go to User Dashboard</Button>
                </Link>
                <p className="text-xs text-gray-500">
                  Current user: {user.email} (User role)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of the loan lending platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLoans}</div>
              <p className="text-xs text-muted-foreground">
                All time loans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Loans</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingLoans}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueLoans}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fees Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalFeesCollected)}</div>
              <p className="text-xs text-muted-foreground">
                Processing fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interest Collected</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalInterestCollected)}</div>
              <p className="text-xs text-muted-foreground">
                From repaid loans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalFeesCollected + stats.totalInterestCollected)}
              </div>
              <p className="text-xs text-muted-foreground">
                Fees + Interest
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loan Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Loan Status Breakdown</CardTitle>
              <CardDescription>
                Current status of all loans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <span className="text-sm font-bold">{stats.pendingLoans}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                  <span className="text-sm font-bold">{stats.approvedLoans}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Disbursed</span>
                  </div>
                  <span className="text-sm font-bold">{stats.disbursedLoans}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm font-medium">Repaid</span>
                  </div>
                  <span className="text-sm font-bold">{stats.repaidLoans}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium">Overdue</span>
                  </div>
                  <span className="text-sm font-bold">{stats.overdueLoans}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/admin/loans">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Loans
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                </Link>
                <Link href="/admin/manage-admins">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Admins
                  </Button>
                </Link>
                <Link href="/admin/create-admin">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Create Admin
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Loans */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Loan Applications</CardTitle>
            <CardDescription>
              Latest loan applications requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading loans...</p>
              </div>
            ) : recentLoans.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No loans found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLoans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                          {getStatusIcon(loan.status)}
                          <span className="ml-1 capitalize">{loan.status}</span>
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(loan.amount_requested)}</p>
                          <p className="text-sm text-gray-600">
                            {(loan as any).users?.full_name || 'Unknown User'} • {formatDate(loan.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{loan.loan_purpose}</span>
                      <Link href={`/admin/loans/${loan.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

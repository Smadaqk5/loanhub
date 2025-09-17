'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BarChart3, 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ReportData {
  totalLoans: number
  totalAmount: number
  totalRevenue: number
  pendingLoans: number
  approvedLoans: number
  disbursedLoans: number
  repaidLoans: number
  overdueLoans: number
  averageLoanAmount: number
  totalUsers: number
  activeUsers: number
  processingFees: number
  interestCollected: number
  lateFees: number
}

export default function AdminReportsPage() {
  const { user, isAdmin } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days
  const [reportType, setReportType] = useState('overview')

  useEffect(() => {
    if (user && isAdmin) {
      fetchReportData()
    }
  }, [user, isAdmin, dateRange])

  const fetchReportData = async () => {
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      // Fetch loans data
      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (loansError) throw loansError

      // Fetch users data
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, status, created_at')

      if (usersError) throw usersError

      // Calculate report data
      const totalLoans = loans?.length || 0
      const totalAmount = loans?.reduce((sum: any, loan: any) => sum + loan.amount_requested, 0) || 0
      const processingFees = loans?.reduce((sum: any, loan: any) => sum + loan.processing_fee, 0) || 0
      const interestCollected = loans?.filter((l: any) => l.status === 'repaid').reduce((sum: any, loan: any) => sum + (loan.total_repayment - loan.net_disbursed), 0) || 0
      const totalRevenue = processingFees + interestCollected

      const statusCounts = loans?.reduce((acc: any, loan: any) => {
        acc[loan.status] = (acc[loan.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const totalUsers = users?.length || 0
      const activeUsers = users?.filter((u: any) => u.status === 'active').length || 0

      setReportData({
        totalLoans,
        totalAmount,
        totalRevenue,
        pendingLoans: statusCounts.pending || 0,
        approvedLoans: statusCounts.approved || 0,
        disbursedLoans: statusCounts.disbursed || 0,
        repaidLoans: statusCounts.repaid || 0,
        overdueLoans: statusCounts.overdue || 0,
        averageLoanAmount: totalLoans > 0 ? totalAmount / totalLoans : 0,
        totalUsers,
        activeUsers,
        processingFees,
        interestCollected,
        lateFees: 0 // This would need to be calculated from actual late payment data
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-KE').format(num)
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // This would implement actual export functionality
    console.log(`Exporting report as ${format}`)
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-red-500 mx-auto mb-4" />
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
          <p className="mt-4 text-gray-600">Generating reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="bg-lime-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-10 w-10 text-lime-600" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">Financial Reports</h1>
          <p className="text-xl text-gray-600">
            Comprehensive financial analytics and reporting
          </p>
        </div>

        {/* Report Controls */}
        <Card className="loan-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  >
                    <option value="overview">Overview</option>
                    <option value="detailed">Detailed</option>
                    <option value="financial">Financial</option>
                    <option value="users">User Analytics</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" onClick={() => handleExport('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="loan-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(reportData?.totalLoans || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Last {dateRange} days
              </p>
            </CardContent>
          </Card>

          <Card className="loan-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData?.totalAmount || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Loan value
              </p>
            </CardContent>
          </Card>

          <Card className="loan-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(reportData?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Fees + Interest
              </p>
            </CardContent>
          </Card>

          <Card className="loan-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(reportData?.activeUsers || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Out of {formatNumber(reportData?.totalUsers || 0)} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loan Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="loan-card">
            <CardHeader>
              <CardTitle>Loan Status Breakdown</CardTitle>
              <CardDescription>
                Distribution of loans by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <span className="text-sm font-bold">{formatNumber(reportData?.pendingLoans || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                  <span className="text-sm font-bold">{formatNumber(reportData?.approvedLoans || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Disbursed</span>
                  </div>
                  <span className="text-sm font-bold">{formatNumber(reportData?.disbursedLoans || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm font-medium">Repaid</span>
                  </div>
                  <span className="text-sm font-bold">{formatNumber(reportData?.repaidLoans || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium">Overdue</span>
                  </div>
                  <span className="text-sm font-bold">{formatNumber(reportData?.overdueLoans || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="loan-card">
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>
                Sources of revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Processing Fees</p>
                    <p className="text-xs text-gray-500">Deducted upfront</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {formatCurrency(reportData?.processingFees || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Interest Collected</p>
                    <p className="text-xs text-gray-500">From repaid loans</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {formatCurrency(reportData?.interestCollected || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Late Fees</p>
                    <p className="text-xs text-gray-500">Penalty charges</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    {formatCurrency(reportData?.lateFees || 0)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Total Revenue</p>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(reportData?.totalRevenue || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="loan-card">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>
              Key financial metrics and performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(reportData?.averageLoanAmount || 0)}
                </div>
                <p className="text-sm text-gray-600">Average Loan Amount</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {reportData?.totalLoans ? ((reportData.repaidLoans / reportData.totalLoans) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-sm text-gray-600">Repayment Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {reportData?.totalLoans ? ((reportData.overdueLoans / reportData.totalLoans) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-sm text-gray-600">Overdue Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

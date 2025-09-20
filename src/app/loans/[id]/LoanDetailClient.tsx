'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  DollarSign,
  ArrowLeft,
  Download,
  Eye,
  FileText,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { supabase, Loan } from '@/lib/supabase'

export function LoanDetailClient() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loan, setLoan] = useState<Loan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchLoan()
    }
  }, [user, params.id])

  const fetchLoan = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Mock loan data for demonstration
      const mockLoan: Loan = {
        id: params.id as string,
        user_id: user?.id || 'mock-user',
        amount_requested: 50000,
        amount_approved: 50000,
        amount_disbursed: 47500,
        processing_fee: 2500,
        interest_rate: 15.0,
        net_disbursed: 47500,
        total_repayment: 54625,
        repayment_deadline: '2024-12-31',
        status: 'approved',
        loan_purpose: 'Business expansion and equipment purchase',
        repayment_period_days: 90,
        created_at: '2024-09-20T10:00:00Z',
        updated_at: '2024-09-20T10:00:00Z',
        approved_at: '2024-09-20T10:30:00Z',
        disbursed_at: '2024-09-20T11:00:00Z',
        payment_method: 'mpesa',
        processing_fee_paid_at: '2024-09-20T10:15:00Z'
      }

      setLoan(mockLoan)
    } catch (err: any) {
      console.error('Error fetching loan:', err)
      setError('Failed to load loan details')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-600" />
      case 'rejected':
        return <AlertCircle className="h-6 w-6 text-red-600" />
      case 'disbursed':
        return <CreditCard className="h-6 w-6 text-blue-600" />
      default:
        return <Clock className="h-6 w-6 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'disbursed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading loan details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/loans">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Loans
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loan Not Found</h1>
          <p className="text-gray-600 mb-6">The loan you're looking for doesn't exist.</p>
          <Link href="/loans">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Loans
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/loans">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Loans
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loan Details</h1>
              <p className="text-gray-600 mt-2">Loan ID: {loan.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(loan.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-lime-600" />
                  Loan Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount Requested</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.amount_requested)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount Approved</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(loan.amount_approved || loan.amount_requested)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Processing Fee</p>
                    <p className="text-xl font-semibold text-orange-600">{formatCurrency(loan.processing_fee)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Net Amount Disbursed</p>
                    <p className="text-xl font-semibold text-blue-600">{formatCurrency(loan.amount_disbursed || loan.net_disbursed)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                    <p className="text-xl font-semibold text-gray-900">{loan.interest_rate}% per annum</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Repayment</p>
                    <p className="text-xl font-semibold text-purple-600">{formatCurrency(loan.total_repayment)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Purpose */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-lime-600" />
                  Loan Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{loan.loan_purpose}</p>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-lime-600" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                    <div>
                      <p className="font-medium">Application Submitted</p>
                      <p className="text-sm text-gray-500">{formatDate(loan.created_at)}</p>
                    </div>
                  </div>
                  {loan.approved_at && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                      <div>
                        <p className="font-medium">Application Approved</p>
                        <p className="text-sm text-gray-500">{formatDate(loan.approved_at)}</p>
                      </div>
                    </div>
                  )}
                  {loan.processing_fee_paid_at && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-4"></div>
                      <div>
                        <p className="font-medium">Processing Fee Paid</p>
                        <p className="text-sm text-gray-500">{formatDate(loan.processing_fee_paid_at)}</p>
                      </div>
                    </div>
                  )}
                  {loan.disbursed_at && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-4"></div>
                      <div>
                        <p className="font-medium">Amount Disbursed</p>
                        <p className="text-sm text-gray-500">{formatDate(loan.disbursed_at)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-4"></div>
                    <div>
                      <p className="font-medium">Repayment Deadline</p>
                      <p className="text-sm text-gray-500">{formatDate(loan.repayment_deadline)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Statement
                </Button>
                <Button className="w-full" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  View Documents
                </Button>
                {loan.status === 'approved' && (
                  <Button className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Make Payment
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Loan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-lime-600" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repayment Period</span>
                    <span className="font-medium">{loan.repayment_period_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium capitalize">{loan.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Remaining</span>
                    <span className="font-medium text-orange-600">
                      {Math.max(0, Math.ceil((new Date(loan.repayment_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

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

export default function LoanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loan, setLoan] = useState<Loan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && params.id) {
      fetchLoan()
    }
  }, [user, params.id])

  const fetchLoan = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setLoan(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load loan details')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'disbursed':
        return <CreditCard className="h-5 w-5 text-blue-600" />
      case 'repaid':
        return <CheckCircle className="h-5 w-5 text-gray-600" />
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'disbursed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'repaid':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
      day: 'numeric',
    })
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading loan details...</p>
        </div>
      </div>
    )
  }

  if (error || !loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loan Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The loan you are looking for does not exist or you do not have permission to view it.'}</p>
          <Link href="/loans">
            <Button>Back to My Loans</Button>
          </Link>
        </div>
      </div>
    )
  }

  const daysUntilDue = getDaysUntilDue(loan.repayment_deadline)
  const isOverdue = daysUntilDue < 0
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link href="/loans" className="inline-flex items-center text-lime-600 hover:text-lime-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Loans
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loan Details</h1>
              <p className="text-gray-600 mt-2">Loan ID: {loan.id}</p>
            </div>
            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(loan.status)}`}>
              {getStatusIcon(loan.status)}
              <span className="ml-2 capitalize">{loan.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Loan Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Summary */}
            <Card className="loan-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-lime-600" />
                  Loan Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Requested Amount</label>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.amount_requested)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Net Disbursed</label>
                      <p className="text-xl font-semibold text-green-600">{formatCurrency(loan.net_disbursed)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Processing Fee</label>
                      <p className="text-lg font-semibold text-red-600">-{formatCurrency(loan.processing_fee)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Repayment</label>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.total_repayment)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Interest Rate</label>
                      <p className="text-lg font-semibold">{loan.interest_rate}% per annum</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Interest Amount</label>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatCurrency(loan.total_repayment - loan.net_disbursed)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Purpose */}
            <Card className="loan-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-lime-600" />
                  Loan Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{loan.loan_purpose}</p>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="loan-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-lime-600" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Application Date</p>
                        <p className="text-sm text-gray-500">When you applied for this loan</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">{formatDate(loan.created_at)}</p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Repayment Deadline</p>
                        <p className="text-sm text-gray-500">When the loan must be fully repaid</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatDate(loan.repayment_deadline)}</p>
                      {isOverdue && (
                        <p className="text-sm text-red-600 font-medium">Overdue by {Math.abs(daysUntilDue)} days</p>
                      )}
                      {isDueSoon && !isOverdue && (
                        <p className="text-sm text-yellow-600 font-medium">Due in {daysUntilDue} days</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="loan-card">
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border mb-4 ${getStatusColor(loan.status)}`}>
                    {getStatusIcon(loan.status)}
                    <span className="ml-2 capitalize">{loan.status}</span>
                  </div>
                  
                  {loan.status === 'pending' && (
                    <p className="text-sm text-gray-600">
                      Your loan application is being reviewed. You will receive an email notification once it's processed.
                    </p>
                  )}
                  
                  {loan.status === 'approved' && (
                    <p className="text-sm text-gray-600">
                      Your loan has been approved! Funds will be disbursed to your account within 24 hours.
                    </p>
                  )}
                  
                  {loan.status === 'disbursed' && (
                    <p className="text-sm text-gray-600">
                      Your loan has been disbursed. Please ensure timely repayment to avoid additional charges.
                    </p>
                  )}
                  
                  {loan.status === 'repaid' && (
                    <p className="text-sm text-gray-600">
                      Congratulations! This loan has been fully repaid. Thank you for your business.
                    </p>
                  )}
                  
                  {loan.status === 'overdue' && (
                    <p className="text-sm text-red-600">
                      This loan is overdue. Please contact us immediately to discuss payment arrangements.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="loan-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Statement
                  </Button>
                  
                  {loan.status === 'disbursed' && (
                    <Button className="w-full btn-primary">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Make Payment
                    </Button>
                  )}
                  
                  {loan.status === 'overdue' && (
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  )}
                  
                  <Link href="/support" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      Get Help
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            {loan.status === 'disbursed' && (
              <Card className="loan-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-lime-600" />
                    Payment Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Due:</span>
                      <span className="font-semibold">{formatCurrency(loan.total_repayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-semibold">{formatDate(loan.repayment_deadline)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Remaining:</span>
                      <span className={`font-semibold ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                        {isOverdue ? `${Math.abs(daysUntilDue)} overdue` : `${daysUntilDue} days`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

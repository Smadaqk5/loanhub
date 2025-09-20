'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
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
import { formatCurrency } from '@/lib/loan-calculator'

export default function LoanDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loan, setLoan] = useState<Loan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loanId = searchParams.get('id')

  useEffect(() => {
    const fetchLoan = async () => {
      if (!user || !loanId) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('loans')
          .select('*')
          .eq('id', loanId)
          .single()

        if (error) {
          throw error
        }

        if (data) {
          setLoan(data)
        } else {
          setError('Loan not found.')
        }
      } catch (err: any) {
        console.error('Error fetching loan details:', err)
        setError(err.message || 'Failed to fetch loan details.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoan()
  }, [user, loanId])

  const getStatusColor = (status: Loan['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'disbursed':
        return 'bg-blue-100 text-blue-800'
      case 'repaid':
        return 'bg-purple-100 text-purple-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'rejected':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
      case 'processing_fee_paid':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status: Loan['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 mr-1" />
      case 'disbursed':
        return <CreditCard className="h-4 w-4 mr-1" />
      case 'repaid':
        return <DollarSign className="h-4 w-4 mr-1" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4 mr-1" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4 mr-1" />
      case 'pending':
      case 'processing_fee_paid':
      default:
        return <Clock className="h-4 w-4 mr-1" />
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Error</CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className="inline-flex items-center px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-gray-500" />
            </div>
            <CardTitle>Loan Not Found</CardTitle>
            <CardDescription>The loan you are looking for does not exist or you do not have access.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className="inline-flex items-center px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Loan Details</h1>
          <Link href="/dashboard">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </button>
          </Link>
        </div>

        <Card className="loan-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Loan #{loan.id.substring(0, 8)}</CardTitle>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
              {getStatusIcon(loan.status)}
              {loan.status.replace(/_/g, ' ').toUpperCase()}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
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
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(loan.total_repayment)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Repayment Deadline</p>
                <p className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  {new Date(loan.repayment_deadline).toDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Loan Purpose</p>
                <p className="text-xl font-semibold text-gray-900">{loan.loan_purpose}</p>
              </div>
              {loan.payment_method && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-xl font-semibold text-gray-900">{loan.payment_method}</p>
                </div>
              )}
              {loan.processing_fee_paid_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Processing Fee Paid At</p>
                  <p className="text-xl font-semibold text-gray-900">{new Date(loan.processing_fee_paid_at).toLocaleString()}</p>
                </div>
              )}
              {loan.approved_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved At</p>
                  <p className="text-xl font-semibold text-gray-900">{new Date(loan.approved_at).toLocaleString()}</p>
                </div>
              )}
              {loan.disbursed_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Disbursed At</p>
                  <p className="text-xl font-semibold text-gray-900">{new Date(loan.disbursed_at).toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Application Date</p>
                <p className="text-xl font-semibold text-gray-900">{new Date(loan.created_at).toLocaleString()}</p>
              </div>
            </div>

            {loan.status === 'approved' && (
              <div className="pt-6 border-t border-gray-200 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
                <button className="inline-flex items-center px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700">
                  <CreditCard className="h-4 w-4 mr-2" /> Accept Loan & Disburse
                </button>
              </div>
            )}

            {loan.status === 'disbursed' && (
              <div className="pt-6 border-t border-gray-200 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Repayment Options</h3>
                <button className="inline-flex items-center px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700">
                  <DollarSign className="h-4 w-4 mr-2" /> Make Repayment
                </button>
              </div>
            )}

            {loan.status === 'repaid' && (
              <div className="pt-6 border-t border-gray-200 mt-6 text-center text-green-600 font-semibold">
                <CheckCircle className="h-6 w-6 inline-block mr-2" /> Loan Successfully Repaid!
              </div>
            )}

            {loan.status === 'overdue' && (
              <div className="pt-6 border-t border-gray-200 mt-6 text-center text-red-600 font-semibold">
                <AlertCircle className="h-6 w-6 inline-block mr-2" /> Loan is Overdue! Please make a repayment.
              </div>
            )}

            <div className="pt-6 border-t border-gray-200 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents</h3>
              <div className="flex flex-wrap gap-4">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <FileText className="h-4 w-4 mr-2" /> View Loan Agreement
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" /> Download Statement
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

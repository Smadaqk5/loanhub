'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { supabase, Loan } from '@/lib/supabase'

export default function LoansPage() {
  const { user, loading } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'disbursed' | 'repaid' | 'overdue'>('all')

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
      setIsLoading(false)
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

  const filteredLoans = filter === 'all' 
    ? loans 
    : loans.filter(loan => loan.status === filter)

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
          <p className="text-gray-600 mb-6">Please sign in to view your loans.</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Loans</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your loan applications
            </p>
          </div>
          <Link href="/loans/apply">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Apply for Loan
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All Loans', count: loans.length },
              { key: 'pending', label: 'Pending', count: loans.filter(l => l.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: loans.filter(l => l.status === 'approved').length },
              { key: 'disbursed', label: 'Disbursed', count: loans.filter(l => l.status === 'disbursed').length },
              { key: 'repaid', label: 'Repaid', count: loans.filter(l => l.status === 'repaid').length },
              { key: 'overdue', label: 'Overdue', count: loans.filter(l => l.status === 'overdue').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Loans List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your loans...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No loans yet' : `No ${filter} loans`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't applied for any loans yet."
                  : `You don't have any ${filter} loans at the moment.`
                }
              </p>
              {filter === 'all' && (
                <Link href="/loans/apply">
                  <Button>Apply for Your First Loan</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredLoans.map((loan) => (
              <Card key={loan.id} className="loan-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(loan.status)}`}>
                        {getStatusIcon(loan.status)}
                        <span className="ml-2 capitalize">{loan.status}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {formatCurrency(loan.amount_requested)}
                        </h3>
                        <p className="text-sm text-gray-600">{loan.loan_purpose}</p>
                      </div>
                    </div>
                    <Link href={`/loans/detail?id=${loan.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Net Disbursed</div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(loan.net_disbursed)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Repayment</div>
                      <div className="font-semibold">
                        {formatCurrency(loan.total_repayment)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Processing Fee</div>
                      <div className="font-semibold text-red-600">
                        -{formatCurrency(loan.processing_fee)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Due Date</div>
                      <div className="font-semibold flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(loan.repayment_deadline)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Applied on {formatDate(loan.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

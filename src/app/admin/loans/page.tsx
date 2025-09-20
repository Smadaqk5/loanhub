'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  MoreVertical,
  X
} from 'lucide-react'
import { supabase, Loan } from '@/lib/supabase'

export default function AdminLoansPage() {
  const { user, isAdmin } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    if (user && isAdmin) {
      fetchLoans()
    }
  }, [user, isAdmin])

  const fetchLoans = async () => {
    try {
      const { data, error } = await supabase
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

      if (error) throw error
      setLoans(data || [])
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (loanId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', loanId)

      if (error) throw error

      // Update local state
      setLoans(loans.map(loan => 
        loan.id === loanId 
          ? { ...loan, status: newStatus as any, updated_at: new Date().toISOString() }
          : loan
      ))

      // Show success message
      alert(`Loan status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating loan status:', error)
      alert('Failed to update loan status')
    }
  }

  const openReviewModal = (loan: any) => {
    setSelectedLoan(loan)
    setShowReviewModal(true)
  }

  const closeReviewModal = () => {
    setSelectedLoan(null)
    setShowReviewModal(false)
  }

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.id.includes(searchTerm) ||
                         (loan as any).users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (loan as any).users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'processing_fee_paid':
        return <CreditCard className="h-4 w-4 text-orange-600" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'disbursed':
        return <CreditCard className="h-4 w-4 text-blue-600" />
      case 'repaid':
        return <CheckCircle className="h-4 w-4 text-gray-600" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing_fee_paid':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'disbursed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'repaid':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'rejected':
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
      month: 'short',
      day: 'numeric'
    })
  }


  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="h-16 w-16 text-red-500 mx-auto mb-4" />
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
          <div className="bg-lime-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-10 w-10 text-lime-600" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">Loan Management</h1>
          <p className="text-xl text-gray-600">
            Review, approve, and manage all loan applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="loan-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loans.length}</div>
              <p className="text-xs text-muted-foreground">All applications</p>
            </CardContent>
          </Card>

          <Card className="loan-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {loans.filter(l => l.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="loan-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loans.filter(l => l.status === 'approved').length}
              </div>
              <p className="text-xs text-muted-foreground">Ready for disbursement</p>
            </CardContent>
          </Card>

          <Card className="loan-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loans.filter(l => l.status === 'overdue').length}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="loan-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search loans by ID, borrower name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing_fee_paid">Processing Fee Paid</option>
                  <option value="approved">Approved</option>
                  <option value="disbursed">Disbursed</option>
                  <option value="repaid">Repaid</option>
                  <option value="overdue">Overdue</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loans Table */}
        <Card className="loan-card">
          <CardHeader>
            <CardTitle>Loan Applications ({filteredLoans.length})</CardTitle>
            <CardDescription>
              Review and manage loan applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading loans...</p>
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No loans found</h3>
                <p className="text-gray-600">No loans match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Loan ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Borrower</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Applied</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Due Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLoans.map((loan) => (
                      <tr key={loan.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-mono text-sm text-gray-900">#{loan.id.slice(-8)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {(loan as any).users?.full_name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(loan as any).users?.email || 'No email'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(loan.amount_requested)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Net: {formatCurrency(loan.net_disbursed)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                            {getStatusIcon(loan.status)}
                            <span className="ml-1 capitalize">{loan.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-2" />
                            {formatDate(loan.created_at)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-2" />
                            {formatDate(loan.repayment_deadline)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openReviewModal(loan)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {loan.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleStatusChange(loan.id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleStatusChange(loan.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            {loan.status === 'processing_fee_paid' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleStatusChange(loan.id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleStatusChange(loan.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {loan.status === 'approved' && (
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleStatusChange(loan.id, 'disbursed')}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Modal */}
        {showReviewModal && selectedLoan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Loan Review</h2>
                <Button variant="outline" onClick={closeReviewModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Loan Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Loan ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">#{selectedLoan.id.slice(-8)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedLoan.status)}`}>
                      {getStatusIcon(selectedLoan.status)}
                      <span className="ml-1 capitalize">{selectedLoan.status}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount Requested</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedLoan.amount_requested)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Net Disbursed</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedLoan.net_disbursed)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processing Fee</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedLoan.processing_fee)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interest Rate</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLoan.interest_rate}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Repayment</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedLoan.total_repayment)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Repayment Deadline</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLoan.repayment_deadline)}</p>
                  </div>
                </div>

                {/* Loan Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loan Purpose</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLoan.loan_purpose}</p>
                </div>

                {/* Payment Information */}
                {selectedLoan.status === 'processing_fee_paid' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-900 mb-3">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700">Payment Method</label>
                        <p className="mt-1 text-sm text-green-900 capitalize">{(selectedLoan as any).payment_method || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700">Payment Date</label>
                        <p className="mt-1 text-sm text-green-900">
                          {(selectedLoan as any).processing_fee_paid_at 
                            ? formatDate((selectedLoan as any).processing_fee_paid_at)
                            : 'Not available'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-green-100 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          Processing fee of {formatCurrency(selectedLoan.processing_fee)} has been paid
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Borrower Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Borrower Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{(selectedLoan as any).users?.full_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{(selectedLoan as any).users?.email || 'No email'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <p className="mt-1 text-sm text-gray-900">{(selectedLoan as any).users?.phone_number || 'No phone'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">National ID</label>
                      <p className="mt-1 text-sm text-gray-900">{(selectedLoan as any).users?.national_id || 'No ID'}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {(selectedLoan.status === 'pending' || selectedLoan.status === 'processing_fee_paid') && (
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button 
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        handleStatusChange(selectedLoan.id, 'rejected')
                        closeReviewModal()
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleStatusChange(selectedLoan.id, 'approved')
                        closeReviewModal()
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

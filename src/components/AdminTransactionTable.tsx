'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical
} from 'lucide-react'

interface Transaction {
  id: string
  loan_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired'
  payment_method: 'mpesa' | 'airtel_money' | 'equitel' | 'visa' | 'mastercard'
  phone_number: string
  created_at: string
  paid_at?: string
  pesapal_merchant_reference: string
  pesapal_order_tracking_id?: string
  loan?: {
    id: string
    amount_requested: number
    loan_purpose: string
    status: string
  }
}

interface AdminTransactionTableProps {
  onTransactionSelect?: (transaction: Transaction) => void
  onRetryTransaction?: (transactionId: string) => void
}

export function AdminTransactionTable({ 
  onTransactionSelect, 
  onRetryTransaction 
}: AdminTransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState<any>({})

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentMethodFilter !== 'all' && { payment_method: paymentMethodFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      })

      const response = await fetch(`/api/admin/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setTransactions(result.data.transactions)
        setTotalPages(result.data.pagination.pages)
        setSummary(result.data.summary)
      } else {
        console.error('Failed to fetch transactions:', result.error)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, searchTerm, statusFilter, paymentMethodFilter, dateFrom, dateTo])

  const handleRetry = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      const result = await response.json()

      if (result.success) {
        alert('Transaction retry initiated successfully')
        fetchTransactions() // Refresh the list
        onRetryTransaction?.(transactionId)
      } else {
        alert(`Failed to retry transaction: ${result.error}`)
      }
    } catch (error) {
      console.error('Error retrying transaction:', error)
      alert('Failed to retry transaction')
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      })

      const response = await fetch(`/api/admin/transactions/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to export transactions')
      }
    } catch (error) {
      console.error('Error exporting transactions:', error)
      alert('Failed to export transactions')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200'
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa'
      case 'airtel_money':
        return 'Airtel Money'
      case 'equitel':
        return 'Equitel'
      case 'visa':
        return 'Visa'
      case 'mastercard':
        return 'Mastercard'
      default:
        return method
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_transactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.total_amount || 0)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary.by_status?.completed?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.by_status?.completed?.total_amount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.by_status?.pending?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.by_status?.pending?.total_amount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.by_status?.failed?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.by_status?.failed?.total_amount || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reference, phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="mpesa">M-Pesa</option>
                <option value="airtel_money">Airtel Money</option>
                <option value="equitel">Equitel</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
              </select>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="From Date"
              />

              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="To Date"
              />

              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button
                onClick={fetchTransactions}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({transactions.length})</CardTitle>
          <CardDescription>
            All payment transactions with filtering and management options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">No transactions match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Transaction ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Loan ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Method</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <p className="font-mono text-sm text-gray-900">
                          #{transaction.id.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.pesapal_merchant_reference}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-mono text-sm text-gray-900">
                          #{transaction.loan_id.slice(-8)}
                        </p>
                        {transaction.loan && (
                          <p className="text-xs text-gray-500">
                            {formatCurrency(transaction.loan.amount_requested)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.currency}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getPaymentMethodName(transaction.payment_method)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">
                          {transaction.phone_number}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </div>
                        {transaction.paid_at && (
                          <div className="text-xs text-gray-500">
                            Paid: {formatDate(transaction.paid_at)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTransactionSelect?.(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {transaction.status === 'failed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleRetry(transaction.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

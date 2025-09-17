'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { calculateLoan, formatCurrency, formatPercentage } from '@/lib/loan-calculator'
import { Calculator, DollarSign, Percent, Calendar, TrendingUp } from 'lucide-react'

interface LoanCalculatorProps {
  onCalculate?: (calculation: any) => void
  initialAmount?: number
  initialPeriod?: number
}

export function LoanCalculator({ onCalculate, initialAmount = 10000, initialPeriod = 90 }: LoanCalculatorProps) {
  const [amount, setAmount] = useState(initialAmount)
  const [period, setPeriod] = useState(initialPeriod)
  const [processingFeePercentage, setProcessingFeePercentage] = useState(5.0)
  const [interestRatePercentage, setInterestRatePercentage] = useState(15.0)
  const [calculation, setCalculation] = useState<any>(null)

  useEffect(() => {
    const calc = calculateLoan(amount, processingFeePercentage, interestRatePercentage, period)
    setCalculation(calc)
    if (onCalculate) {
      onCalculate(calc)
    }
  }, [amount, period, processingFeePercentage, interestRatePercentage, onCalculate])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    setAmount(value)
  }

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setPeriod(value)
  }

  return (
    <div className="space-y-6">
      <Card className="loan-calculator">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Loan Calculator
          </CardTitle>
          <CardDescription>
            Calculate your loan details and see the breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (KES)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter loan amount"
                  min="1000"
                  max="1000000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                Repayment Period (Days)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="period"
                  type="number"
                  value={period}
                  onChange={handlePeriodChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter repayment period"
                  min="30"
                  max="365"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="processingFee" className="block text-sm font-medium text-gray-700 mb-2">
                Processing Fee (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="processingFee"
                  type="number"
                  value={processingFeePercentage}
                  onChange={(e) => setProcessingFeePercentage(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Processing fee percentage"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%)
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="interestRate"
                  type="number"
                  value={interestRatePercentage}
                  onChange={(e) => setInterestRatePercentage(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Interest rate percentage"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle>Loan Breakdown</CardTitle>
            <CardDescription>
              Here's a detailed breakdown of your loan calculation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Requested Amount</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(calculation.requestedAmount)}
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600">Processing Fee ({formatPercentage(calculation.processingFeePercentage)})</div>
                  <div className="text-2xl font-bold text-red-700">
                    -{formatCurrency(calculation.processingFee)}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">Interest ({formatPercentage(calculation.interestRatePercentage)})</div>
                  <div className="text-2xl font-bold text-blue-700">
                    +{formatCurrency(calculation.interestAmount)}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600">Net Amount Disbursed</div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(calculation.netDisbursed)}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Total Repayment</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(calculation.totalRepayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Monthly Payment (approx.)</span>
                  <span>{formatCurrency(calculation.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Repayment Period</span>
                  <span>{calculation.repaymentPeriodDays} days</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>Important:</strong> The processing fee is deducted upfront from your requested amount. 
                  You will receive the net disbursed amount after the processing fee deduction.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

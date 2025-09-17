export interface LoanCalculation {
  requestedAmount: number
  processingFeePercentage: number
  processingFee: number
  interestRatePercentage: number
  interestAmount: number
  netDisbursed: number
  totalRepayment: number
  monthlyPayment: number
  repaymentPeriodDays: number
}

export function calculateLoan(
  requestedAmount: number,
  processingFeePercentage: number,
  interestRatePercentage: number,
  repaymentPeriodDays: number
): LoanCalculation {
  // Calculate processing fee
  const processingFee = (requestedAmount * processingFeePercentage) / 100
  
  // Calculate net disbursed amount (after processing fee deduction)
  const netDisbursed = requestedAmount - processingFee
  
  // Calculate interest amount based on net disbursed amount
  const interestAmount = (netDisbursed * interestRatePercentage) / 100
  
  // Calculate total repayment (net disbursed + interest)
  const totalRepayment = netDisbursed + interestAmount
  
  // Calculate monthly payment
  const monthlyPayment = totalRepayment / Math.ceil(repaymentPeriodDays / 30)
  
  return {
    requestedAmount,
    processingFeePercentage,
    processingFee,
    interestRatePercentage,
    interestAmount,
    netDisbursed,
    totalRepayment,
    monthlyPayment,
    repaymentPeriodDays
  }
}

export function validateLoanAmount(
  amount: number,
  minAmount: number,
  maxAmount: number
): { isValid: boolean; error?: string } {
  if (amount < minAmount) {
    return {
      isValid: false,
      error: `Minimum loan amount is KES ${minAmount.toLocaleString()}`
    }
  }
  
  if (amount > maxAmount) {
    return {
      isValid: false,
      error: `Maximum loan amount is KES ${maxAmount.toLocaleString()}`
    }
  }
  
  return { isValid: true }
}

export function validateRepaymentPeriod(
  days: number,
  maxDays: number
): { isValid: boolean; error?: string } {
  if (days > maxDays) {
    return {
      isValid: false,
      error: `Maximum repayment period is ${maxDays} days`
    }
  }
  
  if (days < 1) {
    return {
      isValid: false,
      error: 'Repayment period must be at least 1 day'
    }
  }
  
  return { isValid: true }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(2)}%`
}

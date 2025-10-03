// Loan Payment API Endpoint
// Handles loan payments with PesaPal integration

import { NextRequest, NextResponse } from 'next/server'
import { loanhubPesapalService, LoanPaymentData } from '@/lib/loanhub-pesapal-service'

export async function POST(req: NextRequest) {
  try {
    console.log('🏦 Loan payment request received')
    
    const body = await req.json()
    
    // Validate required fields
    const { customerPhone, loanAmount, loanReference, paymentType, customerName } = body
    
    if (!customerPhone || !loanAmount || !loanReference || !paymentType || !customerName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: customerPhone, loanAmount, loanReference, paymentType, customerName'
      }, { status: 400 })
    }

    // Validate loan amount
    if (loanAmount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Loan amount must be greater than 0'
      }, { status: 400 })
    }

    // Validate payment type
    const validPaymentTypes = ['repayment', 'application_fee', 'late_fee', 'processing_fee']
    if (!validPaymentTypes.includes(paymentType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment type. Must be one of: repayment, application_fee, late_fee, processing_fee'
      }, { status: 400 })
    }

    // Prepare payment data
    const paymentData: LoanPaymentData = {
      customerPhone,
      loanAmount: Number(loanAmount),
      loanReference,
      paymentType,
      customerName,
      customerEmail: body.customerEmail,
      description: body.description
    }

    console.log('📱 Processing loan payment with PesaPal...')
    
    // Process payment with PesaPal
    const result = await loanhubPesapalService.processLoanPayment(paymentData)
    
    if (result.error) {
      console.error('❌ Loan payment failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error,
        loanReference
      }, { status: 500 })
    }

    console.log('✅ Loan payment processed successfully:', result.order_tracking_id)
    
    return NextResponse.json({
      success: true,
      message: 'Loan payment URL created successfully',
      data: {
        orderTrackingId: result.order_tracking_id,
        redirectUrl: result.redirect_url,
        loanReference: result.loan_reference,
        paymentMethod: result.payment_method,
        mobileOptimized: result.mobile_optimized,
        amount: paymentData.loanAmount,
        currency: 'KES',
        status: 'PENDING'
      }
    })

  } catch (error: any) {
    console.error('❌ Loan payment API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Loan payment status check request')
    
    const { searchParams } = new URL(req.url)
    const orderTrackingId = searchParams.get('orderTrackingId')
    
    if (!orderTrackingId) {
      return NextResponse.json({
        success: false,
        error: 'orderTrackingId is required'
      }, { status: 400 })
    }

    const status = await loanhubPesapalService.checkPaymentStatus(orderTrackingId)
    
    if (!status) {
      return NextResponse.json({
        success: false,
        error: 'Payment status not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error: any) {
    console.error('❌ Payment status check error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

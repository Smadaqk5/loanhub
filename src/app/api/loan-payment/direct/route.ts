// Direct Loan Payment API Endpoint
// Mobile-optimized direct loan payment processing

import { NextRequest, NextResponse } from 'next/server'
import { loanhubPesapalService, LoanPaymentData } from '@/lib/loanhub-pesapal-service'

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    console.log('📱 Direct loan payment request received')
    
    const body = await req.json()
    
    // Validate required fields for direct payment
    const { customerPhone, loanAmount, loanReference, paymentType, customerName } = body
    
    if (!customerPhone || !loanAmount || !loanReference || !paymentType || !customerName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields for direct payment'
      }, { status: 400 })
    }

    // Validate phone number format
    const phoneRegex = /^(\+254|0)[0-9]{9}$/
    if (!phoneRegex.test(customerPhone.replace(/\s/g, ''))) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format. Use +254XXXXXXXXX or 0XXXXXXXXX'
      }, { status: 400 })
    }

    // Prepare direct payment data
    const paymentData: LoanPaymentData = {
      customerPhone,
      loanAmount: Number(loanAmount),
      loanReference,
      paymentType,
      customerName,
      customerEmail: body.customerEmail,
      description: body.description
    }

    console.log('🚀 Creating direct mobile loan payment...')
    
    // Process direct payment
    const result = await loanhubPesapalService.processLoanPayment(paymentData)
    
    if (result.error) {
      console.error('❌ Direct loan payment failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error,
        loanReference
      }, { status: 500 })
    }

    console.log('✅ Direct loan payment created successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Direct loan payment URL created successfully',
      data: {
        orderTrackingId: result.order_tracking_id,
        redirectUrl: result.redirect_url,
        loanReference: result.loan_reference,
        paymentMethod: result.payment_method,
        mobileOptimized: result.mobile_optimized,
        amount: paymentData.loanAmount,
        currency: 'KES',
        status: 'PENDING',
        directPayment: true
      }
    })

  } catch (error: any) {
    console.error('❌ Direct loan payment API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

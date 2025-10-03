// Payment Callback Handler
// Handles payment completion callbacks from PesaPal

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    console.log('🔄 Payment callback received')
    
    const { searchParams } = new URL(req.url)
    const orderTrackingId = searchParams.get('OrderTrackingId')
    const orderMerchantReference = searchParams.get('OrderMerchantReference')
    
    console.log('✅ Payment callback received:', {
      orderTrackingId,
      orderMerchantReference,
      timestamp: new Date().toISOString()
    })

    // Redirect to success page with payment details
    const successUrl = `/loan-payment/success?orderTrackingId=${orderTrackingId}&merchantReference=${orderMerchantReference}`
    
    return NextResponse.redirect(new URL(successUrl, req.url))

  } catch (error: any) {
    console.error('❌ Payment callback error:', error)
    
    // Redirect to error page
    const errorUrl = `/loan-payment/error?error=${encodeURIComponent(error.message)}`
    return NextResponse.redirect(new URL(errorUrl, req.url))
  }
}

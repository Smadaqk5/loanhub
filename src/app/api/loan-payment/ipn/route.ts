// IPN (Instant Payment Notification) Handler
// Receives payment notifications from PesaPal for loan payments

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    console.log('📡 IPN notification received for loan payment')
    
    const { searchParams } = new URL(req.url)
    const orderTrackingId = searchParams.get('OrderTrackingId')
    const orderMerchantReference = searchParams.get('OrderMerchantReference')
    
    if (!orderTrackingId) {
      console.error('❌ IPN missing OrderTrackingId')
      return NextResponse.json({
        success: false,
        error: 'OrderTrackingId is required'
      }, { status: 400 })
    }

    console.log('✅ IPN received:', {
      orderTrackingId,
      orderMerchantReference,
      timestamp: new Date().toISOString()
    })

    // Here you would typically:
    // 1. Verify the IPN with PesaPal
    // 2. Update your loan database
    // 3. Send confirmation to customer
    // 4. Update loan balance
    // 5. Log the payment

    // For now, we'll just acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'IPN received successfully',
      data: {
        orderTrackingId,
        orderMerchantReference,
        timestamp: new Date().toISOString(),
        status: 'RECEIVED'
      }
    })

  } catch (error: any) {
    console.error('❌ IPN processing error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'IPN processing failed'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📡 POST IPN notification received for loan payment')
    
    const body = await req.json()
    const { OrderTrackingId, OrderMerchantReference, PaymentStatus } = body
    
    if (!OrderTrackingId) {
      console.error('❌ POST IPN missing OrderTrackingId')
      return NextResponse.json({
        success: false,
        error: 'OrderTrackingId is required'
      }, { status: 400 })
    }

    console.log('✅ POST IPN received:', {
      OrderTrackingId,
      OrderMerchantReference,
      PaymentStatus,
      timestamp: new Date().toISOString()
    })

    // Process the IPN notification
    // Update loan payment status in your database
    // Send notifications to customer
    // Update loan balance

    return NextResponse.json({
      success: true,
      message: 'POST IPN received successfully',
      data: {
        OrderTrackingId,
        OrderMerchantReference,
        PaymentStatus,
        timestamp: new Date().toISOString(),
        status: 'PROCESSED'
      }
    })

  } catch (error: any) {
    console.error('❌ POST IPN processing error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'POST IPN processing failed'
    }, { status: 500 })
  }
}

// Clean Payment API Routes
import { NextRequest, NextResponse } from 'next/server'
import { paymentServiceFactory } from '@/services/payment-service-factory'
import { PaymentRequest } from '@/types/payment'

// Initiate Payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { amount, phoneNumber, paymentMethod, description, customerName, customerEmail } = body
    
    if (!amount || !phoneNumber || !paymentMethod || !description) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: amount, phoneNumber, paymentMethod, description' 
        },
        { status: 400 }
      )
    }

    // Generate unique payment ID
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const paymentRequest: PaymentRequest = {
      id: paymentId,
      amount: parseFloat(amount),
      currency: 'KES',
      phoneNumber: phoneNumber,
      paymentMethod: paymentMethod,
      description: description,
      customerName: customerName,
      customerEmail: customerEmail,
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        timestamp: new Date().toISOString()
      }
    }

    // Initiate payment
    const result = await paymentServiceFactory.initiatePayment(paymentRequest)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment initiation failed' 
      },
      { status: 500 }
    )
  }
}

// Get Payment Status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderTrackingId = searchParams.get('orderTrackingId')
    
    if (!orderTrackingId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'orderTrackingId is required' 
        },
        { status: 400 }
      )
    }

    const status = await paymentServiceFactory.checkPaymentStatus(orderTrackingId)
    
    if (!status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      status: status
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Status check failed' 
      },
      { status: 500 }
    )
  }
}

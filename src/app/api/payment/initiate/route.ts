// API Route for Initiating Payments from Payment Pages
import { NextRequest, NextResponse } from 'next/server'
import { pesapalService } from '@/lib/pesapal-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      paymentId,
      orderTrackingId,
      amount,
      phoneNumber,
      paymentMethod,
      description,
      loanId,
      userId
    } = body

    // Validate required fields
    if (!paymentId || !amount || !phoneNumber || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initiate PesaPal payment
    const pesapalResponse = await pesapalService.initiateSTKPush({
      loanId: loanId || '',
      userId: userId || '',
      amount: parseFloat(amount),
      phoneNumber,
      paymentMethod,
      description: description || 'Payment via payment page'
    })

    if (pesapalResponse.success) {
      return NextResponse.json({
        success: true,
        paymentId,
        orderTrackingId: pesapalResponse.orderTrackingId,
        paymentUrl: pesapalResponse.redirectUrl,
        message: 'Payment initiated successfully'
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: pesapalResponse.error || 'Payment initiation failed' 
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

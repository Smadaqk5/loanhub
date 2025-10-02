import { NextRequest, NextResponse } from 'next/server'
import { PesapalService } from '@/lib/pesapal-service'

const pesapalService = new PesapalService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderTrackingId = searchParams.get('orderTrackingId')
    
    if (!orderTrackingId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order tracking ID is required' 
        },
        { status: 400 }
      )
    }
    
    // Check payment status using PesaPal service
    const status = await pesapalService.checkPaymentStatus(orderTrackingId)
    
    return NextResponse.json({ 
      success: true, 
      status: status 
    })
  } catch (error) {
    console.error('Failed to check payment status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check payment status' 
      },
      { status: 500 }
    )
  }
}

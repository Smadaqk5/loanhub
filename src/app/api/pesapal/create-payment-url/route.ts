import { NextRequest, NextResponse } from 'next/server'
import { PesapalService } from '@/lib/pesapal-service'

const pesapalService = new PesapalService()

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    // Create payment URL using PesaPal service
    const result = await pesapalService.createPaymentURL(orderData)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to create payment URL:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payment URL' 
      },
      { status: 500 }
    )
  }
}

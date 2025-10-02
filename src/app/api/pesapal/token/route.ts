import { NextRequest, NextResponse } from 'next/server'
import { PesapalService } from '@/lib/pesapal-service'

const pesapalService = new PesapalService()

export async function GET(request: NextRequest) {
  try {
    // Get access token from PesaPal
    const token = await pesapalService.getAccessToken()
    
    return NextResponse.json({ 
      success: true, 
      token: token 
    })
  } catch (error) {
    console.error('Failed to get PesaPal token:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get access token from PesaPal' 
      },
      { status: 500 }
    )
  }
}

// Test Authentication API Endpoint
// Tests PesaPal authentication for loan payments

import { NextRequest, NextResponse } from 'next/server'
import { loanhubPesapalService } from '@/lib/loanhub-pesapal-service'

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 Testing PesaPal authentication for loan payments...')
    
    const isAuthenticated = await loanhubPesapalService.testAuth()
    
    if (isAuthenticated) {
      const serviceInfo = loanhubPesapalService.getServiceInfo()
      
      return NextResponse.json({
        success: true,
        message: 'PesaPal authentication successful',
        data: {
          authenticated: true,
          service: serviceInfo.service,
          environment: serviceInfo.environment,
          baseUrl: serviceInfo.baseUrl,
          mobileOptimized: serviceInfo.mobileOptimized,
          supportedMethods: serviceInfo.supportedMethods,
          loanPaymentTypes: serviceInfo.loanPaymentTypes,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'PesaPal authentication failed',
        data: {
          authenticated: false,
          timestamp: new Date().toISOString()
        }
      }, { status: 401 })
    }

  } catch (error: any) {
    console.error('❌ Authentication test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Authentication test failed',
      data: {
        authenticated: false,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

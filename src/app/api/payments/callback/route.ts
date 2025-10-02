// Payment Callback Handler
import { NextRequest, NextResponse } from 'next/server'
import { PaymentCallback } from '@/types/payment'

export async function POST(request: NextRequest) {
  try {
    const callback: PaymentCallback = await request.json()
    
    console.log('Payment callback received:', JSON.stringify(callback, null, 2))

    const stkCallback = callback.Body?.stkCallback
    
    if (!stkCallback) {
      console.error('Invalid callback format')
      return NextResponse.json({ success: false, error: 'Invalid callback format' }, { status: 400 })
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback

    // Process the callback
    if (ResultCode === 0) {
      // Payment successful
      console.log('Payment successful:', {
        merchantRequestID: MerchantRequestID,
        checkoutRequestID: CheckoutRequestID,
        resultDesc: ResultDesc
      })

      // Extract payment details from metadata
      if (CallbackMetadata?.Item) {
        const metadata = CallbackMetadata.Item.reduce((acc, item) => {
          acc[item.Name] = item.Value
          return acc
        }, {} as Record<string, any>)

        console.log('Payment metadata:', metadata)
      }

      // Here you would typically:
      // 1. Update your database with payment confirmation
      // 2. Send confirmation emails/SMS
      // 3. Update order status
      // 4. Trigger any post-payment workflows

    } else {
      // Payment failed
      console.log('Payment failed:', {
        merchantRequestID: MerchantRequestID,
        checkoutRequestID: CheckoutRequestID,
        resultCode: ResultCode,
        resultDesc: ResultDesc
      })
    }

    // Always return success to PesaPal to acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: 'Callback processed successfully' 
    })

  } catch (error) {
    console.error('Callback processing error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Callback processing failed' 
      },
      { status: 500 }
    )
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Payment callback endpoint is active',
    timestamp: new Date().toISOString()
  })
}

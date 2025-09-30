// API Route for Individual Payment Pages
import { NextRequest, NextResponse } from 'next/server'
import { paymentPageGenerator } from '@/lib/payment-page-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // In a real application, you would fetch this from your database
    // For now, we'll create a mock payment data structure
    const mockPaymentData = {
      paymentId: paymentId,
      orderTrackingId: `ORDER_${paymentId}`,
      merchantReference: `MERCHANT_${paymentId}`,
      amount: 500.00,
      currency: 'KES',
      phoneNumber: '+254700000000',
      paymentMethod: 'mpesa' as const,
      description: 'Processing fee payment',
      loanId: 'LOAN_123',
      userId: 'USER_456',
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      paymentUrl: undefined
    }

    // Generate the payment page HTML
    const paymentPageHTML = paymentPageGenerator.generatePaymentPageHTML(mockPaymentData)
    
    // Return the HTML page
    return new NextResponse(paymentPageHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error generating payment page:', error)
    
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Error</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5; 
          }
          .error-container { 
            background: white; 
            padding: 40px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            max-width: 500px; 
            margin: 0 auto; 
          }
          .error-icon { 
            font-size: 48px; 
            color: #e74c3c; 
            margin-bottom: 20px; 
          }
          h1 { 
            color: #333; 
            margin-bottom: 20px; 
          }
          p { 
            color: #666; 
            margin-bottom: 30px; 
          }
          .btn { 
            background: #3498db; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
          }
          .btn:hover { 
            background: #2980b9; 
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <h1>Payment Error</h1>
          <p>There was an error loading your payment page. Please try again later.</p>
          <a href="/dashboard" class="btn">Back to Dashboard</a>
        </div>
      </body>
      </html>
      `,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html'
        }
      }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params
    const body = await request.json()
    
    // Handle payment updates
    if (body.action === 'update_status') {
      // Update payment status in your database
      // This is where you would update the payment status
      
      return NextResponse.json({
        success: true,
        message: 'Payment status updated successfully'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error handling payment update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

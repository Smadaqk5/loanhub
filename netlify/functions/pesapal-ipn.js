// Netlify Function for Pesapal IPN (Instant Payment Notification) handling
const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    }
  }

  try {
    const body = JSON.parse(event.body)
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = body

    if (!OrderTrackingId || !OrderMerchantReference) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required parameters' })
      }
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Database configuration missing' })
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update payment status in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('pesapal_merchant_reference', OrderMerchantReference)
      .single()

    if (paymentError || !payment) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Payment not found' })
      }
    }

    // Update payment with IPN data
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        pesapal_order_tracking_id: OrderTrackingId,
        ipn_received_at: new Date().toISOString(),
        raw_ipn_data: body
      })
      .eq('id', payment.id)

    if (updateError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to update payment' })
      }
    }

    // Update loan status if payment is for processing fee
    if (payment.loan_id) {
      const { error: loanError } = await supabase
        .from('loans')
        .update({
          status: 'processing_fee_paid',
          processing_fee_paid_at: new Date().toISOString()
        })
        .eq('id', payment.loan_id)

      if (loanError) {
        console.error('Failed to update loan status:', loanError)
      }
    }

    return {
      statusCode: 200,
      body: 'IPN received and processed'
    }

  } catch (error) {
    console.error('IPN processing error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}

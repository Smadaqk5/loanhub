const CryptoJS = require('crypto-js')

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    }
  }

  try {
    const body = JSON.parse(event.body)
    const { phoneNumber, amount, description, paymentMethod } = body

    // Validate required fields
    if (!phoneNumber || !amount || !description) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        })
      }
    }

    // Get Pesapal credentials from environment variables
    const baseUrl = process.env.NEXT_PUBLIC_PESAPAL_BASE_URL || 'https://www.pesapal.com/pesapalapi/api'
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET

    if (!consumerKey || !consumerSecret) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Pesapal credentials not configured' 
        })
      }
    }

    // Step 1: Get OAuth access token
    const tokenResponse = await fetch(`${baseUrl}/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.token

    // Step 2: Initiate STK Push
    const merchantReference = `PROC_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    
    const stkPushData = {
      id: merchantReference,
      currency: 'KES',
      amount: amount,
      description: description,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
      notification_id: merchantReference,
      billing_address: {
        phone_number: phoneNumber,
        email_address: 'user@example.com',
        country_code: 'KE',
        first_name: 'User',
        middle_name: '',
        last_name: 'Name',
        line_1: 'Nairobi',
        line_2: '',
        city: 'Nairobi',
        state: 'Nairobi',
        postal_code: '00100',
        zip_code: '00100',
      },
    }

    const stkPushResponse = await fetch(`${baseUrl}/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(stkPushData),
    })

    if (!stkPushResponse.ok) {
      const errorText = await stkPushResponse.text()
      throw new Error(`STK Push failed: ${errorText}`)
    }

    const stkPushResult = await stkPushResponse.json()

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        paymentId: stkPushResult.order_tracking_id,
        orderTrackingId: stkPushResult.order_tracking_id,
        merchantReference: merchantReference,
        message: 'STK Push initiated successfully',
      })
    }

  } catch (error) {
    console.error('STK Push error:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'STK Push failed',
      })
    }
  }
}

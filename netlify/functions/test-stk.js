exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'STK Push test function is working',
      environment: {
        hasConsumerKey: !!process.env.PESAPAL_CONSUMER_KEY,
        hasConsumerSecret: !!process.env.PESAPAL_CONSUMER_SECRET,
        baseUrl: process.env.NEXT_PUBLIC_PESAPAL_BASE_URL,
        siteUrl: process.env.NEXT_PUBLIC_BASE_URL
      },
      timestamp: new Date().toISOString()
    })
  }
}

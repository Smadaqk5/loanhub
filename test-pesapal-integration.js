// Test script for Pesapal integration
// Run with: node test-pesapal-integration.js

const https = require('https');

// Test credentials
const CONSUMER_KEY = 'k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx';
const CONSUMER_SECRET = 'Tjg4VodFyn1ur9aDMo1fsJvgHQQ=';
const BASE_URL = 'https://cybqa.pesapal.com/pesapalv3/api';

async function testPesapalConnection() {
  console.log('🧪 Testing Pesapal API Connection...\n');
  
  try {
    // Test 1: Get Access Token
    console.log('1️⃣ Testing Access Token Request...');
    const tokenResult = await getAccessToken();
    
    if (tokenResult.success) {
      console.log('✅ Access Token Retrieved Successfully');
      console.log(`   Token: ${tokenResult.token.substring(0, 20)}...`);
      
      // Test 2: Test STK Push (if token is valid)
      console.log('\n2️⃣ Testing STK Push Request...');
      const stkResult = await testSTKPush(tokenResult.token);
      
      if (stkResult.success) {
        console.log('✅ STK Push Request Successful');
        console.log(`   Order Tracking ID: ${stkResult.orderTrackingId}`);
      } else {
        console.log('❌ STK Push Request Failed');
        console.log(`   Error: ${stkResult.error}`);
      }
    } else {
      console.log('❌ Access Token Request Failed');
      console.log(`   Error: ${tokenResult.error}`);
    }
    
  } catch (error) {
    console.log('❌ Test Failed with Error:');
    console.log(error.message);
  }
}

async function getAccessToken() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET
    });

    const options = {
      hostname: 'cybqa.pesapal.com',
      port: 443,
      path: '/pesapalv3/api/Auth/RequestToken',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status Code: ${res.statusCode}`);
        console.log(`   Response: ${data}`);
        
        try {
          const response = JSON.parse(data);
          if (response.token) {
            resolve({ success: true, token: response.token });
          } else {
            resolve({ success: false, error: response.message || 'No token received' });
          }
        } catch (error) {
          resolve({ success: false, error: `Invalid JSON response: ${data}` });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

async function testSTKPush(accessToken) {
  return new Promise((resolve) => {
    const stkData = {
      id: `TEST_${Date.now()}`,
      currency: 'KES',
      amount: 1,
      description: 'Test Payment',
      callback_url: 'https://your-site.netlify.app/pesapal/callback',
      notification_id: 'TEST_NOTIFICATION',
      billing_address: {
        phone_number: '+254700000000',
        email_address: 'test@example.com',
        country_code: 'KE'
      }
    };

    const postData = JSON.stringify(stkData);

    const options = {
      hostname: 'cybqa.pesapal.com',
      port: 443,
      path: '/pesapalv3/api/Transactions/SubmitOrderRequest',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.order_tracking_id) {
            resolve({ success: true, orderTrackingId: response.order_tracking_id });
          } else {
            resolve({ success: false, error: response.message || 'STK Push failed' });
          }
        } catch (error) {
          resolve({ success: false, error: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
testPesapalConnection();

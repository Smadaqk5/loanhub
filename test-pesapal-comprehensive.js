// Comprehensive Pesapal API test
// Tests different endpoints and authentication methods

const https = require('https');

// Test credentials
const CONSUMER_KEY = 'k7N/1b+DE4Ewgb0fjrGS7q1YwT0+w5Qx';
const CONSUMER_SECRET = 'Tjg4VodFyn1ur9aDMo1fsJvgHQQ=';

// Different possible base URLs
const BASE_URLS = [
  'https://cybqa.pesapal.com/pesapalv3/api',
  'https://demo.pesapal.com/pesapalv3/api',
  'https://api.pesapal.com/pesapalv3/api',
  'https://cybqa.pesapal.com/api',
  'https://demo.pesapal.com/api'
];

async function testAllEndpoints() {
  console.log('🧪 Comprehensive Pesapal API Test\n');
  console.log(`Testing with credentials:`);
  console.log(`Consumer Key: ${CONSUMER_KEY}`);
  console.log(`Consumer Secret: ${CONSUMER_SECRET}\n`);

  for (let i = 0; i < BASE_URLS.length; i++) {
    const baseUrl = BASE_URLS[i];
    console.log(`\n${i + 1}️⃣ Testing Base URL: ${baseUrl}`);
    
    try {
      const result = await testEndpoint(baseUrl);
      if (result.success) {
        console.log('✅ SUCCESS! This endpoint works');
        console.log(`   Token: ${result.token.substring(0, 30)}...`);
        return { success: true, workingUrl: baseUrl, token: result.token };
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n❌ No working endpoints found. Possible issues:');
  console.log('   - Credentials may be invalid or not activated');
  console.log('   - API endpoints may have changed');
  console.log('   - Network connectivity issues');
  console.log('   - Credentials may be for a different environment');
  
  return { success: false };
}

async function testEndpoint(baseUrl) {
  return new Promise((resolve) => {
    const url = new URL(baseUrl);
    
    // Try different authentication endpoints
    const endpoints = [
      '/Auth/RequestToken',
      '/api/Auth/RequestToken',
      '/Auth/RequestToken',
      '/token',
      '/oauth/token'
    ];

    let currentEndpointIndex = 0;

    function tryNextEndpoint() {
      if (currentEndpointIndex >= endpoints.length) {
        resolve({ success: false, error: 'All endpoints failed' });
        return;
      }

      const endpoint = endpoints[currentEndpointIndex];
      const fullUrl = `${baseUrl}${endpoint}`;
      
      console.log(`   Trying: ${fullUrl}`);

      const postData = JSON.stringify({
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET
      });

      const options = {
        hostname: url.hostname,
        port: 443,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response: ${data.substring(0, 200)}...`);
          
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(data);
              if (response.token) {
                resolve({ success: true, token: response.token });
                return;
              } else if (response.access_token) {
                resolve({ success: true, token: response.access_token });
                return;
              }
            } catch (error) {
              // Not JSON, try next endpoint
            }
          }
          
          // Try next endpoint
          currentEndpointIndex++;
          setTimeout(tryNextEndpoint, 1000);
        });
      });

      req.on('error', (error) => {
        console.log(`   Network Error: ${error.message}`);
        currentEndpointIndex++;
        setTimeout(tryNextEndpoint, 1000);
      });

      req.write(postData);
      req.end();
    }

    tryNextEndpoint();
  });
}

// Test credential validation
async function testCredentialValidation() {
  console.log('\n🔍 Testing Credential Validation...');
  
  // Check if credentials look valid
  if (!CONSUMER_KEY || CONSUMER_KEY.length < 10) {
    console.log('❌ Consumer Key appears invalid (too short)');
    return false;
  }
  
  if (!CONSUMER_SECRET || CONSUMER_SECRET.length < 10) {
    console.log('❌ Consumer Secret appears invalid (too short)');
    return false;
  }
  
  console.log('✅ Credentials appear to be in correct format');
  return true;
}

// Main test function
async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Pesapal API Test\n');
  
  // Test credential format
  const credentialsValid = await testCredentialValidation();
  if (!credentialsValid) {
    return;
  }
  
  // Test all endpoints
  const result = await testAllEndpoints();
  
  if (result.success) {
    console.log('\n🎉 SUCCESS! Found working endpoint:');
    console.log(`   URL: ${result.workingUrl}`);
    console.log(`   Token: ${result.token.substring(0, 50)}...`);
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Update your service with the working URL');
    console.log('   2. Test STK push functionality');
    console.log('   3. Test URL-based payments');
    console.log('   4. Deploy to production');
  } else {
    console.log('\n❌ No working endpoints found.');
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('   1. Verify credentials with Pesapal support');
    console.log('   2. Check if account is activated');
    console.log('   3. Confirm you have the correct environment');
    console.log('   4. Contact Pesapal for API documentation');
  }
}

// Run the test
runComprehensiveTest();

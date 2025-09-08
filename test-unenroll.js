const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testUnenrollment() {
  try {
    console.log('Testing unenrollment API...');
    
    const testData = {
      courseId: '3f7f960d-4828-43f2-9509-5a3dadb7eb63',
      userId: 'student_1757322725.106448_test'
    };
    
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    // Test with DELETE method
    console.log('\n1. Testing DELETE method...');
    const deleteResult = await makeRequest('http://localhost:3001/api/courses/unenroll', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log('DELETE Status:', deleteResult.status);
    console.log('DELETE Response:', deleteResult.data);
    
    // Test with POST method (as backup)
    console.log('\n2. Testing POST method...');
    const postResult = await makeRequest('http://localhost:3001/api/courses/unenroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log('POST Status:', postResult.status);
    console.log('POST Response:', postResult.data);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testUnenrollment();

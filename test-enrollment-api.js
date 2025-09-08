const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:3001';

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

async function testEnrollmentAPI() {
  console.log('🧪 Testing Course Enrollment API Endpoints\n');

  try {
    // Test data
    const testUserId = 'student_1757322725.106448_test'; // From our previous test
    const testCourseId = '3f7f960d-4828-43f2-9509-5a3dadb7eb63'; // Software Engineering course

    // 1. Test enrollment endpoint
    console.log('1. Testing enrollment endpoint...');
    const enrollResponse = await makeRequest(`${API_BASE}/api/courses/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: testCourseId,
        userId: testUserId
      })
    });

    console.log('Enrollment response status:', enrollResponse.status);
    console.log('Enrollment result:', enrollResponse.data);

    // 2. Test fetching enrolled courses
    console.log('\n2. Testing enrolled courses endpoint...');
    const enrolledResponse = await makeRequest(`${API_BASE}/api/courses/enrolled?userId=${testUserId}`);

    console.log('Enrolled courses response status:', enrolledResponse.status);
    console.log('Enrolled courses result:', enrolledResponse.data);

    // 3. Test unenrollment endpoint
    console.log('\n3. Testing unenrollment endpoint...');
    const unenrollResponse = await makeRequest(`${API_BASE}/api/courses/unenroll`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: testCourseId,
        userId: testUserId
      })
    });

    console.log('Unenrollment response status:', unenrollResponse.status);
    console.log('Unenrollment result:', unenrollResponse.data);

    // 4. Test fetching enrolled courses again (should be empty or fewer)
    console.log('\n4. Testing enrolled courses after unenrollment...');
    const enrolledAfterResponse = await makeRequest(`${API_BASE}/api/courses/enrolled?userId=${testUserId}`);

    console.log('Enrolled courses after unenrollment status:', enrolledAfterResponse.status);
    console.log('Enrolled courses after unenrollment:', enrolledAfterResponse.data);

    console.log('\n🎉 API test completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testEnrollmentAPI();

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testAPI(endpoint, options = {}) {
  try {
    console.log(`\n🔍 Testing: ${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`❌ API test failed for ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testEnrollmentFlow() {
  console.log('🚀 Testing Enrollment API Flow\n');
  
  // 1. Test getting all courses
  console.log('=== Step 1: Get Available Courses ===');
  const coursesResult = await testAPI('/api/courses/all');
  
  if (!coursesResult.success || !coursesResult.data || coursesResult.data.length === 0) {
    console.log('❌ Cannot proceed without courses');
    return;
  }
  
  const testCourse = coursesResult.data[0];
  console.log(`✅ Using test course: ${testCourse.title} (${testCourse.id})`);
  
  // 2. Test enrollment
  console.log('\n=== Step 2: Test Enrollment ===');
  const enrollResult = await testAPI('/api/courses/enroll', {
    method: 'POST',
    body: JSON.stringify({
      courseId: testCourse.id,
      userId: `api_test_user_${Date.now()}`
    })
  });
  
  if (!enrollResult.success) {
    console.log('❌ Enrollment failed');
    return;
  }
  
  console.log('✅ Enrollment successful!');
  
  // 3. Test getting enrolled courses
  console.log('\n=== Step 3: Get Enrolled Courses ===');
  const enrolledResult = await testAPI('/api/courses/enrolled?userId=api_test_user_default');
  
  if (enrolledResult.success) {
    console.log(`✅ Found ${enrolledResult.data.length} enrolled courses`);
  }
  
  // 4. Test duplicate enrollment
  console.log('\n=== Step 4: Test Duplicate Enrollment ===');
  const duplicateResult = await testAPI('/api/courses/enroll', {
    method: 'POST',
    body: JSON.stringify({
      courseId: testCourse.id,
      userId: `api_test_user_${Date.now() - 1000}` // Use same user as before
    })
  });
  
  console.log('Duplicate enrollment result:', duplicateResult.status);
  
  console.log('\n✅ API enrollment flow test completed!');
}

async function checkServerStatus() {
  try {
    const response = await fetch(`${BASE_URL}/api/courses/all`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('Checking if server is running...');
  
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:3000');
    console.log('Please start the development server with: npm run dev');
    return;
  }
  
  console.log('✅ Server is running');
  await testEnrollmentFlow();
}

main().catch(console.error);

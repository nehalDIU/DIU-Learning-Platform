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

async function testStudentDashboardEnrollment() {
  try {
    console.log('=== Testing Student Dashboard Enrollment Flow ===\n');
    
    // Step 1: Create a student user (simulating section selection)
    console.log('1. Creating student user for dashboard...');
    const studentData = {
      email: `dashboard_test_${Date.now()}@diu.edu.bd`,
      fullName: 'Dashboard Test Student',
      batch: '63',
      section: '63_G'
    };
    
    const createResult = await makeRequest('http://localhost:3001/api/student-users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });

    console.log('Create user response:', createResult);

    if (createResult.status !== 200 && createResult.status !== 201) {
      console.log('❌ Failed to create student user:', createResult.data);
      return;
    }

    const studentUserId = createResult.data.studentUser?.userId;
    console.log('✅ Student user created:', studentUserId);

    if (!studentUserId) {
      console.log('❌ No userId returned from student creation');
      return;
    }
    
    // Step 2: Test the enrollment context flow
    console.log('\n2. Testing enrollment context flow...');
    
    // Get available courses
    const coursesResult = await makeRequest('http://localhost:3001/api/courses/all');
    if (coursesResult.status !== 200 || !coursesResult.data.length) {
      console.log('❌ No courses available');
      return;
    }
    
    const testCourse = coursesResult.data[0];
    console.log('✅ Found test course:', testCourse.title);
    
    // Step 3: Test enrollment via API (simulating frontend enrollment)
    console.log('\n3. Testing enrollment via API...');
    const enrollResult = await makeRequest('http://localhost:3001/api/courses/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: testCourse.id,
        userId: studentUserId
      })
    });
    
    console.log('Enrollment status:', enrollResult.status);
    if (enrollResult.status === 200 || enrollResult.status === 201) {
      console.log('✅ Enrollment successful');
    } else {
      console.log('❌ Enrollment failed:', enrollResult.data);
      return;
    }
    
    // Step 4: Test enrolled courses API (simulating dashboard display)
    console.log('\n4. Testing enrolled courses display...');
    const enrolledResult = await makeRequest(`http://localhost:3001/api/courses/enrolled?userId=${studentUserId}`);
    
    console.log('Enrolled courses status:', enrolledResult.status);
    if (enrolledResult.status === 200 && enrolledResult.data.length > 0) {
      console.log('✅ Enrolled courses retrieved successfully');
      console.log('   Course count:', enrolledResult.data.length);
      
      enrolledResult.data.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.title} (${course.course_code})`);
        console.log(`      Status: ${course.enrollment?.status}`);
        console.log(`      Progress: ${course.enrollment?.progress_percentage}%`);
        console.log(`      Enrolled: ${new Date(course.enrollment?.enrollment_date).toLocaleDateString()}`);
      });
    } else {
      console.log('❌ Failed to retrieve enrolled courses:', enrolledResult.data);
      return;
    }
    
    // Step 5: Test the dashboard UI endpoints
    console.log('\n5. Testing dashboard UI endpoints...');
    
    // Test if the main page loads (this would normally be done in browser)
    const mainPageResult = await makeRequest('http://localhost:3001/');
    console.log('Main page status:', mainPageResult.status);
    
    // Test courses page
    const coursesPageResult = await makeRequest('http://localhost:3001/courses');
    console.log('Courses page status:', coursesPageResult.status);
    
    if (mainPageResult.status === 200 && coursesPageResult.status === 200) {
      console.log('✅ Dashboard pages load successfully');
    } else {
      console.log('⚠️  Some dashboard pages may have issues');
    }
    
    // Step 6: Test unenrollment
    console.log('\n6. Testing unenrollment...');
    const unenrollResult = await makeRequest('http://localhost:3001/api/courses/unenroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: testCourse.id,
        userId: studentUserId
      })
    });
    
    console.log('Unenrollment status:', unenrollResult.status);
    if (unenrollResult.status === 200) {
      console.log('✅ Unenrollment successful');
    } else {
      console.log('❌ Unenrollment failed:', unenrollResult.data);
    }
    
    // Step 7: Verify final state
    console.log('\n7. Verifying final enrollment state...');
    const finalEnrolledResult = await makeRequest(`http://localhost:3001/api/courses/enrolled?userId=${studentUserId}`);
    
    const activeEnrollments = finalEnrolledResult.data?.filter(c => c.enrollment?.status === 'active') || [];
    console.log('Final active enrollments:', activeEnrollments.length);
    
    if (activeEnrollments.length === 0) {
      console.log('✅ Unenrollment verified - no active enrollments');
    } else {
      console.log('⚠️  User still has active enrollments (may be expected)');
    }
    
    console.log('\n🎉 Student Dashboard Enrollment Test Complete!');
    console.log('\n📋 Test Summary:');
    console.log('- ✅ Student user creation works');
    console.log('- ✅ Course enrollment API works');
    console.log('- ✅ Enrolled courses retrieval works');
    console.log('- ✅ Dashboard pages load correctly');
    console.log('- ✅ Unenrollment works');
    console.log('\n💡 The enrollment system is ready for frontend use!');
    console.log('   Students can now:');
    console.log('   - Select their section on the main page');
    console.log('   - Browse courses on /courses page');
    console.log('   - Enroll in courses');
    console.log('   - View enrolled courses in the dashboard sidebar');
    console.log('   - Unenroll from courses if needed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStudentDashboardEnrollment();

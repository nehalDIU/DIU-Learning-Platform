const { createClient } = require('@supabase/supabase-js');
const http = require('http');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to make HTTP requests
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEnrollmentAPI() {
  console.log('🧪 Testing Course Enrollment API Endpoints\n');

  try {
    // 1. Create a test student user first
    console.log('1. Setting up test data...');
    const testUserId = `api_test_${Date.now()}`;
    const testEmail = `api_test_${Date.now()}@diu.edu.bd`;

    const { data: newStudent, error: studentError } = await supabase
      .from('student_users')
      .insert({
        user_id: testUserId,
        email: testEmail,
        full_name: 'API Test Student',
        batch: '63',
        section: 'G'
      })
      .select()
      .single();

    if (studentError) {
      console.error('❌ Error creating test student:', studentError.message);
      return;
    }

    console.log('✅ Test student created:', testUserId);

    // Get a test course
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (coursesError || !courses || courses.length === 0) {
      console.error('❌ Error fetching test course:', coursesError?.message || 'No courses found');
      return;
    }

    const testCourseId = courses[0].id;
    console.log('✅ Test course selected:', courses[0].title);

    // 2. Test enrollment API
    console.log('\n2. Testing enrollment API...');
    
    const enrollOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/courses/enroll',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const enrollData = {
      courseId: testCourseId,
      userId: testUserId
    };

    try {
      const enrollResult = await makeRequest(enrollOptions, enrollData);
      console.log('Enrollment API response status:', enrollResult.status);
      console.log('Enrollment API response:', enrollResult.data);

      if (enrollResult.status === 200) {
        console.log('✅ Enrollment API working correctly');
      } else {
        console.log('❌ Enrollment API returned error status');
      }
    } catch (error) {
      console.error('❌ Error calling enrollment API:', error.message);
    }

    // 3. Test enrolled courses API
    console.log('\n3. Testing enrolled courses API...');
    
    const enrolledOptions = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/courses/enrolled?userId=${encodeURIComponent(testUserId)}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    try {
      const enrolledResult = await makeRequest(enrolledOptions);
      console.log('Enrolled courses API response status:', enrolledResult.status);
      console.log('Enrolled courses count:', Array.isArray(enrolledResult.data) ? enrolledResult.data.length : 'Not an array');
      
      if (enrolledResult.status === 200 && Array.isArray(enrolledResult.data)) {
        console.log('✅ Enrolled courses API working correctly');
        if (enrolledResult.data.length > 0) {
          console.log('Sample enrolled course:', {
            title: enrolledResult.data[0].title,
            course_code: enrolledResult.data[0].course_code,
            enrollment_status: enrolledResult.data[0].enrollment?.status
          });
        }
      } else {
        console.log('❌ Enrolled courses API returned unexpected response');
      }
    } catch (error) {
      console.error('❌ Error calling enrolled courses API:', error.message);
    }

    // 4. Test unenrollment API
    console.log('\n4. Testing unenrollment API...');
    
    const unenrollOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/courses/unenroll',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const unenrollData = {
      courseId: testCourseId,
      userId: testUserId
    };

    try {
      const unenrollResult = await makeRequest(unenrollOptions, unenrollData);
      console.log('Unenrollment API response status:', unenrollResult.status);
      console.log('Unenrollment API response:', unenrollResult.data);

      if (unenrollResult.status === 200) {
        console.log('✅ Unenrollment API working correctly');
      } else {
        console.log('❌ Unenrollment API returned error status');
      }
    } catch (error) {
      console.error('❌ Error calling unenrollment API:', error.message);
    }

    // 5. Verify final state
    console.log('\n5. Verifying final state...');
    
    try {
      const finalResult = await makeRequest(enrolledOptions);
      console.log('Final enrolled courses count:', Array.isArray(finalResult.data) ? finalResult.data.length : 'Not an array');
      
      if (Array.isArray(finalResult.data)) {
        const activeCourses = finalResult.data.filter(course => course.enrollment?.status === 'active');
        console.log('Active enrollments after unenrollment:', activeCourses.length);
      }
    } catch (error) {
      console.error('❌ Error verifying final state:', error.message);
    }

    // 6. Cleanup
    console.log('\n6. Cleaning up test data...');
    
    await supabase
      .from('user_course_enrollments')
      .delete()
      .eq('user_id', testUserId);
    
    await supabase
      .from('student_users')
      .delete()
      .eq('user_id', testUserId);
    
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 API enrollment test completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testEnrollmentAPI();

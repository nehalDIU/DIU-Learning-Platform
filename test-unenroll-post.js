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
        console.log('Raw response body:', body);
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
      const jsonData = JSON.stringify(data);
      console.log('Sending data:', jsonData);
      req.write(jsonData);
    }
    req.end();
  });
}

async function testUnenrollmentWithPost() {
  console.log('🧪 Testing Unenrollment API with POST method\n');

  try {
    // 1. Create test enrollment
    console.log('1. Setting up test enrollment...');
    const testUserId = `post_unenroll_test_${Date.now()}`;
    
    // Create student
    const { data: newStudent, error: studentError } = await supabase
      .from('student_users')
      .insert({
        user_id: testUserId,
        email: `${testUserId}@diu.edu.bd`,
        full_name: 'POST Unenroll Test Student',
        batch: '63',
        section: 'G'
      })
      .select()
      .single();

    if (studentError) {
      console.error('❌ Error creating test student:', studentError.message);
      return;
    }

    // Get a course
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

    // Create enrollment directly in database
    const { data: enrollment, error: enrollError } = await supabase
      .from('user_course_enrollments')
      .insert({
        user_id: testUserId,
        course_id: testCourseId,
        status: 'active',
        progress_percentage: 25
      })
      .select()
      .single();

    if (enrollError) {
      console.error('❌ Error creating enrollment:', enrollError.message);
      return;
    }

    console.log('✅ Test enrollment created:', enrollment.id);

    // 2. Test unenrollment API with POST method
    console.log('\n2. Testing unenrollment API with POST method...');
    
    const unenrollOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/courses/unenroll',
      method: 'POST', // Using POST instead of DELETE
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const unenrollData = {
      courseId: testCourseId,
      userId: testUserId
    };

    console.log('Request options:', unenrollOptions);
    console.log('Request data:', unenrollData);

    try {
      const unenrollResult = await makeRequest(unenrollOptions, unenrollData);
      console.log('Unenrollment API response status:', unenrollResult.status);
      console.log('Unenrollment API response data:', unenrollResult.data);

      if (unenrollResult.status === 200) {
        console.log('✅ Unenrollment API working correctly with POST');
      } else {
        console.log('❌ Unenrollment API returned error status');
      }
    } catch (error) {
      console.error('❌ Error calling unenrollment API:', error.message);
    }

    // 3. Check enrollment status in database
    console.log('\n3. Checking enrollment status in database...');
    const { data: updatedEnrollment, error: checkError } = await supabase
      .from('user_course_enrollments')
      .select('*')
      .eq('id', enrollment.id)
      .single();

    if (checkError) {
      console.error('❌ Error checking enrollment:', checkError.message);
    } else {
      console.log('Current enrollment status:', {
        id: updatedEnrollment.id,
        status: updatedEnrollment.status,
        updated_at: updatedEnrollment.updated_at
      });
    }

    // 4. Now test with DELETE method
    console.log('\n4. Testing with DELETE method...');
    
    // First create another enrollment to test DELETE
    const { data: enrollment2, error: enrollError2 } = await supabase
      .from('user_course_enrollments')
      .insert({
        user_id: testUserId,
        course_id: testCourseId,
        status: 'active',
        progress_percentage: 50
      })
      .select()
      .single();

    if (enrollError2) {
      console.error('❌ Error creating second enrollment:', enrollError2.message);
    } else {
      console.log('✅ Second test enrollment created:', enrollment2.id);

      const deleteOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/courses/unenroll',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      try {
        const deleteResult = await makeRequest(deleteOptions, unenrollData);
        console.log('DELETE method response status:', deleteResult.status);
        console.log('DELETE method response data:', deleteResult.data);
      } catch (error) {
        console.error('❌ Error with DELETE method:', error.message);
      }
    }

    // 5. Cleanup
    console.log('\n5. Cleaning up...');
    await supabase.from('user_course_enrollments').delete().eq('user_id', testUserId);
    await supabase.from('student_users').delete().eq('user_id', testUserId);
    console.log('✅ Cleanup completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUnenrollmentWithPost();

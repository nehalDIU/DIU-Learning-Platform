const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStudentEnrollmentFlow() {
  console.log('🧪 Testing Complete Student Enrollment Flow\n');

  try {
    // 1. Create a test student user (simulating the section selection process)
    console.log('1. Creating test student user...');
    const testEmail = `test_student_${Date.now()}@diu.edu.bd`;
    const testUserId = `student_${Date.now()}_test`;
    
    const { data: newStudent, error: studentError } = await supabase
      .from('student_users')
      .insert({
        user_id: testUserId,
        email: testEmail,
        full_name: 'Test Student',
        batch: '63',
        section: 'G',
        has_skipped_selection: false
      })
      .select()
      .single();

    if (studentError) {
      console.error('❌ Error creating student:', studentError.message);
      return;
    }

    console.log('✅ Student created successfully:', {
      id: newStudent.id,
      user_id: newStudent.user_id,
      email: newStudent.email,
      full_name: newStudent.full_name
    });

    // 2. Get available courses
    console.log('\n2. Fetching available courses...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .limit(3);

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError.message);
      return;
    }

    console.log(`✅ Found ${courses?.length || 0} available courses`);
    if (courses && courses.length > 0) {
      courses.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.title} (${course.course_code})`);
      });
    }

    // 3. Test enrollment in multiple courses
    console.log('\n3. Testing course enrollments...');
    const enrollmentResults = [];

    for (const course of courses.slice(0, 2)) { // Enroll in first 2 courses
      console.log(`\n   Enrolling in: ${course.title}`);
      
      const { data: enrollment, error: enrollError } = await supabase
        .from('user_course_enrollments')
        .insert({
          user_id: testUserId,
          course_id: course.id,
          status: 'active',
          progress_percentage: Math.floor(Math.random() * 50), // Random progress for testing
          enrollment_date: new Date().toISOString()
        })
        .select()
        .single();

      if (enrollError) {
        console.error(`   ❌ Error enrolling in ${course.title}:`, enrollError.message);
      } else {
        console.log(`   ✅ Successfully enrolled in ${course.title}`);
        enrollmentResults.push({
          course: course.title,
          enrollment: enrollment
        });
      }
    }

    // 4. Verify enrollments by fetching enrolled courses
    console.log('\n4. Verifying enrollments...');
    const { data: enrolledCourses, error: fetchError } = await supabase
      .from('user_course_enrollments')
      .select(`
        id,
        status,
        progress_percentage,
        enrollment_date,
        course:courses (
          id,
          title,
          course_code,
          teacher_name
        )
      `)
      .eq('user_id', testUserId)
      .eq('status', 'active');

    if (fetchError) {
      console.error('❌ Error fetching enrolled courses:', fetchError.message);
    } else {
      console.log(`✅ Student is enrolled in ${enrolledCourses?.length || 0} courses:`);
      enrolledCourses?.forEach((enrollment, index) => {
        console.log(`   ${index + 1}. ${enrollment.course.title} (${enrollment.course.course_code})`);
        console.log(`      Progress: ${enrollment.progress_percentage}%`);
        console.log(`      Enrolled: ${new Date(enrollment.enrollment_date).toLocaleDateString()}`);
      });
    }

    // 5. Test unenrollment
    if (enrolledCourses && enrolledCourses.length > 0) {
      console.log('\n5. Testing unenrollment...');
      const firstEnrollment = enrolledCourses[0];
      
      const { data: unenrollResult, error: unenrollError } = await supabase
        .from('user_course_enrollments')
        .update({
          status: 'dropped',
          updated_at: new Date().toISOString()
        })
        .eq('id', firstEnrollment.id)
        .select()
        .single();

      if (unenrollError) {
        console.error('❌ Error unenrolling:', unenrollError.message);
      } else {
        console.log(`✅ Successfully unenrolled from ${firstEnrollment.course.title}`);
        console.log(`   Status changed to: ${unenrollResult.status}`);
      }
    }

    // 6. Final verification
    console.log('\n6. Final verification...');
    const { data: finalEnrollments, error: finalError } = await supabase
      .from('user_course_enrollments')
      .select(`
        id,
        status,
        course:courses (title)
      `)
      .eq('user_id', testUserId);

    if (finalError) {
      console.error('❌ Error in final verification:', finalError.message);
    } else {
      console.log('Final enrollment status:');
      finalEnrollments?.forEach((enrollment) => {
        console.log(`   - ${enrollment.course.title}: ${enrollment.status}`);
      });
    }

    // 7. Cleanup (optional - comment out if you want to keep test data)
    console.log('\n7. Cleaning up test data...');
    
    // Delete enrollments
    await supabase
      .from('user_course_enrollments')
      .delete()
      .eq('user_id', testUserId);
    
    // Delete student user
    await supabase
      .from('student_users')
      .delete()
      .eq('user_id', testUserId);
    
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Student enrollment flow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStudentEnrollmentFlow();

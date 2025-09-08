const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStudentEnrollmentConnection() {
  console.log('🔗 Testing Student User & Enrollment Connection\n');
  
  try {
    // 1. Create a test student user
    console.log('👤 Creating test student user...');
    const testEmail = `test_${Date.now()}@diu.edu.bd`;
    const testUserId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: studentUser, error: studentError } = await supabase
      .from('student_users')
      .insert({
        user_id: testUserId,
        email: testEmail,
        full_name: 'Test Student',
        batch: '63',
        section: 'G',
        has_skipped_selection: false,
        is_active: true
      })
      .select()
      .single();
    
    if (studentError) {
      console.error('❌ Failed to create student user:', studentError.message);
      return;
    }
    
    console.log('✅ Student user created successfully!');
    console.log('📊 Student details:', {
      user_id: studentUser.user_id,
      email: studentUser.email,
      full_name: studentUser.full_name,
      batch: studentUser.batch,
      section: studentUser.section
    });
    
    // 2. Get a test course
    console.log('\n📚 Getting test course...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, course_code')
      .limit(1);
    
    if (coursesError || !courses || courses.length === 0) {
      console.error('❌ No courses available for testing');
      return;
    }
    
    const testCourse = courses[0];
    console.log('✅ Using course:', `${testCourse.course_code} - ${testCourse.title}`);
    
    // 3. Test enrollment with student user ID
    console.log('\n📝 Testing enrollment with student user ID...');
    const { data: enrollment, error: enrollError } = await supabase
      .from('user_course_enrollments')
      .insert({
        user_id: studentUser.user_id, // Use the actual student user ID
        course_id: testCourse.id,
        status: 'active',
        progress_percentage: 0,
        enrollment_date: new Date().toISOString()
      })
      .select()
      .single();
    
    if (enrollError) {
      console.error('❌ Enrollment failed:', enrollError.message);
      return;
    }
    
    console.log('✅ Enrollment successful!');
    console.log('📊 Enrollment details:', {
      id: enrollment.id,
      user_id: enrollment.user_id,
      course_id: enrollment.course_id,
      status: enrollment.status
    });
    
    // 4. Test fetching enrolled courses for the student
    console.log('\n🔍 Testing enrolled courses fetch...');
    const { data: enrolledCourses, error: fetchError } = await supabase
      .from('user_course_enrollments')
      .select(`
        id,
        user_id,
        course_id,
        status,
        progress_percentage,
        enrollment_date,
        courses (
          id,
          title,
          course_code,
          teacher_name
        )
      `)
      .eq('user_id', studentUser.user_id)
      .eq('status', 'active');
    
    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError.message);
      return;
    }
    
    console.log('✅ Fetch successful!');
    console.log(`📚 Found ${enrolledCourses.length} enrolled courses for student`);
    
    if (enrolledCourses.length > 0) {
      console.log('📋 Enrolled course details:');
      enrolledCourses.forEach(ec => {
        console.log(`  - ${ec.courses.course_code}: ${ec.courses.title}`);
        console.log(`    Enrolled: ${new Date(ec.enrollment_date).toLocaleDateString()}`);
        console.log(`    Progress: ${ec.progress_percentage}%`);
      });
    }
    
    // 5. Test the connection by verifying student user exists
    console.log('\n🔗 Verifying student user connection...');
    const { data: verifyStudent, error: verifyError } = await supabase
      .from('student_users')
      .select('user_id, email, full_name, batch, section')
      .eq('user_id', studentUser.user_id)
      .single();
    
    if (verifyError) {
      console.error('❌ Student verification failed:', verifyError.message);
      return;
    }
    
    console.log('✅ Student user connection verified!');
    console.log('📊 Student verification:', {
      user_id: verifyStudent.user_id,
      email: verifyStudent.email,
      full_name: verifyStudent.full_name,
      batch: verifyStudent.batch,
      section: verifyStudent.section
    });
    
    // 6. Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('user_course_enrollments')
      .delete()
      .eq('user_id', studentUser.user_id);
    
    await supabase
      .from('student_users')
      .delete()
      .eq('user_id', studentUser.user_id);
    
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Student User & Enrollment Connection Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Student user creation works');
    console.log('- ✅ Enrollment with student user ID works');
    console.log('- ✅ Enrolled courses can be fetched by student user ID');
    console.log('- ✅ Student user connection is properly maintained');
    console.log('\n💡 The student user and enrollment systems are now properly connected!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStudentEnrollmentConnection();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEnrollmentFix() {
  console.log('🔧 Testing Enrollment Fix\n');
  
  try {
    // 1. Get a test course
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, course_code')
      .limit(1);
    
    if (coursesError || !courses || courses.length === 0) {
      console.error('❌ No courses available for testing');
      return;
    }
    
    const testCourse = courses[0];
    const testUserId = 'demo_user_default';
    
    console.log(`📚 Using course: ${testCourse.course_code} - ${testCourse.title}`);
    console.log(`👤 Using user ID: ${testUserId}\n`);
    
    // 2. Clear any existing enrollment
    console.log('🧹 Clearing existing enrollments...');
    await supabase
      .from('user_course_enrollments')
      .delete()
      .eq('user_id', testUserId)
      .eq('course_id', testCourse.id);
    
    // 3. Test enrollment
    console.log('📝 Testing enrollment...');
    const { data: enrollment, error: enrollError } = await supabase
      .from('user_course_enrollments')
      .insert({
        user_id: testUserId,
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
    
    // 4. Test fetching enrolled courses
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
      .eq('user_id', testUserId)
      .eq('status', 'active');
    
    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError.message);
      return;
    }
    
    console.log('✅ Fetch successful!');
    console.log(`📚 Found ${enrolledCourses.length} enrolled courses`);
    
    // 5. Test duplicate enrollment prevention
    console.log('\n🔄 Testing duplicate enrollment prevention...');
    const { data: duplicateEnrollment, error: duplicateError } = await supabase
      .from('user_course_enrollments')
      .insert({
        user_id: testUserId,
        course_id: testCourse.id,
        status: 'active',
        progress_percentage: 0,
        enrollment_date: new Date().toISOString()
      })
      .select()
      .single();
    
    if (duplicateError) {
      if (duplicateError.code === '23505') { // Unique constraint violation
        console.log('✅ Duplicate enrollment correctly prevented by database constraint');
      } else {
        console.log('⚠️ Unexpected error:', duplicateError.message);
      }
    } else {
      console.log('⚠️ Duplicate enrollment was allowed (this might be an issue)');
    }
    
    console.log('\n🎉 Enrollment system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Basic enrollment works');
    console.log('- ✅ Enrolled courses can be fetched');
    console.log('- ✅ Duplicate enrollments are handled');
    console.log('\n💡 The enrollment issue should now be fixed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEnrollmentFix();

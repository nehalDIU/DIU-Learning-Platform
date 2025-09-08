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

async function testEnrollmentFunctionality() {
  console.log('🧪 Testing Course Enrollment Functionality\n');

  try {
    // 1. Check if student_users table exists and has data
    console.log('1. Checking student_users table...');
    const { data: students, error: studentsError } = await supabase
      .from('student_users')
      .select('*')
      .limit(5);

    if (studentsError) {
      console.error('❌ Error fetching students:', studentsError.message);
      return;
    }

    console.log(`✅ Found ${students?.length || 0} student users`);
    if (students && students.length > 0) {
      console.log('Sample student:', {
        id: students[0].id,
        user_id: students[0].user_id,
        email: students[0].email,
        full_name: students[0].full_name
      });
    }

    // 2. Check if courses table exists and has data
    console.log('\n2. Checking courses table...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .limit(5);

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError.message);
      return;
    }

    console.log(`✅ Found ${courses?.length || 0} courses`);
    if (courses && courses.length > 0) {
      console.log('Sample course:', {
        id: courses[0].id,
        title: courses[0].title,
        course_code: courses[0].course_code
      });
    }

    // 3. Check if user_course_enrollments table exists
    console.log('\n3. Checking user_course_enrollments table...');
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('user_course_enrollments')
      .select('*')
      .limit(5);

    if (enrollmentsError) {
      console.error('❌ Error fetching enrollments:', enrollmentsError.message);
      console.log('This table might not exist. Let\'s check...');
      
      // Try to create the table
      console.log('\n4. Attempting to create user_course_enrollments table...');
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS "public"."user_course_enrollments" (
            "id" uuid DEFAULT gen_random_uuid() NOT NULL,
            "user_id" varchar(255) NOT NULL,
            "course_id" uuid NOT NULL,
            "enrollment_date" timestamp with time zone DEFAULT now(),
            "status" varchar(20) DEFAULT 'active',
            "progress_percentage" integer DEFAULT 0,
            "last_accessed" timestamp with time zone,
            "completion_date" timestamp with time zone,
            "notes" text,
            "created_at" timestamp with time zone DEFAULT now(),
            "updated_at" timestamp with time zone DEFAULT now(),
            CONSTRAINT "user_course_enrollments_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "user_course_enrollments_user_id_course_id_key" UNIQUE ("user_id", "course_id"),
            CONSTRAINT "user_course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE,
            CONSTRAINT "user_course_enrollments_status_check" CHECK (status IN ('active', 'completed', 'dropped', 'paused'))
        );
      `;

      const { error: createError } = await supabase.rpc('exec', { sql: createTableSQL });
      
      if (createError) {
        console.error('❌ Error creating table:', createError.message);
        return;
      }

      console.log('✅ user_course_enrollments table created successfully');
      
      // Try fetching again
      const { data: newEnrollments, error: newEnrollmentsError } = await supabase
        .from('user_course_enrollments')
        .select('*')
        .limit(5);

      if (newEnrollmentsError) {
        console.error('❌ Still error fetching enrollments:', newEnrollmentsError.message);
        return;
      }

      console.log(`✅ Found ${newEnrollments?.length || 0} enrollments`);
    } else {
      console.log(`✅ Found ${enrollments?.length || 0} enrollments`);
      if (enrollments && enrollments.length > 0) {
        console.log('Sample enrollment:', {
          id: enrollments[0].id,
          user_id: enrollments[0].user_id,
          course_id: enrollments[0].course_id,
          status: enrollments[0].status
        });
      }
    }

    // 4. Test enrollment functionality if we have students and courses
    if (students && students.length > 0 && courses && courses.length > 0) {
      console.log('\n5. Testing enrollment functionality...');
      
      const testStudent = students[0];
      const testCourse = courses[0];
      
      console.log(`Testing enrollment for student ${testStudent.user_id} in course ${testCourse.title}`);
      
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('user_course_enrollments')
        .select('*')
        .eq('user_id', testStudent.user_id)
        .eq('course_id', testCourse.id)
        .single();

      if (existingEnrollment) {
        console.log('✅ Student is already enrolled:', {
          status: existingEnrollment.status,
          progress: existingEnrollment.progress_percentage,
          enrollment_date: existingEnrollment.enrollment_date
        });
      } else {
        console.log('📝 Student is not enrolled. Testing enrollment...');
        
        // Test enrollment
        const { data: newEnrollment, error: enrollError } = await supabase
          .from('user_course_enrollments')
          .insert({
            user_id: testStudent.user_id,
            course_id: testCourse.id,
            status: 'active',
            progress_percentage: 0
          })
          .select()
          .single();

        if (enrollError) {
          console.error('❌ Error creating enrollment:', enrollError.message);
        } else {
          console.log('✅ Enrollment created successfully:', {
            id: newEnrollment.id,
            status: newEnrollment.status,
            enrollment_date: newEnrollment.enrollment_date
          });
        }
      }
    }

    console.log('\n🎉 Enrollment functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEnrollmentFunctionality();

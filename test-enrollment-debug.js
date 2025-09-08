const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', !!supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('\n=== Testing Database Connection ===');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, course_code')
      .limit(3);
    
    if (error) {
      console.error('❌ Failed to connect to courses table:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to database');
    console.log(`📚 Found ${data.length} courses`);
    if (data.length > 0) {
      console.log('Sample courses:', data.map(c => `${c.course_code}: ${c.title}`));
    }
    
    return data;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkEnrollmentTable() {
  console.log('\n=== Checking Enrollment Table ===');
  
  try {
    const { data, error } = await supabase
      .from('user_course_enrollments')
      .select('id, user_id, course_id, status')
      .limit(5);
    
    if (error) {
      console.error('❌ Enrollment table error:', error.message);
      console.log('Error code:', error.code);
      
      if (error.code === '42P01') {
        console.log('🔧 Table does not exist - needs to be created');
        return await createEnrollmentTable();
      }
      return false;
    }
    
    console.log('✅ Enrollment table exists');
    console.log(`📊 Found ${data.length} existing enrollments`);
    return true;
  } catch (error) {
    console.error('❌ Failed to check enrollment table:', error.message);
    return false;
  }
}

async function createEnrollmentTable() {
  console.log('\n=== Creating Enrollment Table ===');
  
  try {
    const { error } = await supabase.rpc('exec', {
      sql: `
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
            CONSTRAINT "unique_user_course_enrollment" UNIQUE ("user_id", "course_id")
        );

        ALTER TABLE "public"."user_course_enrollments" ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all operations" ON "public"."user_course_enrollments" FOR ALL USING (true);
        GRANT ALL ON "public"."user_course_enrollments" TO "postgres", "anon", "authenticated";
      `
    });
    
    if (error) {
      console.error('❌ Failed to create table with RPC:', error.message);
      return false;
    }
    
    console.log('✅ Enrollment table created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create enrollment table:', error.message);
    return false;
  }
}

async function testEnrollment(courseId, userId = `test_user_${Date.now()}`) {
  console.log(`\n=== Testing Enrollment ===`);
  console.log(`Course ID: ${courseId}`);
  console.log(`User ID: ${userId}`);
  
  try {
    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, is_active')
      .eq('id', courseId)
      .single();
    
    if (courseError || !course) {
      console.error('❌ Course not found:', courseError?.message);
      return false;
    }
    
    if (!course.is_active) {
      console.error('❌ Course is not active');
      return false;
    }
    
    console.log(`✅ Course found: ${course.title}`);
    
    // Check for existing enrollment
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('user_course_enrollments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing enrollment:', checkError.message);
      return false;
    }
    
    if (existingEnrollment) {
      console.log(`⚠️ User already enrolled with status: ${existingEnrollment.status}`);
      if (existingEnrollment.status === 'active') {
        return { alreadyEnrolled: true, enrollment: existingEnrollment };
      }
    }
    
    // Create new enrollment
    const { data: newEnrollment, error: enrollError } = await supabase
      .from('user_course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        status: 'active',
        progress_percentage: 0,
        enrollment_date: new Date().toISOString()
      })
      .select()
      .single();
    
    if (enrollError) {
      console.error('❌ Failed to create enrollment:', enrollError.message);
      console.log('Error details:', enrollError);
      return false;
    }
    
    console.log('✅ Enrollment created successfully!');
    console.log('Enrollment details:', newEnrollment);
    return { success: true, enrollment: newEnrollment };
    
  } catch (error) {
    console.error('❌ Enrollment test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Enrollment System Debug\n');
  
  // Test database connection
  const courses = await testDatabaseConnection();
  if (!courses || courses.length === 0) {
    console.log('❌ Cannot proceed without courses');
    return;
  }
  
  // Check enrollment table
  const tableReady = await checkEnrollmentTable();
  if (!tableReady) {
    console.log('❌ Cannot proceed without enrollment table');
    return;
  }
  
  // Test enrollment with first available course
  const testCourse = courses[0];
  const result = await testEnrollment(testCourse.id);
  
  if (result) {
    console.log('\n✅ Enrollment system is working correctly!');
  } else {
    console.log('\n❌ Enrollment system has issues that need to be fixed');
  }
}

main().catch(console.error);

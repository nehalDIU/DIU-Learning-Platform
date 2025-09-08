import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    console.log('Initializing enrollment system...')

    // Try to create a test enrollment to see if table exists
    const testUserId = `init_test_${Date.now()}`
    const testCourseId = '00000000-0000-0000-0000-000000000000' // Dummy UUID

    // First, check if we have any real courses
    const { data: realCourses, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('is_active', true)
      .limit(1)

    if (coursesError) {
      return NextResponse.json({ 
        error: 'Cannot access courses table',
        details: coursesError.message 
      }, { status: 500 })
    }

    if (!realCourses || realCourses.length === 0) {
      return NextResponse.json({ 
        error: 'No courses available. Please add some courses first.' 
      }, { status: 404 })
    }

    const realCourseId = realCourses[0].id

    // Try to insert a test enrollment
    const { data: testEnrollment, error: insertError } = await supabase
      .from('user_course_enrollments')
      .insert({
        user_id: testUserId,
        course_id: realCourseId,
        status: 'active',
        progress_percentage: 0
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      
      if (insertError.code === '42P01') {
        // Table doesn't exist
        return NextResponse.json({ 
          error: 'Enrollment table does not exist',
          needsManualSetup: true,
          instructions: 'Please run the following SQL in your Supabase dashboard:',
          sql: `
-- Create the enrollment table
CREATE TABLE "public"."user_course_enrollments" (
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

-- Create indexes
CREATE INDEX "idx_user_course_enrollments_user_id" ON "public"."user_course_enrollments" ("user_id");
CREATE INDEX "idx_user_course_enrollments_course_id" ON "public"."user_course_enrollments" ("course_id");
CREATE INDEX "idx_user_course_enrollments_status" ON "public"."user_course_enrollments" ("status");

-- Enable RLS and create policies
ALTER TABLE "public"."user_course_enrollments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON "public"."user_course_enrollments" FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON "public"."user_course_enrollments" TO "postgres";
GRANT ALL ON "public"."user_course_enrollments" TO "anon";
GRANT ALL ON "public"."user_course_enrollments" TO "authenticated";
          `
        }, { status: 503 })
      }

      return NextResponse.json({ 
        error: 'Failed to create test enrollment',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 })
    }

    // Clean up test enrollment
    if (testEnrollment) {
      await supabase
        .from('user_course_enrollments')
        .delete()
        .eq('id', testEnrollment.id)
    }

    // Test fetching enrollments
    const { data: enrollments, error: fetchError } = await supabase
      .from('user_course_enrollments')
      .select('id, user_id, course_id, status')
      .limit(5)

    if (fetchError) {
      return NextResponse.json({ 
        error: 'Table exists but cannot fetch data',
        details: fetchError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Enrollment system is working correctly!',
      tableExists: true,
      canInsert: true,
      canFetch: true,
      existingEnrollments: enrollments?.length || 0,
      testCourseId: realCourseId
    })

  } catch (error) {
    console.error('Initialization error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during initialization',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Quick status check
    const { data: enrollmentCheck, error: enrollmentError } = await supabase
      .from('user_course_enrollments')
      .select('id')
      .limit(1)

    const { data: coursesCheck, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('is_active', true)
      .limit(1)

    return NextResponse.json({
      status: 'checking',
      enrollment: {
        tableExists: !enrollmentError || enrollmentError.code !== '42P01',
        error: enrollmentError?.message,
        recordCount: enrollmentCheck?.length || 0
      },
      courses: {
        tableExists: !coursesError,
        error: coursesError?.message,
        recordCount: coursesCheck?.length || 0
      },
      ready: !enrollmentError && !coursesError && (coursesCheck?.length || 0) > 0
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check system status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

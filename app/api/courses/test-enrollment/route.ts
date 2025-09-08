import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    // First, let's check if we have any courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, course_code')
      .eq('is_active', true)
      .limit(5)

    if (coursesError) {
      return NextResponse.json({ 
        error: 'Failed to fetch courses',
        details: coursesError.message 
      }, { status: 500 })
    }

    if (!courses || courses.length === 0) {
      return NextResponse.json({ 
        error: 'No active courses found. Please add some courses first.' 
      }, { status: 404 })
    }

    // Try to create a simple enrollment record using direct SQL
    const testUserId = `test_user_${Date.now()}`
    const testCourseId = courses[0].id

    // Use a simple insert approach
    const { data: enrollment, error: enrollError } = await supabase
      .from('user_course_enrollments')
      .insert({
        user_id: testUserId,
        course_id: testCourseId,
        status: 'active',
        progress_percentage: 0
      })
      .select()
      .single()

    if (enrollError) {
      console.error('Enrollment error:', enrollError)
      
      if (enrollError.code === '42P01') {
        return NextResponse.json({ 
          error: 'Enrollment table does not exist. Database migration needed.',
          needsMigration: true,
          sqlToRun: `
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

ALTER TABLE "public"."user_course_enrollments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON "public"."user_course_enrollments" FOR ALL USING (true);
GRANT ALL ON "public"."user_course_enrollments" TO "postgres", "anon", "authenticated";
          `
        }, { status: 503 })
      }

      return NextResponse.json({ 
        error: 'Failed to create test enrollment',
        details: enrollError.message 
      }, { status: 500 })
    }

    // Clean up test enrollment
    await supabase
      .from('user_course_enrollments')
      .delete()
      .eq('id', enrollment.id)

    return NextResponse.json({
      message: 'Enrollment system is working correctly!',
      testCourse: courses[0],
      enrollmentCreated: true
    })

  } catch (error) {
    console.error('Test enrollment error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during enrollment test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check system status
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .limit(1)

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('user_course_enrollments')
      .select('id')
      .limit(1)

    return NextResponse.json({
      coursesTable: coursesError ? { error: coursesError.message } : { working: true, count: courses?.length || 0 },
      enrollmentsTable: enrollmentsError ? { error: enrollmentsError.message, needsSetup: enrollmentsError.code === '42P01' } : { working: true }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check system status' 
    }, { status: 500 })
  }
}

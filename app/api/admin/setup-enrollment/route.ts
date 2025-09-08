import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    console.log('Setting up course enrollment tables...')

    // First, let's try to create the table directly using a simple approach
    const { error: createError } = await supabase.rpc('exec', {
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
      `
    })

    if (createError) {
      console.error('Error with rpc exec:', createError)
      
      // Try alternative approach - insert a test record to trigger table creation
      const { error: insertError } = await supabase
        .from('user_course_enrollments')
        .insert({
          user_id: 'test_setup_user',
          course_id: '00000000-0000-0000-0000-000000000000',
          status: 'active'
        })

      if (insertError) {
        console.error('Insert test also failed:', insertError)
        return NextResponse.json({ 
          error: 'Failed to set up enrollment tables. Please run the SQL migration manually.',
          details: createError.message 
        }, { status: 500 })
      }

      // Clean up test record
      await supabase
        .from('user_course_enrollments')
        .delete()
        .eq('user_id', 'test_setup_user')
    }

    // Test if the table is working
    const { data: testQuery, error: testError } = await supabase
      .from('user_course_enrollments')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('Test query failed:', testError)
      return NextResponse.json({ 
        error: 'Enrollment table exists but is not accessible',
        details: testError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Course enrollment system is ready',
      tableAccessible: true,
      existingEnrollments: testQuery?.length || 0
    })

  } catch (error) {
    console.error('Unexpected error in enrollment setup:', error)
    return NextResponse.json({ 
      error: 'Internal server error during setup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if enrollment system is working
    const { data, error } = await supabase
      .from('user_course_enrollments')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json({
        ready: false,
        error: error.message,
        needsSetup: error.code === '42P01' // Table does not exist
      })
    }

    return NextResponse.json({
      ready: true,
      message: 'Course enrollment system is operational'
    })

  } catch (error) {
    return NextResponse.json({
      ready: false,
      error: 'Failed to check enrollment system status'
    }, { status: 500 })
  }
}

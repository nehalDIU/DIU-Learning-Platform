import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    console.log('Setting up database tables...')

    // Create the enrollment table with proper structure
    const { error: createError } = await supabase.rpc('exec', {
      sql: `
        -- Create user_course_enrollments table if it doesn't exist
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

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS "idx_user_course_enrollments_user_id" ON "public"."user_course_enrollments" ("user_id");
        CREATE INDEX IF NOT EXISTS "idx_user_course_enrollments_course_id" ON "public"."user_course_enrollments" ("course_id");
        CREATE INDEX IF NOT EXISTS "idx_user_course_enrollments_status" ON "public"."user_course_enrollments" ("status");

        -- Enable RLS
        ALTER TABLE "public"."user_course_enrollments" ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow all operations" ON "public"."user_course_enrollments";
        
        -- Create policy to allow all operations (for now)
        CREATE POLICY "Allow all operations" ON "public"."user_course_enrollments" FOR ALL USING (true);

        -- Grant permissions
        GRANT ALL ON "public"."user_course_enrollments" TO "postgres";
        GRANT ALL ON "public"."user_course_enrollments" TO "anon";
        GRANT ALL ON "public"."user_course_enrollments" TO "authenticated";
      `
    })

    if (createError) {
      console.error('Error with SQL execution:', createError)
      
      // Try alternative approach - direct table creation
      const { error: directError } = await supabase
        .from('user_course_enrollments')
        .select('id')
        .limit(1)

      if (directError && directError.code === '42P01') {
        // Table doesn't exist, try to create it using insert (this will fail but might create the table)
        return NextResponse.json({ 
          error: 'Table does not exist and could not be created automatically. Please run the SQL migration manually.',
          sql: `
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
    }

    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('user_course_enrollments')
      .select('id')
      .limit(1)

    if (testError) {
      return NextResponse.json({ 
        error: 'Table setup failed',
        details: testError.message 
      }, { status: 500 })
    }

    // Check if we have courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_active', true)
      .limit(5)

    if (coursesError) {
      return NextResponse.json({ 
        error: 'Could not fetch courses',
        details: coursesError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Database setup completed successfully',
      enrollmentTableReady: true,
      coursesAvailable: courses?.length || 0,
      sampleCourses: courses?.slice(0, 3) || []
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during setup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check current status
    const { data: enrollmentCheck, error: enrollmentError } = await supabase
      .from('user_course_enrollments')
      .select('id')
      .limit(1)

    const { data: coursesCheck, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .limit(1)

    return NextResponse.json({
      enrollmentTable: enrollmentError ? { 
        exists: false, 
        error: enrollmentError.message,
        needsSetup: enrollmentError.code === '42P01'
      } : { 
        exists: true, 
        recordCount: enrollmentCheck?.length || 0 
      },
      coursesTable: coursesError ? { 
        exists: false, 
        error: coursesError.message 
      } : { 
        exists: true, 
        recordCount: coursesCheck?.length || 0 
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check database status' 
    }, { status: 500 })
  }
}

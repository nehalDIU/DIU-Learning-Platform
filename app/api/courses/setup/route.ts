import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    // Check if user_course_enrollments table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_course_enrollments')

    if (tablesError) {
      console.error('Error checking tables:', tablesError)
      return NextResponse.json({ error: 'Failed to check database tables' }, { status: 500 })
    }

    const tableExists = tables && tables.length > 0

    if (!tableExists) {
      // Create the enrollment tables
      const createTableSQL = `
        -- Create user_course_enrollments table
        CREATE TABLE IF NOT EXISTS "public"."user_course_enrollments" (
            "id" uuid DEFAULT gen_random_uuid() NOT NULL,
            "user_id" varchar(255) NOT NULL,
            "course_id" uuid NOT NULL,
            "enrollment_date" timestamp with time zone DEFAULT now(),
            "status" varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
            "progress_percentage" integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
            "last_accessed" timestamp with time zone,
            "completion_date" timestamp with time zone,
            "notes" text,
            "created_at" timestamp with time zone DEFAULT now(),
            "updated_at" timestamp with time zone DEFAULT now(),
            CONSTRAINT "user_course_enrollments_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "user_course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE,
            CONSTRAINT "unique_user_course_enrollment" UNIQUE ("user_id", "course_id")
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS "idx_user_course_enrollments_user_id" ON "public"."user_course_enrollments" ("user_id");
        CREATE INDEX IF NOT EXISTS "idx_user_course_enrollments_course_id" ON "public"."user_course_enrollments" ("course_id");
        CREATE INDEX IF NOT EXISTS "idx_user_course_enrollments_status" ON "public"."user_course_enrollments" ("status");

        -- Enable RLS and create policies
        ALTER TABLE "public"."user_course_enrollments" ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage their own enrollments" ON "public"."user_course_enrollments";
        CREATE POLICY "Users can manage their own enrollments" ON "public"."user_course_enrollments"
            FOR ALL USING (true);

        -- Grant permissions
        GRANT ALL ON "public"."user_course_enrollments" TO "postgres";
        GRANT ALL ON "public"."user_course_enrollments" TO "anon";
        GRANT ALL ON "public"."user_course_enrollments" TO "authenticated";
      `

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })

      if (createError) {
        console.error('Error creating tables:', createError)
        return NextResponse.json({ error: 'Failed to create database tables' }, { status: 500 })
      }
    }

    // Test the enrollment functionality
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_active', true)
      .limit(1)

    if (coursesError) {
      console.error('Error fetching courses:', coursesError)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Database setup completed successfully',
      tableExists,
      coursesCount: courses?.length || 0,
      sampleCourse: courses?.[0] || null
    })

  } catch (error) {
    console.error('Unexpected error in setup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

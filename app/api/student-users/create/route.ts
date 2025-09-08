import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

interface CreateStudentUserRequest {
  email: string
  fullName?: string
  batch?: string
  section?: string
  sectionId?: string
  hasSkippedSelection?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, batch, section, sectionId, hasSkippedSelection } = await request.json() as CreateStudentUserRequest

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Generate a unique user ID for this student
    const userId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Auto-generate fullName from email if not provided
    const finalFullName = fullName && fullName.trim()
      ? fullName.trim()
      : email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    // Check if user already exists with this email
    const { data: existingUser, error: existingError } = await supabase
      .from("student_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    // Handle case where table doesn't exist (but ignore "no rows" error which is normal)
    if (existingError &&
        existingError.code !== 'PGRST116' && // PGRST116 = "no rows returned" which is normal
        (existingError.code === '42P01' || // PostgreSQL table does not exist
         existingError.message?.includes('relation "public.student_users" does not exist') ||
         existingError.message?.includes('Could not find the table'))) {
      return NextResponse.json({
        error: 'Database table not found. Please run the database setup script.',
        setupInstructions: true,
        needsSetup: true,
        details: 'The student_users table needs to be created in your Supabase database.'
      }, { status: 400 })
    }

    if (existingUser && !existingError) {
      // Update existing user's last accessed time
      const { data: updatedUser, error: updateError } = await supabase
        .from("student_users")
        .update({
          last_accessed: new Date().toISOString(),
          full_name: finalFullName, // Always update with auto-generated or provided name
          ...(batch && { batch }),
          ...(section && { section }),
          ...(sectionId && { section_id: sectionId }),
          ...(hasSkippedSelection !== undefined && { has_skipped_selection: hasSkippedSelection })
        })
        .eq("email", email.toLowerCase())
        .select()
        .single()

      if (updateError) {
        console.error("Error updating existing user:", updateError)
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        studentUser: {
          id: updatedUser.id,
          userId: updatedUser.user_id,
          email: updatedUser.email,
          fullName: updatedUser.full_name,
          batch: updatedUser.batch,
          section: updatedUser.section,
          sectionId: updatedUser.section_id,
          hasSkippedSelection: updatedUser.has_skipped_selection,
          createdAt: updatedUser.created_at
        },
        isExistingUser: true
      })
    }

    // Validate section if provided
    let semester = null
    if (sectionId && !hasSkippedSelection) {
      const { data: semesterData, error: semesterError } = await supabase
        .from("semesters")
        .select("id, section, title")
        .eq("id", sectionId)
        .eq("is_active", true)
        .single()

      if (semesterError || !semesterData) {
        return NextResponse.json(
          { error: "Invalid or inactive section" },
          { status: 400 }
        )
      }
      semester = semesterData
    }

    // Create the student user record
    const { data: studentUser, error: createError } = await supabase
      .from("student_users")
      .insert({
        user_id: userId,
        email: email.toLowerCase(),
        full_name: finalFullName,
        batch: batch || null,
        section: section || null,
        section_id: sectionId || null,
        has_skipped_selection: hasSkippedSelection || false,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating student user:", createError)

      // If table doesn't exist, provide setup instructions
      if (createError.code === '42P01') {
        return NextResponse.json({
          error: "Student users table not found",
          needsSetup: true,
          setupInstructions: `
Please create the student_users table by running this SQL in Supabase:

-- Create student_users table for batch-based user authentication
CREATE TABLE IF NOT EXISTS "public"."student_users" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar(255) UNIQUE NOT NULL,
    "email" varchar(255) UNIQUE NOT NULL,
    "full_name" varchar(255),
    "batch" varchar(10),
    "section" varchar(10),
    "section_id" uuid,
    "has_skipped_selection" boolean DEFAULT false,
    "profile_photo_url" text,
    "phone" varchar(20),
    "student_id" varchar(50),
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "last_accessed" timestamp with time zone DEFAULT now(),
    "is_active" boolean DEFAULT true,
    CONSTRAINT "student_users_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_student_users_user_id" ON "public"."student_users" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_student_users_email" ON "public"."student_users" ("email");
CREATE INDEX IF NOT EXISTS "idx_student_users_batch" ON "public"."student_users" ("batch");

ALTER TABLE "public"."student_users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to student_users" ON "public"."student_users" FOR ALL USING (true);
          `
        }, { status: 500 })
      }

      return NextResponse.json(
        { error: "Failed to create student user" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      studentUser: {
        id: studentUser.id,
        userId: studentUser.user_id,
        email: studentUser.email,
        fullName: studentUser.full_name,
        batch: studentUser.batch,
        section: studentUser.section,
        sectionId: studentUser.section_id,
        hasSkippedSelection: studentUser.has_skipped_selection,
        createdAt: studentUser.created_at
      },
      semester: semester ? {
        id: semester.id,
        title: semester.title,
        section: semester.section
      } : null,
      isExistingUser: false
    })

  } catch (error) {
    console.error("Error in create student user API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve student user by user ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data: studentUser, error } = await supabase
      .from("student_users")
      .select(`
        id,
        user_id,
        section_id,
        section,
        display_name,
        created_at,
        updated_at,
        last_accessed,
        is_active
      `)
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Student user not found" },
          { status: 404 }
        )
      }
      
      console.error("Error fetching student user:", error)
      return NextResponse.json(
        { error: "Failed to fetch student user" },
        { status: 500 }
      )
    }

    // Update last accessed time
    await supabase
      .from("student_users")
      .update({ last_accessed: new Date().toISOString() })
      .eq("user_id", userId)

    return NextResponse.json({
      success: true,
      studentUser
    })

  } catch (error) {
    console.error("Error in get student user API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

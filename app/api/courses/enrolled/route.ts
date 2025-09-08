import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Use provided user ID or return empty array if not provided
    // In a real app, this would come from authentication
    if (!userId) {
      console.log('API: No user ID provided, returning empty enrollments')
      return NextResponse.json([])
    }

    const enrollmentUserId = userId

    console.log('API: Fetching enrolled courses for user:', enrollmentUserId)

    // First, get the student's internal ID from their user_id
    const { data: studentUser, error: studentError } = await supabase
      .from("student_users")
      .select("id")
      .eq("user_id", enrollmentUserId)
      .single()

    if (studentError || !studentUser) {
      console.log('API: Student user not found for userId:', enrollmentUserId)
      return NextResponse.json([])
    }

    const studentId = studentUser.id

    // Get enrollments using the new table structure
    const { data: enrollments, error } = await supabase
      .from("student_course_enrollments")
      .select(`
        id,
        student_id,
        course_id,
        enrollment_status,
        completion_percentage,
        enrollment_date,
        last_accessed,
        grade
      `)
      .eq("student_id", studentId)
      .eq("enrollment_status", "active")
      .order("enrollment_date", { ascending: false })

    if (error) {
      console.error("API: Error fetching enrolled courses:", error)

      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01' || // PostgreSQL: Table does not exist
          error.code === 'PGRST205' || // PostgREST: Could not find table in schema cache
          error.message?.includes('Could not find the table') ||
          error.message?.includes('relation') && error.message?.includes('does not exist')) {
        console.warn("API: Enrollment table doesn't exist, returning empty array")
        return NextResponse.json([])
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('API: Found enrollments:', enrollments?.length || 0)

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json([])
    }

    // Get course details for enrolled courses
    const courseIds = enrollments.map(e => e.course_id)
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        course_code,
        teacher_name,
        teacher_email,
        description,
        credits,
        is_highlighted,
        created_at,
        updated_at,
        semester:semesters (
          id,
          title,
          section,
          is_active
        )
      `)
      .in("id", courseIds)

    if (coursesError) {
      console.error("Error fetching course details:", coursesError)
      return NextResponse.json({ error: coursesError.message }, { status: 500 })
    }

    // Transform the data to match the expected Course interface
    const enrolledCourses = enrollments.map(enrollment => {
      const course = courses?.find(c => c.id === enrollment.course_id)
      if (!course) return null

      return {
        ...course,
        enrollment: {
          id: enrollment.id,
          status: enrollment.enrollment_status,
          progress_percentage: enrollment.completion_percentage,
          enrollment_date: enrollment.enrollment_date,
          last_accessed: enrollment.last_accessed,
          completion_date: null, // We don't have this field in the new structure
          grade: enrollment.grade
        }
      }
    }).filter(Boolean) // Remove null entries

    return NextResponse.json(enrolledCourses)

  } catch (error) {
    console.error("Unexpected error fetching enrolled courses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

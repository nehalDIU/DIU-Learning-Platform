import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // For now, use a demo user ID if not provided
    // In a real app, this would come from authentication
    const enrollmentUserId = userId || 'demo_user_default'

    console.log('API: Fetching enrolled courses for user:', enrollmentUserId)

    // First get enrollments
    const { data: enrollments, error } = await supabase
      .from("user_course_enrollments")
      .select(`
        id,
        user_id,
        course_id,
        status,
        progress_percentage,
        enrollment_date,
        last_accessed,
        completion_date
      `)
      .eq("user_id", enrollmentUserId)
      .eq("status", "active")
      .order("enrollment_date", { ascending: false })

    if (error) {
      console.error("API: Error fetching enrolled courses:", error)

      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01') { // Table does not exist
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
          status: enrollment.status,
          progress_percentage: enrollment.progress_percentage,
          enrollment_date: enrollment.enrollment_date,
          last_accessed: enrollment.last_accessed,
          completion_date: enrollment.completion_date
        }
      }
    }).filter(Boolean) // Remove null entries

    return NextResponse.json(enrolledCourses)

  } catch (error) {
    console.error("Unexpected error fetching enrolled courses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

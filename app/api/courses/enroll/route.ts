import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Add better error handling for JSON parsing
    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      return NextResponse.json({
        error: "Invalid JSON in request body",
        details: parseError instanceof Error ? parseError.message : "Unknown parsing error"
      }, { status: 400 })
    }

    const { courseId, userId } = requestBody

    console.log("Enrollment request received:", { courseId, userId })

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Use provided user ID or return error if not provided
    // In a real app, this would come from authentication
    if (!userId) {
      return NextResponse.json({ error: "User ID is required for enrollment" }, { status: 400 })
    }

    const enrollmentUserId = userId

    // Check if course exists and is active
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, is_active")
      .eq("id", courseId)
      .eq("is_active", true)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found or inactive" }, { status: 404 })
    }

    // First, we need to get the student's internal ID from their user_id
    const { data: studentUser, error: studentError } = await supabase
      .from("student_users")
      .select("id")
      .eq("user_id", enrollmentUserId)
      .single()

    if (studentError || !studentUser) {
      console.error("Error finding student user:", studentError)
      return NextResponse.json({
        error: "Student account not found. Please create an account first."
      }, { status: 404 })
    }

    const studentId = studentUser.id

    // Check if user is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("student_course_enrollments")
      .select("id, enrollment_status")
      .eq("student_id", studentId)
      .eq("course_id", courseId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking enrollment:", checkError)

      // If table doesn't exist, provide a helpful error message
      if (checkError.code === '42P01') { // Table does not exist
        return NextResponse.json({
          error: "Course enrollment system is not set up. Please contact administrator."
        }, { status: 503 })
      }

      return NextResponse.json({
        error: "Failed to check enrollment status. Please try again."
      }, { status: 500 })
    }

    if (existingEnrollment) {
      if (existingEnrollment.enrollment_status === 'active') {
        return NextResponse.json({ error: "Already enrolled in this course" }, { status: 409 })
      } else {
        // Reactivate enrollment if it was dropped or paused
        const { data: updatedEnrollment, error: updateError } = await supabase
          .from("student_course_enrollments")
          .update({
            enrollment_status: 'active',
            enrollment_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", existingEnrollment.id)
          .select()
          .single()

        if (updateError) {
          console.error("Error reactivating enrollment:", updateError)
          return NextResponse.json({ error: "Failed to reactivate enrollment" }, { status: 500 })
        }

        return NextResponse.json({
          message: "Successfully re-enrolled in course",
          enrollment: updatedEnrollment
        })
      }
    }

    // Create new enrollment using the database function
    const { data: enrollmentResult, error: enrollError } = await supabase
      .rpc('enroll_student_in_course', {
        p_student_id: studentId,
        p_course_id: courseId,
        p_notes: `Enrolled via web interface by user ${enrollmentUserId}`
      })

    if (enrollError) {
      console.error("Error creating enrollment:", enrollError)
      return NextResponse.json({
        error: enrollError.message || "Failed to enroll in course"
      }, { status: 500 })
    }

    // Get the created enrollment details
    const { data: newEnrollment, error: fetchError } = await supabase
      .from("student_course_enrollments")
      .select("*")
      .eq("id", enrollmentResult)
      .single()

    if (fetchError) {
      console.error("Error fetching enrollment details:", fetchError)
      // Still return success since enrollment was created
      return NextResponse.json({
        message: "Successfully enrolled in course",
        enrollment: { id: enrollmentResult }
      })
    }

    return NextResponse.json({
      message: "Successfully enrolled in course",
      enrollment: newEnrollment
    })

  } catch (error) {
    console.error("Unexpected error in course enrollment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

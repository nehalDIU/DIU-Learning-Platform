import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Also support POST method for testing
export async function POST(request: NextRequest) {
  return handleUnenrollment(request)
}

export async function DELETE(request: NextRequest) {
  return handleUnenrollment(request)
}

async function handleUnenrollment(request: NextRequest) {
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

    console.log("Unenrollment request received:", { courseId, userId })

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Use provided user ID or return error if not provided
    // In a real app, this would come from authentication
    if (!userId) {
      return NextResponse.json({ error: "User ID is required for unenrollment" }, { status: 400 })
    }

    const enrollmentUserId = userId

    // First, get the student's internal ID from their user_id
    const { data: studentUser, error: studentError } = await supabase
      .from("student_users")
      .select("id")
      .eq("user_id", enrollmentUserId)
      .single()

    if (studentError || !studentUser) {
      console.error("Error finding student user:", studentError)
      return NextResponse.json({
        error: "Student account not found."
      }, { status: 404 })
    }

    const studentId = studentUser.id

    // Find the enrollment
    const { data: enrollment, error: findError } = await supabase
      .from("student_course_enrollments")
      .select("id, enrollment_status")
      .eq("student_id", studentId)
      .eq("course_id", courseId)
      .single()

    if (findError || !enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    if (enrollment.enrollment_status !== 'active') {
      return NextResponse.json({ error: "Cannot unenroll from inactive enrollment" }, { status: 400 })
    }

    // Use the database function to unenroll
    const { data: unenrollResult, error: unenrollError } = await supabase
      .rpc('unenroll_student_from_course', {
        p_student_id: studentId,
        p_course_id: courseId,
        p_reason: 'withdrawn'
      })

    if (unenrollError) {
      console.error("Error unenrolling student:", unenrollError)
      return NextResponse.json({
        error: unenrollError.message || "Failed to unenroll from course"
      }, { status: 500 })
    }

    // Get the updated enrollment details
    const { data: updatedEnrollment, error: fetchError } = await supabase
      .from("student_course_enrollments")
      .select("*")
      .eq("id", enrollment.id)
      .single()

    if (fetchError) {
      console.error("Error fetching updated enrollment:", fetchError)
      // Still return success since unenrollment was processed
      return NextResponse.json({
        message: "Successfully unenrolled from course"
      })
    }

    return NextResponse.json({
      message: "Successfully unenrolled from course",
      enrollment: updatedEnrollment
    })

  } catch (error) {
    console.error("Unexpected error in course unenrollment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

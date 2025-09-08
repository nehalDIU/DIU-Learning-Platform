import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function DELETE(request: NextRequest) {
  try {
    const { courseId, userId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // For now, use a demo user ID if not provided
    // In a real app, this would come from authentication
    const enrollmentUserId = userId || `demo_user_${Date.now()}`

    // Find the enrollment
    const { data: enrollment, error: findError } = await supabase
      .from("user_course_enrollments")
      .select("id, status")
      .eq("user_id", enrollmentUserId)
      .eq("course_id", courseId)
      .single()

    if (findError || !enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    if (enrollment.status !== 'active') {
      return NextResponse.json({ error: "Cannot unenroll from inactive enrollment" }, { status: 400 })
    }

    // Update enrollment status to 'dropped' instead of deleting
    // This preserves progress data for potential re-enrollment
    const { data: updatedEnrollment, error: updateError } = await supabase
      .from("user_course_enrollments")
      .update({ 
        status: 'dropped',
        updated_at: new Date().toISOString()
      })
      .eq("id", enrollment.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating enrollment status:", updateError)
      return NextResponse.json({ error: "Failed to unenroll from course" }, { status: 500 })
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

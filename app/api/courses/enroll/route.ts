import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // For now, use a demo user ID if not provided
    // In a real app, this would come from authentication
    const enrollmentUserId = userId || `demo_user_${Date.now()}`

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

    // Check if user is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("user_course_enrollments")
      .select("id, status")
      .eq("user_id", enrollmentUserId)
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
      if (existingEnrollment.status === 'active') {
        return NextResponse.json({ error: "Already enrolled in this course" }, { status: 409 })
      } else {
        // Reactivate enrollment if it was dropped or paused
        const { data: updatedEnrollment, error: updateError } = await supabase
          .from("user_course_enrollments")
          .update({ 
            status: 'active',
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

    // Create new enrollment
    const { data: newEnrollment, error: enrollError } = await supabase
      .from("user_course_enrollments")
      .insert({
        user_id: enrollmentUserId,
        course_id: courseId,
        status: 'active',
        progress_percentage: 0,
        enrollment_date: new Date().toISOString()
      })
      .select()
      .single()

    if (enrollError) {
      console.error("Error creating enrollment:", enrollError)
      return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 })
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

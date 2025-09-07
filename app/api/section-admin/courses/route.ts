import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Helper function to verify section admin authorization
async function verifySectionAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      return { error: "No token provided", status: 401 }
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return { error: "Invalid token", status: 401 }
    }

    // Get current user data
    const { data: adminUser, error: userError } = await supabase
      .from("admin_users")
      .select("id, email, full_name, role, department, is_active")
      .eq("id", decoded.userId)
      .eq("is_active", true)
      .single()

    if (userError || !adminUser) {
      return { error: "User not found or inactive", status: 401 }
    }

    // Check if user has section admin role or higher
    if (!["section_admin", "admin", "super_admin"].includes(adminUser.role)) {
      return { error: "Insufficient permissions", status: 403 }
    }

    return { user: adminUser }
  } catch (error) {
    console.error("Authorization error:", error)
    return { error: "Internal server error", status: 500 }
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifySectionAdmin(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user!
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('semester_id')

    // Build query
    let query = supabase
      .from("courses")
      .select(`
        id,
        title,
        course_code,
        teacher_name,
        teacher_email,
        description,
        credits,
        semester_id,
        is_active,
        created_at,
        updated_at,
        semesters!inner(section)
      `)
      .order("created_at", { ascending: false })

    // Filter by semester if provided
    if (semesterId) {
      query = query.eq("semester_id", semesterId)
    }

    // Filter by department for section admins
    if (user.role === "section_admin" && user.department) {
      query = query.eq("semesters.section", user.department)
    }

    const { data: courses, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
    }

    // Transform data to include additional stats
    const coursesWithStats = await Promise.all(
      (courses || []).map(async (course) => {
        // Get topics count
        const { count: topicsCount } = await supabase
          .from("topics")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        // Get study tools count
        const { count: studyToolsCount } = await supabase
          .from("study_tools")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        return {
          ...course,
          topics_count: topicsCount || 0,
          study_tools_count: studyToolsCount || 0,
          materials_count: (topicsCount || 0) + (studyToolsCount || 0)
        }
      })
    )

    return NextResponse.json(coursesWithStats)
  } catch (error) {
    console.error("GET /api/section-admin/courses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifySectionAdmin(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user!
    const body = await request.json()

    // Validate required fields
    const { title, course_code, semester_id } = body
    if (!title || !course_code || !semester_id) {
      return NextResponse.json(
        { error: "Missing required fields: title, course_code, and semester_id" },
        { status: 400 }
      )
    }

    // Verify semester exists and user has access
    const { data: semester, error: semesterError } = await supabase
      .from("semesters")
      .select("id, section")
      .eq("id", semester_id)
      .single()

    if (semesterError || !semester) {
      return NextResponse.json({ error: "Semester not found" }, { status: 404 })
    }

    // Check if section admin can access this semester
    if (user.role === "section_admin" && user.department && semester.section !== user.department) {
      return NextResponse.json(
        { error: "You can only create courses for semesters in your assigned section" },
        { status: 403 }
      )
    }

    // Create course
    const { data: newCourse, error: courseError } = await supabase
      .from("courses")
      .insert({
        title,
        course_code,
        teacher_name: body.teacher_name,
        teacher_email: body.teacher_email,
        description: body.description,
        credits: body.credits || 3,
        semester_id,
        is_active: body.is_active !== undefined ? body.is_active : true
      })
      .select()
      .single()

    if (courseError) {
      console.error("Error creating course:", courseError)
      return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      course: newCourse,
      message: "Course created successfully"
    })
  } catch (error) {
    console.error("POST /api/section-admin/courses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifySectionAdmin(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user!
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Verify course exists and user has access
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(`
        id,
        semester_id,
        semesters!inner(section)
      `)
      .eq("id", id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if section admin can access this course
    if (user.role === "section_admin" && user.department && course.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only update courses in your assigned section" },
        { status: 403 }
      )
    }

    // Update course
    const { data: updatedCourse, error: updateError } = await supabase
      .from("courses")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating course:", updateError)
      return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      course: updatedCourse,
      message: "Course updated successfully"
    })
  } catch (error) {
    console.error("PUT /api/section-admin/courses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifySectionAdmin(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user!
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Verify course exists and user has access
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(`
        id,
        semester_id,
        semesters!inner(section)
      `)
      .eq("id", id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if section admin can access this course
    if (user.role === "section_admin" && user.department && course.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only delete courses in your assigned section" },
        { status: 403 }
      )
    }

    // Delete course (this will cascade to topics and study_tools due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting course:", deleteError)
      return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Course deleted successfully"
    })
  } catch (error) {
    console.error("DELETE /api/section-admin/courses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

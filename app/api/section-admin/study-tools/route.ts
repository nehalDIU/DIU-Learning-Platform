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
    const courseId = searchParams.get('course_id')
    const type = searchParams.get('type')

    // Build query
    let query = supabase
      .from("study_tools")
      .select(`
        id,
        title,
        description,
        type,
        content_url,
        course_id,
        exam_type,
        created_at,
        updated_at,
        courses!inner(
          id,
          title,
          semester_id,
          semesters!inner(section)
        )
      `)
      .order("created_at", { ascending: false })

    // Filter by course if provided
    if (courseId) {
      query = query.eq("course_id", courseId)
    }

    // Filter by type if provided
    if (type) {
      query = query.eq("type", type)
    }

    // Filter by department for section admins
    if (user.role === "section_admin" && user.department) {
      query = query.eq("courses.semesters.section", user.department)
    }

    const { data: studyTools, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch study tools" }, { status: 500 })
    }

    return NextResponse.json(studyTools || [])
  } catch (error) {
    console.error("GET /api/section-admin/study-tools error:", error)
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
    const { title, type, course_id } = body
    if (!title || !type || !course_id) {
      return NextResponse.json(
        { error: "Missing required fields: title, type, and course_id" },
        { status: 400 }
      )
    }

    // Validate type - Updated to match your requirements
    const validTypes = ["note", "previous_question", "syllabus"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Verify course exists and user has access
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(`
        id,
        semesters!inner(section)
      `)
      .eq("id", course_id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if section admin can access this course
    if (user.role === "section_admin" && user.department && course.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only create study tools for courses in your assigned section" },
        { status: 403 }
      )
    }

    // Create study tool
    const { data: newStudyTool, error: studyToolError } = await supabase
      .from("study_tools")
      .insert({
        title,
        description: body.description,
        type,
        content_url: body.content_url,
        course_id,
        exam_type: body.exam_type || "both"
      })
      .select()
      .single()

    if (studyToolError) {
      console.error("Error creating study tool:", studyToolError)
      return NextResponse.json({ error: "Failed to create study tool" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      studyTool: newStudyTool,
      message: "Study tool created successfully"
    })
  } catch (error) {
    console.error("POST /api/section-admin/study-tools error:", error)
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
      return NextResponse.json({ error: "Study tool ID is required" }, { status: 400 })
    }

    // Verify study tool exists and user has access
    const { data: studyTool, error: studyToolError } = await supabase
      .from("study_tools")
      .select(`
        id,
        course_id,
        courses!inner(
          semesters!inner(section)
        )
      `)
      .eq("id", id)
      .single()

    if (studyToolError || !studyTool) {
      return NextResponse.json({ error: "Study tool not found" }, { status: 404 })
    }

    // Check if section admin can access this study tool
    if (user.role === "section_admin" && user.department && studyTool.courses.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only update study tools in your assigned section" },
        { status: 403 }
      )
    }

    // Update study tool
    const { data: updatedStudyTool, error: updateError } = await supabase
      .from("study_tools")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating study tool:", updateError)
      return NextResponse.json({ error: "Failed to update study tool" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      studyTool: updatedStudyTool,
      message: "Study tool updated successfully"
    })
  } catch (error) {
    console.error("PUT /api/section-admin/study-tools error:", error)
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
      return NextResponse.json({ error: "Study tool ID is required" }, { status: 400 })
    }

    // Verify study tool exists and user has access
    const { data: studyTool, error: studyToolError } = await supabase
      .from("study_tools")
      .select(`
        id,
        course_id,
        courses!inner(
          semesters!inner(section)
        )
      `)
      .eq("id", id)
      .single()

    if (studyToolError || !studyTool) {
      return NextResponse.json({ error: "Study tool not found" }, { status: 404 })
    }

    // Check if section admin can access this study tool
    if (user.role === "section_admin" && user.department && studyTool.courses.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only delete study tools in your assigned section" },
        { status: 403 }
      )
    }

    // Delete study tool
    const { error: deleteError } = await supabase
      .from("study_tools")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting study tool:", deleteError)
      return NextResponse.json({ error: "Failed to delete study tool" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Study tool deleted successfully"
    })
  } catch (error) {
    console.error("DELETE /api/section-admin/study-tools error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

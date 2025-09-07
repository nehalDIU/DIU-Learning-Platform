import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Helper function to verify section admin authorization
async function verifySectionAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value
    console.log(`🔍 Token check - Found: ${token ? 'YES' : 'NO'}`)

    if (!token) {
      console.log("❌ No admin_token found in cookies")
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifySectionAdmin(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user!
    const resolvedParams = await params
    const semesterId = resolvedParams.id

    // Get semester with all related data
    let query = supabase
      .from("semesters")
      .select(`
        *,
        courses (
          *,
          topics (
            *,
            slides (*),
            videos (*)
          ),
          study_tools (*)
        )
      `)
      .eq("id", semesterId)

    // TODO: Implement proper section filtering when section format is standardized
    // For now, section admins can access all semesters
    // if (user.role === "section_admin" && user.department) {
    //   query = query.eq("section", user.department)
    // }

    const { data: semester, error } = await query.single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Semester not found" }, { status: 404 })
      }
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch semester" }, { status: 500 })
    }

    return NextResponse.json(semester)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifySectionAdmin(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user!
    const resolvedParams = await params
    const semesterId = resolvedParams.id
    const body = await request.json()

    // First, check if the semester exists and user has permission
    let checkQuery = supabase
      .from("semesters")
      .select("id, section")
      .eq("id", semesterId)

    // TODO: Implement proper section filtering when section format is standardized
    // if (user.role === "section_admin" && user.department) {
    //   checkQuery = checkQuery.eq("section", user.department)
    // }

    const { data: existingSemester, error: checkError } = await checkQuery.single()

    if (checkError || !existingSemester) {
      return NextResponse.json({ error: "Semester not found or access denied" }, { status: 404 })
    }

    // Validate required fields
    const { semester, courses = [] } = body
    if (!semester || !semester.title || !semester.section) {
      return NextResponse.json(
        { error: "Missing required fields: title and section" },
        { status: 400 }
      )
    }

    // TODO: Implement proper section validation when section format is standardized
    // For now, allow section admins to update any semester
    // if (user.role === "section_admin" && user.department && semester.section !== user.department) {
    //   return NextResponse.json(
    //     { error: "You can only update semesters for your assigned section" },
    //     { status: 403 }
    //   )
    // }

    // Update semester
    const { data: updatedSemester, error: semesterError } = await supabase
      .from("semesters")
      .update({
        title: semester.title,
        description: semester.description || "",
        section: semester.section,
        has_midterm: semester.has_midterm ?? true,
        has_final: semester.has_final ?? true,
        start_date: semester.start_date || null,
        end_date: semester.end_date || null,
        default_credits: semester.default_credits || 3,
        is_active: semester.is_active ?? true,
        updated_at: new Date().toISOString()
      })
      .eq("id", semesterId)
      .select()
      .single()

    if (semesterError) {
      console.error("Error updating semester:", semesterError)
      return NextResponse.json(
        { error: "Failed to update semester" },
        { status: 500 }
      )
    }

    // Note: For a complete implementation, you would also handle updating courses, topics, etc.
    // This is a simplified version that only updates the semester basic info

    return NextResponse.json({
      success: true,
      semester: updatedSemester,
      message: "Semester updated successfully"
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifySectionAdmin(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const user = authResult.user!
    const resolvedParams = await params
    const semesterId = resolvedParams.id

    // First, check if the semester exists and user has permission
    let checkQuery = supabase
      .from("semesters")
      .select("id, section, title")
      .eq("id", semesterId)

    // TODO: Implement proper section filtering when section format is standardized
    // if (user.role === "section_admin" && user.department) {
    //   checkQuery = checkQuery.eq("section", user.department)
    // }

    const { data: existingSemester, error: checkError } = await checkQuery.single()

    if (checkError || !existingSemester) {
      return NextResponse.json({ error: "Semester not found or access denied" }, { status: 404 })
    }

    // Delete semester (this will cascade delete related courses, topics, etc. if foreign keys are set up properly)
    const { error: deleteError } = await supabase
      .from("semesters")
      .delete()
      .eq("id", semesterId)

    if (deleteError) {
      console.error("Error deleting semester:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete semester" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Semester "${existingSemester.title}" deleted successfully`
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

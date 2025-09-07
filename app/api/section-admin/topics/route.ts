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

    // Build query
    let query = supabase
      .from("topics")
      .select(`
        id,
        title,
        description,
        course_id,
        order_index,
        is_published,
        created_at,
        updated_at,
        courses!inner(
          id,
          title,
          semester_id,
          semesters!inner(section)
        )
      `)
      .order("order_index", { ascending: true })

    // Filter by course if provided
    if (courseId) {
      query = query.eq("course_id", courseId)
    }

    // Filter by department for section admins
    if (user.role === "section_admin" && user.department) {
      query = query.eq("courses.semesters.section", user.department)
    }

    const { data: topics, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
    }

    return NextResponse.json(topics || [])
  } catch (error) {
    console.error("GET /api/section-admin/topics error:", error)
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
    const { title, course_id } = body
    if (!title || !course_id) {
      return NextResponse.json(
        { error: "Missing required fields: title and course_id" },
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
        { error: "You can only create topics for courses in your assigned section" },
        { status: 403 }
      )
    }

    // Get the next order index
    const { data: lastTopic } = await supabase
      .from("topics")
      .select("order_index")
      .eq("course_id", course_id)
      .order("order_index", { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (lastTopic?.order_index || 0) + 1

    // Create topic
    const { data: newTopic, error: topicError } = await supabase
      .from("topics")
      .insert({
        title,
        description: body.description,
        course_id,
        order_index: body.order_index || nextOrderIndex,
        is_published: body.is_published !== undefined ? body.is_published : true
      })
      .select()
      .single()

    if (topicError) {
      console.error("Error creating topic:", topicError)
      return NextResponse.json({ error: "Failed to create topic" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      topic: newTopic,
      message: "Topic created successfully"
    })
  } catch (error) {
    console.error("POST /api/section-admin/topics error:", error)
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
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 })
    }

    // Verify topic exists and user has access
    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .select(`
        id,
        course_id,
        courses!inner(
          semesters!inner(section)
        )
      `)
      .eq("id", id)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    // Check if section admin can access this topic
    if (user.role === "section_admin" && user.department && topic.courses.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only update topics in your assigned section" },
        { status: 403 }
      )
    }

    // Update topic
    const { data: updatedTopic, error: updateError } = await supabase
      .from("topics")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating topic:", updateError)
      return NextResponse.json({ error: "Failed to update topic" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      topic: updatedTopic,
      message: "Topic updated successfully"
    })
  } catch (error) {
    console.error("PUT /api/section-admin/topics error:", error)
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
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 })
    }

    // Verify topic exists and user has access
    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .select(`
        id,
        course_id,
        courses!inner(
          semesters!inner(section)
        )
      `)
      .eq("id", id)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    // Check if section admin can access this topic
    if (user.role === "section_admin" && user.department && topic.courses.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only delete topics in your assigned section" },
        { status: 403 }
      )
    }

    // Delete topic
    const { error: deleteError } = await supabase
      .from("topics")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting topic:", deleteError)
      return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Topic deleted successfully"
    })
  } catch (error) {
    console.error("DELETE /api/section-admin/topics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const topicId = searchParams.get('topic_id')

    // Build query
    let query = supabase
      .from("slides")
      .select(`
        id,
        title,
        description,
        google_drive_url,
        topic_id,
        order_index,
        file_size_mb,
        slide_count,
        is_downloadable,
        created_at,
        updated_at,
        topics!inner(
          id,
          title,
          course_id,
          courses!inner(
            id,
            title,
            semester_id,
            semesters!inner(section)
          )
        )
      `)
      .order("order_index", { ascending: true })

    // Filter by topic if provided
    if (topicId) {
      query = query.eq("topic_id", topicId)
    }

    // Filter by department for section admins
    if (user.role === "section_admin" && user.department) {
      query = query.eq("topics.courses.semesters.section", user.department)
    }

    const { data: slides, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch slides" }, { status: 500 })
    }

    return NextResponse.json(slides || [])
  } catch (error) {
    console.error("GET /api/section-admin/slides error:", error)
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
    const { title, google_drive_url, topic_id } = body
    if (!title || !google_drive_url || !topic_id) {
      return NextResponse.json(
        { error: "Missing required fields: title, google_drive_url, and topic_id" },
        { status: 400 }
      )
    }

    // Validate Google Drive URL format
    const googleDriveRegex = /^https:\/\/(drive|docs|sheets|forms|sites|calendar|meet|classroom|photos|maps|translate|scholar|books|news|mail|youtube|blogger|plus|hangouts|keep|jamboard|earth|chrome|play|store|pay|ads|analytics|search|trends|alerts|groups|contacts|voice|duo|allo|spaces|currents|my|accounts|support|developers|cloud|firebase|colab|datastudio|optimize|tagmanager|marketingplatform|admob|adsense|doubleclick|googleadservices|googlesyndication|googletagmanager|googleusercontent|gstatic|googleapis|appspot|firebaseapp|web\.app|page\.link|goo\.gl|g\.co)\.google\.com\/.*/
    if (!googleDriveRegex.test(google_drive_url)) {
      return NextResponse.json(
        { error: "Invalid Google Drive URL format" },
        { status: 400 }
      )
    }

    // Verify topic exists and user has access
    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .select(`
        id,
        courses!inner(
          semesters!inner(section)
        )
      `)
      .eq("id", topic_id)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 })
    }

    // Check if section admin can access this topic
    if (user.role === "section_admin" && user.department && topic.courses.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only create slides for topics in your assigned section" },
        { status: 403 }
      )
    }

    // Get the next order index
    const { data: lastSlide } = await supabase
      .from("slides")
      .select("order_index")
      .eq("topic_id", topic_id)
      .order("order_index", { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (lastSlide?.order_index || 0) + 1

    // Create slide
    const { data: newSlide, error: slideError } = await supabase
      .from("slides")
      .insert({
        title,
        description: body.description,
        google_drive_url,
        topic_id,
        order_index: body.order_index || nextOrderIndex,
        file_size_mb: body.file_size_mb,
        slide_count: body.slide_count,
        is_downloadable: body.is_downloadable !== undefined ? body.is_downloadable : true
      })
      .select()
      .single()

    if (slideError) {
      console.error("Error creating slide:", slideError)
      return NextResponse.json({ error: "Failed to create slide" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      slide: newSlide,
      message: "Slide created successfully"
    })
  } catch (error) {
    console.error("POST /api/section-admin/slides error:", error)
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
      return NextResponse.json({ error: "Slide ID is required" }, { status: 400 })
    }

    // Verify slide exists and user has access
    const { data: slide, error: slideError } = await supabase
      .from("slides")
      .select(`
        id,
        topic_id,
        topics!inner(
          courses!inner(
            semesters!inner(section)
          )
        )
      `)
      .eq("id", id)
      .single()

    if (slideError || !slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 })
    }

    // Check if section admin can access this slide
    if (user.role === "section_admin" && user.department && slide.topics.courses.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only update slides in your assigned section" },
        { status: 403 }
      )
    }

    // Update slide
    const { data: updatedSlide, error: updateError } = await supabase
      .from("slides")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating slide:", updateError)
      return NextResponse.json({ error: "Failed to update slide" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      slide: updatedSlide,
      message: "Slide updated successfully"
    })
  } catch (error) {
    console.error("PUT /api/section-admin/slides error:", error)
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
      return NextResponse.json({ error: "Slide ID is required" }, { status: 400 })
    }

    // Verify slide exists and user has access
    const { data: slide, error: slideError } = await supabase
      .from("slides")
      .select(`
        id,
        topic_id,
        topics!inner(
          courses!inner(
            semesters!inner(section)
          )
        )
      `)
      .eq("id", id)
      .single()

    if (slideError || !slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 })
    }

    // Check if section admin can access this slide
    if (user.role === "section_admin" && user.department && slide.topics.courses.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only delete slides in your assigned section" },
        { status: 403 }
      )
    }

    // Delete slide
    const { error: deleteError } = await supabase
      .from("slides")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting slide:", deleteError)
      return NextResponse.json({ error: "Failed to delete slide" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Slide deleted successfully"
    })
  } catch (error) {
    console.error("DELETE /api/section-admin/slides error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
      .from("videos")
      .select(`
        id,
        title,
        description,
        youtube_url,
        topic_id,
        order_index,
        duration_minutes,
        video_quality,
        has_subtitles,
        language,
        is_published,
        view_count,
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

    const { data: videos, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
    }

    return NextResponse.json(videos || [])
  } catch (error) {
    console.error("GET /api/section-admin/videos error:", error)
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
    const { title, youtube_url, topic_id } = body
    if (!title || !youtube_url || !topic_id) {
      return NextResponse.json(
        { error: "Missing required fields: title, youtube_url, and topic_id" },
        { status: 400 }
      )
    }

    // Validate YouTube URL format
    const youtubeRegex = /^https:\/\/(www\.)?youtube\.com\/watch\?v=.*|^https:\/\/youtu\.be\/.*/
    if (!youtubeRegex.test(youtube_url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL format" },
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
        { error: "You can only create videos for topics in your assigned section" },
        { status: 403 }
      )
    }

    // Get the next order index
    const { data: lastVideo } = await supabase
      .from("videos")
      .select("order_index")
      .eq("topic_id", topic_id)
      .order("order_index", { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (lastVideo?.order_index || 0) + 1

    // Create video
    const { data: newVideo, error: videoError } = await supabase
      .from("videos")
      .insert({
        title,
        description: body.description,
        youtube_url,
        topic_id,
        order_index: body.order_index || nextOrderIndex,
        duration_minutes: body.duration_minutes,
        video_quality: body.video_quality,
        has_subtitles: body.has_subtitles || false,
        language: body.language || 'en',
        is_published: body.is_published !== undefined ? body.is_published : true
      })
      .select()
      .single()

    if (videoError) {
      console.error("Error creating video:", videoError)
      return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      video: newVideo,
      message: "Video created successfully"
    })
  } catch (error) {
    console.error("POST /api/section-admin/videos error:", error)
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
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // Verify video exists and user has access
    const { data: video, error: videoError } = await supabase
      .from("videos")
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

    if (videoError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if section admin can access this video
    if (user.role === "section_admin" && user.department && video.topics.courses.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only update videos in your assigned section" },
        { status: 403 }
      )
    }

    // Update video
    const { data: updatedVideo, error: updateError } = await supabase
      .from("videos")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating video:", updateError)
      return NextResponse.json({ error: "Failed to update video" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      video: updatedVideo,
      message: "Video updated successfully"
    })
  } catch (error) {
    console.error("PUT /api/section-admin/videos error:", error)
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
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // Verify video exists and user has access
    const { data: video, error: videoError } = await supabase
      .from("videos")
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

    if (videoError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if section admin can access this video
    if (user.role === "section_admin" && user.department && video.topics.courses.semesters.section !== user.department) {
      return NextResponse.json(
        { error: "You can only delete videos in your assigned section" },
        { status: 403 }
      )
    }

    // Delete video
    const { error: deleteError } = await supabase
      .from("videos")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting video:", deleteError)
      return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Video deleted successfully"
    })
  } catch (error) {
    console.error("DELETE /api/section-admin/videos error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

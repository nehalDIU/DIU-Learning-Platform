import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()

    const { data, error } = await supabase
      .from("slides")
      .select(`
        id,
        title,
        google_drive_url,
        description,
        file_size,
        order_index,
        topic_id,
        created_at,
        updated_at,
        topic:topics (
          id,
          title,
          course:courses (
            id,
            title,
            course_code,
            teacher_name,
            semester:semesters ( 
              id,
              title,
              section
            )
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Slide not found" }, { status: 404 })
      }
      console.error("[slides] GET error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data for consistent API response
    const transformedData = {
      id: data.id,
      title: data.title,
      url: data.google_drive_url,
      description: data.description,
      fileSize: data.file_size,
      type: "slide",
      orderIndex: data.order_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      topic: data.topic && data.topic[0] ? {
        id: data.topic[0].id,
        title: data.topic[0].title,
        course: data.topic[0].course && data.topic[0].course[0] ? {
          id: data.topic[0].course[0].id,
          title: data.topic[0].course[0].title,
          courseCode: data.topic[0].course[0].course_code,
          teacherName: data.topic[0].course[0].teacher_name,
          semester: data.topic[0].course[0].semester && data.topic[0].course[0].semester[0] ? {
            id: data.topic[0].course[0].semester[0].id,
            title: data.topic[0].course[0].semester[0].title,
            section: data.topic[0].course[0].semester[0].section,
            name: data.topic[0].course[0].semester[0].title
          } : null
        } : null
      } : null,
      // SEO and sharing metadata
      metadata: {
        title: data.topic?.[0]?.course?.[0]?.title ? `${data.title} - ${data.topic[0].course[0].title}` : data.title,
        description: data.description || `View ${data.title} slides${data.topic?.[0]?.course?.[0]?.title ? ` from ${data.topic[0].course[0].title} course` : ''}`,
        courseTitle: data.topic?.[0]?.course?.[0]?.title || null,
        topicTitle: data.topic?.[0]?.title || null,
        semesterTitle: data.topic?.[0]?.course?.[0]?.semester?.[0]?.title || null,
        teacherName: data.topic?.[0]?.course?.[0]?.teacher_name || null,
        shareUrl: `/slide/${data.id}`,
        embedUrl: data.google_drive_url
      }
    }

    return NextResponse.json(transformedData)
  } catch (err) {
    console.error("[slides] GET error:", err)
    console.error("[slides] Error details:", {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : 'No stack trace',
      id: params.id
    })
    return NextResponse.json({
      error: "Failed to fetch slide",
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}

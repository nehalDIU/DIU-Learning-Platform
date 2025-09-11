import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase"

interface VideoPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { id } = await params
  
  try {
    const supabase = createClient()
    const { data: video } = await supabase
      .from("videos")
      .select(`
        id,
        title,
        description,
        topic:topics (
          title,
          course:courses (
            title,
            course_code
          )
        )
      `)
      .eq("id", id)
      .single()

    if (video) {
      const courseTitle = video.topic?.course?.title
      const title = `${video.title}${courseTitle ? ` - ${courseTitle}` : ''} | DIU Learning Platform`
      const description = video.description || `Watch ${video.title}${courseTitle ? ` from ${courseTitle}` : ''}`
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'video.other',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
        }
      }
    }
  } catch (error) {
    console.error("Error generating metadata for video:", error)
  }

  return {
    title: "Video | DIU Learning Platform",
    description: "Watch educational videos on DIU Learning Platform"
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  try {
    const supabase = createClient()
    const { data: video, error } = await supabase
      .from("videos")
      .select("id, title")
      .eq("id", id)
      .single()

    if (error || !video) {
      notFound()
    }

    // Redirect to main page with the video URL
    redirect(`/?share_path=/video/${id}`)
  } catch (error) {
    console.error("Error loading video:", error)
    notFound()
  }
}

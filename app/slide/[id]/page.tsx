import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase"

interface SlidePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SlidePageProps): Promise<Metadata> {
  const { id } = await params
  
  try {
    const supabase = createClient()
    const { data: slide } = await supabase
      .from("slides")
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

    if (slide) {
      const courseTitle = slide.topic?.course?.title
      const title = `${slide.title}${courseTitle ? ` - ${courseTitle}` : ''} | DIU Learning Platform`
      const description = slide.description || `View ${slide.title} slides${courseTitle ? ` from ${courseTitle}` : ''}`
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
        }
      }
    }
  } catch (error) {
    console.error("Error generating metadata for slide:", error)
  }

  return {
    title: "Slide | DIU Learning Platform",
    description: "View educational slides on DIU Learning Platform"
  }
}

export default async function SlidePage({ params }: SlidePageProps) {
  const { id } = await params
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  try {
    const supabase = createClient()
    const { data: slide, error } = await supabase
      .from("slides")
      .select("id, title")
      .eq("id", id)
      .single()

    if (error || !slide) {
      notFound()
    }

    // Redirect to main page with the slide URL
    redirect(`/?share_path=/slide/${id}`)
  } catch (error) {
    console.error("Error loading slide:", error)
    notFound()
  }
}

import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase"

interface StudyToolPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: StudyToolPageProps): Promise<Metadata> {
  const { id } = await params
  
  try {
    const supabase = createClient()
    const { data: studyTool } = await supabase
      .from("study_tools")
      .select(`
        id,
        title,
        type,
        exam_type,
        course:courses (
          title,
          course_code
        )
      `)
      .eq("id", id)
      .single()

    if (studyTool) {
      const courseTitle = studyTool.course?.title
      const title = `${studyTool.title}${courseTitle ? ` - ${courseTitle}` : ''} | DIU Learning Platform`
      const description = `Access study materials for ${courseTitle || studyTool.title}`
      
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
    console.error("Error generating metadata for study tool:", error)
  }

  return {
    title: "Study Tool | DIU Learning Platform",
    description: "Access study materials on DIU Learning Platform"
  }
}

export default async function StudyToolPage({ params }: StudyToolPageProps) {
  const { id } = await params
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  try {
    const supabase = createClient()
    const { data: studyTool, error } = await supabase
      .from("study_tools")
      .select("id, title")
      .eq("id", id)
      .single()

    if (error || !studyTool) {
      notFound()
    }

    // Redirect to main page with the study tool URL
    redirect(`/?share_path=/study-tool/${id}`)
  } catch (error) {
    console.error("Error loading study tool:", error)
    notFound()
  }
}

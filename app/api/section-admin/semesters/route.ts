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

    // Get semesters with basic info first
    let query = supabase
      .from("semesters")
      .select("*")

    // If user is section admin (not super admin), filter by their section/department
    console.log(`🔍 User role: ${user.role}, department: ${user.department}`)
    // TODO: Implement proper section filtering when section format is standardized
    // For now, section admins can see all semesters
    // if (user.role === "section_admin" && user.department) {
    //   console.log(`🔍 Filtering semesters by section: ${user.department}`)
    //   query = query.eq("section", user.department)
    // }

    const { data: semesters, error } = await query
      .order("is_active", { ascending: false })
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch semesters" }, { status: 500 })
    }

    console.log(`📊 Found ${semesters?.length || 0} semesters after filtering`)
    if (semesters && semesters.length > 0) {
      console.log('📋 Semester sections:', semesters.map(s => `${s.title} (${s.section})`))
    }

    // Get counts for each semester
    const semestersWithCounts = await Promise.all(
      (semesters || []).map(async (semester) => {
        try {
          // Get courses count
          const { count: coursesCount } = await supabase
            .from("courses")
            .select("*", { count: "exact", head: true })
            .eq("semester_id", semester.id)

          // Get courses to find topics and study tools
          const { data: courses } = await supabase
            .from("courses")
            .select("id")
            .eq("semester_id", semester.id)

          let topicsCount = 0
          let studyResourcesCount = 0

          if (courses && courses.length > 0) {
            const courseIds = courses.map(c => c.id)

            // Get topics count
            const { count: tCount } = await supabase
              .from("topics")
              .select("*", { count: "exact", head: true })
              .in("course_id", courseIds)

            // Get study resources count
            const { count: srCount } = await supabase
              .from("study_tools")
              .select("*", { count: "exact", head: true })
              .in("course_id", courseIds)

            topicsCount = tCount || 0
            studyResourcesCount = srCount || 0
          }

          return {
            ...semester,
            courses_count: coursesCount || 0,
            topics_count: topicsCount,
            materials_count: topicsCount + studyResourcesCount,
            study_resources_count: studyResourcesCount,
            students_count: 0 // Placeholder
          }
        } catch (countError) {
          console.error("Error getting counts for semester:", semester.id, countError)
          return {
            ...semester,
            courses_count: 0,
            topics_count: 0,
            materials_count: 0,
            study_resources_count: 0,
            students_count: 0
          }
        }
      })
    )

    return NextResponse.json({ semesters: semestersWithCounts })
  } catch (error) {
    console.error("API error:", error)
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

    console.log('POST /api/section-admin/semesters - User:', user)
    console.log('POST /api/section-admin/semesters - Body:', body)

    // Validate required fields
    const { semester, courses = [] } = body
    if (!semester || !semester.title || !semester.section) {
      console.log('Validation failed: Missing required fields')
      return NextResponse.json(
        { error: "Missing required fields: title and section" },
        { status: 400 }
      )
    }

    // For section admin, ensure they can only create semesters for their section
    // Temporarily disabled for testing
    // if (user.role === "section_admin" && user.department && semester.section !== user.department) {
    //   console.log(`Section mismatch: user.department=${user.department}, semester.section=${semester.section}`)
    //   return NextResponse.json(
    //     { error: "You can only create semesters for your assigned section" },
    //     { status: 403 }
    //   )
    // }

    // Start a transaction to create semester and courses
    const { data: newSemester, error: semesterError } = await supabase
      .from("semesters")
      .insert({
        title: semester.title,
        description: semester.description || "",
        section: semester.section,
        has_midterm: semester.has_midterm ?? true,
        has_final: semester.has_final ?? true,
        start_date: semester.start_date || null,
        end_date: semester.end_date || null,
        default_credits: semester.default_credits || 3,
        is_active: semester.is_active ?? true
      })
      .select()
      .single()

    if (semesterError) {
      console.error("Error creating semester:", semesterError)
      return NextResponse.json(
        { error: `Failed to create semester: ${semesterError.message}` },
        { status: 500 }
      )
    }

    console.log('Semester created successfully:', newSemester)

    // Create courses if provided
    if (courses.length > 0) {
      const coursesToInsert = courses.map((course: any) => ({
        semester_id: newSemester.id,
        title: course.title,
        course_code: course.course_code,
        teacher_name: course.teacher_name,
        teacher_email: course.teacher_email || null,
        credits: course.credits || semester.default_credits || 3,
        description: course.description || "",
        is_highlighted: course.is_highlighted || false
      }))

      const { data: newCourses, error: coursesError } = await supabase
        .from("courses")
        .insert(coursesToInsert)
        .select()

      if (coursesError) {
        console.error("Error creating courses:", coursesError)
        // Note: In production, you might want to rollback the semester creation
      }

      // Create topics and study tools for each course
      for (const [index, course] of courses.entries()) {
        if (newCourses && newCourses[index]) {
          const courseId = newCourses[index].id
          console.log(`Processing course ${index + 1}:`, {
            courseId,
            topicsCount: course.topics?.length || 0,
            studyResourcesCount: course.study_resources?.length || 0
          })

          // Create topics
          if (course.topics && course.topics.length > 0) {
            const topicsToInsert = course.topics.map((topic: any, topicIndex: number) => ({
              course_id: courseId,
              title: topic.title,
              description: topic.description || "",
              order_index: topic.order_index ?? topicIndex
            }))

            console.log(`Creating ${topicsToInsert.length} topics for course ${courseId}:`, topicsToInsert)

            const { data: newTopics, error: topicsError } = await supabase
              .from("topics")
              .insert(topicsToInsert)
              .select()

            if (topicsError) {
              console.error("Error creating topics:", topicsError)
            } else if (newTopics) {
              // Create slides and videos for each topic
              for (const [topicIndex, topic] of course.topics.entries()) {
                const topicId = newTopics[topicIndex]?.id

                if (topicId) {
                  // Create slides
                  if (topic.slides && topic.slides.length > 0) {
                    const slidesToInsert = topic.slides.map((slide: any, slideIndex: number) => ({
                      topic_id: topicId,
                      title: slide.title,
                      google_drive_url: slide.google_drive_url || slide.url,
                      description: slide.description || "",
                      order_index: slide.order_index ?? slideIndex
                    }))

                    const { error: slidesError } = await supabase.from("slides").insert(slidesToInsert)
                    if (slidesError) {
                      console.error("Error creating slides:", slidesError)
                    }
                  }

                  // Create videos
                  if (topic.videos && topic.videos.length > 0) {
                    const videosToInsert = topic.videos.map((video: any, videoIndex: number) => ({
                      topic_id: topicId,
                      title: video.title,
                      youtube_url: video.youtube_url || video.url,
                      description: video.description || "",
                      order_index: video.order_index ?? videoIndex
                    }))

                    const { error: videosError } = await supabase.from("videos").insert(videosToInsert)
                    if (videosError) {
                      console.error("Error creating videos:", videosError)
                    }
                  }
                }
              }
            }
          }

          // Create study tools
          console.log(`Checking study resources for course ${courseId}:`, {
            hasStudyResources: !!course.study_resources,
            studyResourcesLength: course.study_resources?.length || 0,
            studyResourcesData: course.study_resources
          })

          if (course.study_resources && course.study_resources.length > 0) {
            const studyToolsToInsert = course.study_resources.map((tool: any) => ({
              course_id: courseId,
              title: tool.title,
              type: tool.type,
              content_url: (tool.content_url === 'text' || tool.content_url === 'file') ? null : (tool.content_url || tool.url),
              exam_type: tool.exam_type || 'both',
              description: tool.description || ""
            }))

            console.log(`Creating ${studyToolsToInsert.length} study resources for course ${courseId}:`, studyToolsToInsert)

            const { data: newStudyTools, error: studyToolsError } = await supabase
              .from("study_tools")
              .insert(studyToolsToInsert)
              .select()

            if (studyToolsError) {
              console.error("❌ Error creating study tools:", studyToolsError)
            } else {
              console.log("✅ Successfully created study tools:", newStudyTools)
            }
          } else {
            console.log(`⚠️ No study resources found for course ${courseId}`)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      semester: newSemester,
      message: "Semester created successfully"
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

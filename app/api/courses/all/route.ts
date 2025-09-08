import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: courses, error } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        course_code,
        teacher_name,
        teacher_email,
        description,
        credits,
        is_highlighted,
        is_active,
        created_at,
        updated_at,
        semester:semesters (
          id,
          title,
          section,
          is_active
        )
      `)
      .eq("is_active", true)
      .eq("semesters.is_active", true)
      .order("is_highlighted", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching courses:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(courses || [])
  } catch (error) {
    console.error("Unexpected error fetching courses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

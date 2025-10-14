import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batch: string }> }
) {
  try {
    const { batch } = await params
    const supabase = createClient()

    // Validate batch parameter
    if (!batch || !/^\d+$/.test(batch)) {
      return NextResponse.json(
        { error: "Invalid batch number. Must be a numeric value." },
        { status: 400 }
      )
    }

    // Fetch all active semesters
    const { data: semesters, error } = await supabase
      .from("semesters")
      .select("id, title, section, is_active, description, created_at, updated_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching semesters:", error)
      return NextResponse.json(
        { error: "Failed to fetch semesters" },
        { status: 500 }
      )
    }

    // Filter semesters by batch number
    // Section format is expected to be "batch_section" (e.g., "63_A", "64_B")
    const filteredSemesters = semesters?.filter(semester => {
      if (!semester.section) return false
      
      const [semesterBatch] = semester.section.split('_')
      return semesterBatch === batch
    }) || []

    // Sort by section for consistent ordering
    filteredSemesters.sort((a, b) => {
      if (a.section && b.section) {
        return a.section.localeCompare(b.section)
      }
      return 0
    })

    return NextResponse.json({
      batch,
      semesters: filteredSemesters,
      count: filteredSemesters.length
    })
  } catch (error) {
    console.error("Error in batch semesters API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

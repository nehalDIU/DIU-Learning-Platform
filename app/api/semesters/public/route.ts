import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    // Fetch all active semesters with their sections
    const { data: semesters, error } = await supabase
      .from("semesters")
      .select("id, title, section, is_active, description")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching semesters:", error)
      return NextResponse.json(
        { error: "Failed to fetch sections" },
        { status: 500 }
      )
    }

    return NextResponse.json(semesters || [])
  } catch (error) {
    console.error("Error in public semesters API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("Slides API called with ID:", id)

  try {
    console.log("Creating Supabase client...")
    
    const supabase = createClient()
    console.log("Supabase client created successfully")

    console.log("Querying slides table...")
    const { data, error } = await supabase
      .from("slides")
      .select("id, title, google_drive_url, description")
      .eq("id", id)
      .single()

    console.log("Query result:", { data, error })

    if (error) {
      console.error("Supabase error:", error)
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Slide not found" }, { status: 404 })
      }
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error
      }, { status: 500 })
    }

    if (!data) {
      console.log("No data returned")
      return NextResponse.json({ error: "Slide not found" }, { status: 404 })
    }

    console.log("Returning slide data:", data)
    
    // Simple response format
    const response = {
      id: data.id,
      title: data.title,
      url: data.google_drive_url,
      description: data.description,
      type: "slide"
    }

    return NextResponse.json(response)
    
  } catch (err) {
    console.error("API Error:", err)
    return NextResponse.json({ 
      error: "Failed to fetch slide",
      details: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : 'No stack trace'
    }, { status: 500 })
  }
}

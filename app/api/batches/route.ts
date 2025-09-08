import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    // Fetch all active semesters to extract unique batches
    const { data: semesters, error } = await supabase
      .from("semesters")
      .select("section, title")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching semesters:", error)
      return NextResponse.json(
        { error: "Failed to fetch batches" },
        { status: 500 }
      )
    }

    // Extract unique batches from section format (e.g., "63_G" -> "63")
    const batchesSet = new Set<string>()
    const batchData: { [key: string]: { batch: string, sections: string[], sampleTitle: string } } = {}

    semesters?.forEach(semester => {
      if (semester.section) {
        const [batch] = semester.section.split('_')
        if (batch) {
          batchesSet.add(batch)
          
          if (!batchData[batch]) {
            batchData[batch] = {
              batch,
              sections: [],
              sampleTitle: semester.title || ''
            }
          }
          
          // Add section letter if not already present
          const [, sectionLetter] = semester.section.split('_')
          if (sectionLetter && !batchData[batch].sections.includes(sectionLetter)) {
            batchData[batch].sections.push(sectionLetter)
          }
        }
      }
    })

    // Convert to array and sort by batch number (descending - newest first)
    const batches = Array.from(batchesSet)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map(batch => ({
        batch,
        sections: batchData[batch].sections.sort(),
        sampleTitle: batchData[batch].sampleTitle,
        displayName: `Batch ${batch}`
      }))

    return NextResponse.json(batches)
  } catch (error) {
    console.error("Error in batches API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

// Mock study resources data
const mockStudyResources = {
  "sample-course-1": [
    {
      id: "resource-1",
      title: "Data Mining Textbook - Chapter 1-5",
      type: "PDF",
      content_url: "https://example.com/textbook.pdf",
      exam_type: "Midterm",
      is_downloadable: true,
      created_at: "2024-01-20T10:00:00Z"
    },
    {
      id: "resource-2", 
      title: "Machine Learning Practice Problems",
      type: "Exercise Set",
      content_url: "https://example.com/exercises.pdf",
      exam_type: "Final",
      is_downloadable: true,
      created_at: "2024-02-15T14:30:00Z"
    },
    {
      id: "resource-3",
      title: "Online Data Mining Simulator",
      type: "Interactive Tool",
      content_url: "https://example.com/simulator",
      is_downloadable: false,
      created_at: "2024-02-28T09:15:00Z"
    }
  ],
  "sample-course-2": [
    {
      id: "resource-db-1",
      title: "Database Design Guidelines",
      type: "PDF",
      content_url: "https://example.com/db-design.pdf",
      exam_type: "Midterm",
      is_downloadable: true,
      created_at: "2024-03-01T11:00:00Z"
    },
    {
      id: "resource-db-2",
      title: "Big Data Processing Framework Comparison",
      type: "Research Paper",
      content_url: "https://example.com/bigdata-comparison.pdf",
      is_downloadable: true,
      created_at: "2024-03-05T16:20:00Z"
    }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const resources = mockStudyResources[id as keyof typeof mockStudyResources] || []
  
  return NextResponse.json(resources)
}

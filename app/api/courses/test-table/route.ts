import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log('Testing if user_course_enrollments table exists...')

    // Try to query the table
    const { data, error } = await supabase
      .from('user_course_enrollments')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.log('Table does not exist:', error.message)
      return NextResponse.json({ 
        tableExists: false,
        error: error.message,
        message: 'Table does not exist. Please create it manually using the SQL script.'
      })
    }

    console.log('Table exists!')
    
    // Get some sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from('user_course_enrollments')
      .select('*')
      .limit(5)

    return NextResponse.json({ 
      tableExists: true,
      message: 'Table exists and is accessible',
      sampleCount: sampleData?.length || 0,
      sampleData: sampleData || []
    })

  } catch (error) {
    console.error('Unexpected error testing table:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

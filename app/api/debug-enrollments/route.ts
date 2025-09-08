import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get all enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('user_course_enrollments')
      .select(`
        id,
        user_id,
        course_id,
        status,
        progress_percentage,
        enrollment_date,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (enrollmentsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch enrollments',
        details: enrollmentsError.message 
      }, { status: 500 })
    }

    // Get course details for the enrollments
    const courseIds = enrollments?.map(e => e.course_id) || []
    let courses = []
    
    if (courseIds.length > 0) {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, course_code')
        .in('id', courseIds)

      if (!coursesError) {
        courses = coursesData || []
      }
    }

    // Combine enrollment and course data
    const enrichedEnrollments = enrollments?.map(enrollment => ({
      ...enrollment,
      course: courses.find(c => c.id === enrollment.course_id)
    })) || []

    return NextResponse.json({
      totalEnrollments: enrollments?.length || 0,
      enrollments: enrichedEnrollments,
      uniqueUsers: [...new Set(enrollments?.map(e => e.user_id) || [])].length,
      uniqueCourses: [...new Set(enrollments?.map(e => e.course_id) || [])].length
    })

  } catch (error) {
    console.error('Debug enrollments error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    // Clean up test enrollments (users starting with 'test_' or 'demo_')
    const { data: deletedEnrollments, error: deleteError } = await supabase
      .from('user_course_enrollments')
      .delete()
      .or('user_id.like.test_%,user_id.like.demo_%,user_id.like.quick_%,user_id.like.init_%')
      .select()

    if (deleteError) {
      return NextResponse.json({ 
        error: 'Failed to clean up test enrollments',
        details: deleteError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Test enrollments cleaned up successfully',
      deletedCount: deletedEnrollments?.length || 0,
      deletedEnrollments
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

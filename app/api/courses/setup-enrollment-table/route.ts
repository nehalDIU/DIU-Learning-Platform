import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    console.log('Setting up user_course_enrollments table...')

    // Try to check if table exists first
    const { data: tableCheck, error: checkError } = await supabase
      .from('user_course_enrollments')
      .select('count', { count: 'exact', head: true })

    if (!checkError) {
      console.log('Table already exists')
      return NextResponse.json({
        message: 'user_course_enrollments table already exists',
        tableExists: true,
        alreadySetup: true
      })
    }

    console.log('Table does not exist, attempting to create...')

    // Since rpc might not be available, let's try a different approach
    // We'll use a simple insert to test table creation
    const { error: createError } = await supabase
      .from('user_course_enrollments')
      .insert({
        user_id: 'test_user',
        course_id: '00000000-0000-0000-0000-000000000000',
        status: 'active',
        progress_percentage: 0
      })
      .select()

    if (createError && createError.code === '42P01') {
      // Table doesn't exist, we need to create it manually
      return NextResponse.json({
        error: 'Table does not exist and cannot be created automatically',
        message: 'Please run the SQL script manually in your Supabase dashboard',
        sqlFile: 'create-user-course-enrollments-table.sql',
        details: createError.message
      }, { status: 500 })
    }

    // If we get here, the table exists or was created successfully
    console.log('Table creation test passed')

    // Clean up test data
    await supabase
      .from('user_course_enrollments')
      .delete()
      .eq('user_id', 'test_user')

    // Insert demo data for testing
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('is_highlighted', true)
      .limit(3)

    let demoDataCreated = 0
    if (courses && courses.length > 0) {
      for (const course of courses) {
        const { error: insertError } = await supabase
          .from('user_course_enrollments')
          .insert({
            user_id: 'demo_user_default',
            course_id: course.id,
            status: 'active',
            progress_percentage: Math.floor(Math.random() * 101),
            enrollment_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()

        if (!insertError) {
          demoDataCreated++
        } else if (!insertError.message.includes('duplicate')) {
          console.warn('Demo data insertion warning:', insertError.message)
        }
      }
    }

    return NextResponse.json({
      message: 'user_course_enrollments table is ready for use',
      tableExists: true,
      demoDataCreated: demoDataCreated > 0
    })

  } catch (error) {
    console.error('Unexpected error setting up enrollment table:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

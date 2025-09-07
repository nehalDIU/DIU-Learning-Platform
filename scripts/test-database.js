const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDatabase() {
  try {
    console.log('🔍 Testing database connectivity and structure...\n')

    // 1. Check semesters
    console.log('1. Checking semesters table:')
    const { data: semesters, error: semestersError } = await supabase
      .from('semesters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    if (semestersError) {
      console.error('❌ Error fetching semesters:', semestersError)
    } else {
      console.log(`✅ Found ${semesters.length} semesters`)
      semesters.forEach(semester => {
        console.log(`   - ${semester.title} (${semester.section}) - ${semester.id}`)
      })
    }

    // 2. Check courses
    console.log('\n2. Checking courses table:')
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError)
    } else {
      console.log(`✅ Found ${courses.length} courses`)
      courses.forEach(course => {
        console.log(`   - ${course.title} (${course.course_code}) - Semester: ${course.semester_id}`)
      })
    }

    // 3. Check topics
    console.log('\n3. Checking topics table:')
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (topicsError) {
      console.error('❌ Error fetching topics:', topicsError)
    } else {
      console.log(`✅ Found ${topics.length} topics`)
      topics.forEach(topic => {
        console.log(`   - ${topic.title} - Course: ${topic.course_id}`)
      })
    }

    // 4. Check slides
    console.log('\n4. Checking slides table:')
    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (slidesError) {
      console.error('❌ Error fetching slides:', slidesError)
    } else {
      console.log(`✅ Found ${slides.length} slides`)
      slides.forEach(slide => {
        console.log(`   - ${slide.title} - Topic: ${slide.topic_id}`)
      })
    }

    // 5. Check videos
    console.log('\n5. Checking videos table:')
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (videosError) {
      console.error('❌ Error fetching videos:', videosError)
    } else {
      console.log(`✅ Found ${videos.length} videos`)
      videos.forEach(video => {
        console.log(`   - ${video.title} - Topic: ${video.topic_id}`)
      })
    }

    // 6. Check study_tools (study resources)
    console.log('\n6. Checking study_tools table:')
    const { data: studyTools, error: studyToolsError } = await supabase
      .from('study_tools')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (studyToolsError) {
      console.error('❌ Error fetching study_tools:', studyToolsError)
    } else {
      console.log(`✅ Found ${studyTools.length} study resources`)
      studyTools.forEach(tool => {
        console.log(`   - ${tool.title} (${tool.type}) - Course: ${tool.course_id}`)
      })
    }

    // 7. Test inserting a study resource
    console.log('\n7. Testing study resource insertion:')
    
    // First get a course ID to test with
    if (courses.length > 0) {
      const testCourseId = courses[0].id
      console.log(`Using course ID: ${testCourseId}`)

      const testStudyResource = {
        course_id: testCourseId,
        title: 'Test Study Resource',
        type: 'previous_questions',
        content_url: 'https://example.com/test.pdf',
        exam_type: 'both',
        description: 'Test study resource for debugging'
      }

      const { data: newStudyResource, error: insertError } = await supabase
        .from('study_tools')
        .insert(testStudyResource)
        .select()

      if (insertError) {
        console.error('❌ Error inserting test study resource:', insertError)
      } else {
        console.log('✅ Successfully inserted test study resource:', newStudyResource)
        
        // Clean up - delete the test resource
        await supabase
          .from('study_tools')
          .delete()
          .eq('id', newStudyResource[0].id)
        console.log('🧹 Cleaned up test study resource')
      }
    } else {
      console.log('⚠️ No courses found to test study resource insertion')
    }

    console.log('\n🎉 Database test completed!')

  } catch (error) {
    console.error('💥 Database test failed:', error)
  }
}

testDatabase()

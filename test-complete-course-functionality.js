const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Course Creation Flow');
  console.log('=====================================\n');

  try {
    // Step 1: Create a test semester
    console.log('📚 Step 1: Creating test semester...');
    const semesterData = {
      title: 'Fall 2024 - Test Semester',
      description: 'Test semester for course functionality',
      section: 'CSE',
      has_midterm: true,
      has_final: true,
      start_date: '2024-01-15',
      end_date: '2024-05-15',
      default_credits: 3,
      is_active: true
    };

    const { data: semester, error: semesterError } = await supabase
      .from('semesters')
      .insert(semesterData)
      .select()
      .single();

    if (semesterError) {
      throw new Error(`Failed to create semester: ${semesterError.message}`);
    }

    console.log('✅ Semester created:', semester.title);
    console.log('   ID:', semester.id);

    // Step 2: Create a test course
    console.log('\n📖 Step 2: Creating test course...');
    const courseData = {
      title: 'Advanced Web Development',
      course_code: 'CSE-422',
      teacher_name: 'Dr. Jane Smith',
      teacher_email: 'jane.smith@diu.edu.bd',
      description: 'Advanced concepts in web development including React, Node.js, and databases',
      credits: 3,
      semester_id: semester.id,
      is_active: true
    };

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    if (courseError) {
      throw new Error(`Failed to create course: ${courseError.message}`);
    }

    console.log('✅ Course created:', course.title);
    console.log('   ID:', course.id);
    console.log('   Code:', course.course_code);

    // Step 3: Create test topics
    console.log('\n📝 Step 3: Creating test topics...');
    const topicsData = [
      {
        title: 'Introduction to React',
        description: 'Learn the basics of React components and JSX',
        course_id: course.id,
        order_index: 0,
        difficulty_level: 'beginner',
        is_published: true
      },
      {
        title: 'State Management with Redux',
        description: 'Advanced state management patterns',
        course_id: course.id,
        order_index: 1,
        difficulty_level: 'intermediate',
        is_published: true
      }
    ];

    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .insert(topicsData)
      .select();

    if (topicsError) {
      throw new Error(`Failed to create topics: ${topicsError.message}`);
    }

    console.log('✅ Topics created:', topics.length);
    topics.forEach((topic, index) => {
      console.log(`   ${index + 1}. ${topic.title} (ID: ${topic.id})`);
    });

    // Step 4: Create test slides
    console.log('\n🖼️ Step 4: Creating test slides...');
    const slidesData = [
      {
        title: 'React Basics Slides',
        description: 'Introduction to React components',
        google_drive_url: 'https://drive.google.com/file/d/1234567890/view',
        topic_id: topics[0].id,
        order_index: 0
      },
      {
        title: 'JSX Syntax Guide',
        description: 'Complete guide to JSX syntax',
        google_drive_url: 'https://drive.google.com/file/d/0987654321/view',
        topic_id: topics[0].id,
        order_index: 1
      }
    ];

    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .insert(slidesData)
      .select();

    if (slidesError) {
      throw new Error(`Failed to create slides: ${slidesError.message}`);
    }

    console.log('✅ Slides created:', slides.length);
    slides.forEach((slide, index) => {
      console.log(`   ${index + 1}. ${slide.title} (ID: ${slide.id})`);
    });

    // Step 5: Create test videos
    console.log('\n🎥 Step 5: Creating test videos...');
    const videosData = [
      {
        title: 'React Tutorial - Getting Started',
        description: 'Complete beginner tutorial for React',
        youtube_url: 'https://youtube.com/watch?v=abc123',
        topic_id: topics[0].id,
        order_index: 0,
        duration_minutes: 45,
        is_published: true
      },
      {
        title: 'Redux State Management',
        description: 'Advanced Redux patterns and best practices',
        youtube_url: 'https://youtube.com/watch?v=def456',
        topic_id: topics[1].id,
        order_index: 0,
        duration_minutes: 60,
        is_published: true
      }
    ];

    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .insert(videosData)
      .select();

    if (videosError) {
      throw new Error(`Failed to create videos: ${videosError.message}`);
    }

    console.log('✅ Videos created:', videos.length);
    videos.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.title} (ID: ${video.id})`);
    });

    // Step 6: Create test study resources
    console.log('\n📚 Step 6: Creating test study resources...');
    const studyResourcesData = [
      {
        title: 'Midterm Exam Notes',
        description: 'Comprehensive notes for midterm preparation',
        type: 'exam_note',
        content_url: 'https://drive.google.com/file/d/notes123/view',
        course_id: course.id,
        exam_type: 'midterm'
      },
      {
        title: 'Previous Year Questions',
        description: 'Collection of previous year exam questions',
        type: 'previous_questions',
        content_url: 'https://drive.google.com/file/d/questions456/view',
        course_id: course.id,
        exam_type: 'both'
      },
      {
        title: 'Course Syllabus',
        description: 'Complete course syllabus and learning outcomes',
        type: 'syllabus',
        content_url: null,
        course_id: course.id,
        exam_type: 'both'
      }
    ];

    const { data: studyResources, error: studyResourcesError } = await supabase
      .from('study_tools')
      .insert(studyResourcesData)
      .select();

    if (studyResourcesError) {
      throw new Error(`Failed to create study resources: ${studyResourcesError.message}`);
    }

    console.log('✅ Study resources created:', studyResources.length);
    studyResources.forEach((resource, index) => {
      console.log(`   ${index + 1}. ${resource.title} (Type: ${resource.type}, ID: ${resource.id})`);
    });

    // Step 7: Verify the complete structure
    console.log('\n🔍 Step 7: Verifying complete structure...');
    
    // Get semester with all nested data
    const { data: fullSemester, error: fetchError } = await supabase
      .from('semesters')
      .select(`
        *,
        courses (
          *,
          topics (
            *,
            slides (*),
            videos (*)
          ),
          study_tools (*)
        )
      `)
      .eq('id', semester.id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch complete structure: ${fetchError.message}`);
    }

    console.log('✅ Complete structure verified:');
    console.log(`   📚 Semester: ${fullSemester.title}`);
    console.log(`   📖 Courses: ${fullSemester.courses.length}`);
    
    fullSemester.courses.forEach((course, courseIndex) => {
      console.log(`     ${courseIndex + 1}. ${course.title} (${course.course_code})`);
      console.log(`        📝 Topics: ${course.topics.length}`);
      
      course.topics.forEach((topic, topicIndex) => {
        console.log(`          ${topicIndex + 1}. ${topic.title}`);
        console.log(`             🖼️ Slides: ${topic.slides.length}`);
        console.log(`             🎥 Videos: ${topic.videos.length}`);
      });
      
      console.log(`        📚 Study Resources: ${course.study_tools.length}`);
      course.study_tools.forEach((resource, resourceIndex) => {
        console.log(`          ${resourceIndex + 1}. ${resource.title} (${resource.type})`);
      });
    });

    console.log('\n🎉 SUCCESS: All functionality is working correctly!');
    console.log('\n📋 Test Summary:');
    console.log(`   ✅ Semester created: ${semester.title}`);
    console.log(`   ✅ Course created: ${course.title} (${course.course_code})`);
    console.log(`   ✅ Topics created: ${topics.length}`);
    console.log(`   ✅ Slides created: ${slides.length}`);
    console.log(`   ✅ Videos created: ${videos.length}`);
    console.log(`   ✅ Study resources created: ${studyResources.length}`);
    console.log('\n🌐 You can now test the UI at: http://localhost:3000/SectionAdmin/semester-management');

    return {
      semester,
      course,
      topics,
      slides,
      videos,
      studyResources
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testCompleteFlow()
    .then(() => {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCompleteFlow };

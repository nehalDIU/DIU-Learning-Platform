const fetch = require('node-fetch')

async function testAPIDirectly() {
  try {
    console.log('🧪 Testing API endpoint directly...\n')

    // Test data that matches what the UI should send
    const testData = {
      semester: {
        title: "Fall 2024 - API Test",
        description: "Test semester via API",
        section: "CS-A",
        has_midterm: true,
        has_final: true,
        start_date: null,
        end_date: null,
        default_credits: 3,
        is_active: true
      },
      courses: [
        {
          title: "Test Course",
          course_code: "TEST101",
          teacher_name: "Dr. Test",
          teacher_email: "test@diu.edu.bd",
          description: "Test course for API testing",
          credits: 3,
          is_active: true,
          topics: [
            {
              title: "Test Topic",
              description: "Test topic description",
              order_index: 0,
              slides: [
                {
                  title: "Test Slide",
                  google_drive_url: "https://drive.google.com/file/d/test123/view",
                  description: "Test slide description",
                  order_index: 0
                }
              ],
              videos: [
                {
                  title: "Test Video",
                  youtube_url: "https://www.youtube.com/watch?v=test123",
                  description: "Test video description",
                  order_index: 0
                }
              ]
            }
          ],
          study_resources: [
            {
              title: "Test Study Resource",
              type: "previous_questions",
              content_url: "https://example.com/test-resource.pdf",
              exam_type: "both",
              description: "Test study resource description"
            },
            {
              title: "Test Exam Note",
              type: "exam_note",
              content_url: "https://example.com/test-note.pdf",
              exam_type: "final",
              description: "Test exam note description"
            }
          ]
        }
      ]
    }

    console.log('📤 Sending test data to API:')
    console.log('Study resources count:', testData.courses[0].study_resources.length)
    console.log('Study resources:', JSON.stringify(testData.courses[0].study_resources, null, 2))

    // Make the API call
    const response = await fetch('http://localhost:3001/api/section-admin/semesters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This won't work without proper authentication, but we can see the logs
      },
      body: JSON.stringify(testData),
    })

    console.log('\n📥 API Response:')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)

    const responseText = await response.text()
    console.log('Response Body:', responseText)

    if (response.status === 401) {
      console.log('\n⚠️ Authentication required - this is expected')
      console.log('Check the server logs to see if the data was processed correctly')
    }

  } catch (error) {
    console.error('💥 API test failed:', error)
  }
}

testAPIDirectly()

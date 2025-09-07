const fetch = require('node-fetch')

async function testAPI() {
  try {
    // First login to get the token
    const loginResponse = await fetch('http://localhost:3001/api/auth/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nehal@diu.edu.bd',
        password: 'admin123' // This might not work, but let's try
      }),
    })

    console.log('Login response status:', loginResponse.status)
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.log('Login failed:', errorText)
      return
    }

    const loginData = await loginResponse.json()
    console.log('Login successful:', loginData)

    // Get the cookie from the response
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('Cookies:', cookies)

    // Test creating a semester
    const semesterData = {
      semester: {
        title: "Fall 2024 - Test",
        description: "Test semester",
        section: "CS-A",
        has_midterm: true,
        has_final: true,
        start_date: null,
        end_date: null,
        default_credits: 3,
        is_active: true
      },
      courses: []
    }

    const createResponse = await fetch('http://localhost:3001/api/section-admin/semesters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify(semesterData),
    })

    console.log('Create semester response status:', createResponse.status)
    const createText = await createResponse.text()
    console.log('Create semester response:', createText)

  } catch (error) {
    console.error('Test error:', error)
  }
}

testAPI()

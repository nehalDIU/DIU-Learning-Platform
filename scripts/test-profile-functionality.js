const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDatabaseSchema() {
  console.log('🔍 Testing database schema...')
  
  try {
    // Test if new columns exist
    const { data, error } = await supabase
      .from('admin_users')
      .select(`
        id,
        profile_photo_url,
        bio,
        social_media_links,
        address,
        date_of_birth,
        website_url,
        linkedin_url,
        twitter_url,
        facebook_url,
        instagram_url,
        github_url,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        office_location,
        office_hours,
        specializations,
        languages_spoken,
        education_background,
        certifications,
        profile_visibility,
        show_email,
        show_phone,
        allow_student_contact,
        notification_preferences
      `)
      .limit(1)
    
    if (error) {
      console.error('❌ Schema test failed:', error.message)
      return false
    }
    
    console.log('✅ Database schema is correct')
    return true
  } catch (error) {
    console.error('❌ Schema test error:', error.message)
    return false
  }
}

async function testStorageBucket() {
  console.log('🔍 Testing storage bucket...')
  
  try {
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Storage bucket test failed:', error.message)
      return false
    }
    
    const profileBucket = data.find(bucket => bucket.id === 'profile-photos')
    
    if (!profileBucket) {
      console.error('❌ Profile photos bucket not found')
      return false
    }
    
    console.log('✅ Storage bucket exists:', profileBucket.name)
    console.log(`   Public: ${profileBucket.public}`)
    return true
  } catch (error) {
    console.error('❌ Storage bucket test error:', error.message)
    return false
  }
}

async function testProfileUpdate() {
  console.log('🔍 Testing profile update functionality...')
  
  try {
    // Get first admin user
    const { data: users, error: userError } = await supabase
      .from('admin_users')
      .select('id, email, full_name')
      .limit(1)
    
    if (userError || !users || users.length === 0) {
      console.error('❌ No admin users found for testing')
      return false
    }
    
    const testUser = users[0]
    console.log(`   Testing with user: ${testUser.email}`)
    
    // Test profile update
    const testData = {
      bio: 'Test bio updated by migration script',
      website_url: 'https://example.com',
      linkedin_url: 'https://linkedin.com/in/testuser',
      specializations: ['Computer Science', 'Education'],
      languages_spoken: ['English', 'Bengali'],
      profile_visibility: 'department',
      show_email: false,
      show_phone: false,
      allow_student_contact: true,
      notification_preferences: {
        email_notifications: true,
        push_notifications: true,
        weekly_reports: false,
        semester_updates: true,
        student_activity: false
      }
    }
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('admin_users')
      .update(testData)
      .eq('id', testUser.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Profile update failed:', updateError.message)
      return false
    }
    
    console.log('✅ Profile update successful')
    console.log(`   Bio: ${updatedUser.bio}`)
    console.log(`   Website: ${updatedUser.website_url}`)
    console.log(`   Specializations: ${updatedUser.specializations?.join(', ') || 'None'}`)
    
    return true
  } catch (error) {
    console.error('❌ Profile update test error:', error.message)
    return false
  }
}

async function testPublicProfileView() {
  console.log('🔍 Testing public profile view...')
  
  try {
    const { data, error } = await supabase
      .from('admin_user_public_profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Public profile view test failed:', error.message)
      return false
    }
    
    console.log('✅ Public profile view working')
    if (data && data.length > 0) {
      console.log(`   Found ${data.length} public profile(s)`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Public profile view test error:', error.message)
    return false
  }
}

async function testAPIEndpoints() {
  console.log('🔍 Testing API endpoints...')
  
  try {
    // Test if the API files exist
    const fs = require('fs')
    const path = require('path')
    
    const apiFiles = [
      '../app/api/profile/route.ts',
      '../app/api/profile/photo/route.ts'
    ]
    
    for (const file of apiFiles) {
      const filePath = path.join(__dirname, file)
      if (!fs.existsSync(filePath)) {
        console.error(`❌ API file missing: ${file}`)
        return false
      }
    }
    
    console.log('✅ API endpoint files exist')
    return true
  } catch (error) {
    console.error('❌ API endpoint test error:', error.message)
    return false
  }
}

async function main() {
  console.log('🧪 Starting profile functionality tests...\n')
  
  const tests = [
    { name: 'Database Schema', fn: testDatabaseSchema },
    { name: 'Storage Bucket', fn: testStorageBucket },
    { name: 'Profile Update', fn: testProfileUpdate },
    { name: 'Public Profile View', fn: testPublicProfileView },
    { name: 'API Endpoints', fn: testAPIEndpoints }
  ]
  
  let passedTests = 0
  let totalTests = tests.length
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      if (result) {
        passedTests++
      }
    } catch (error) {
      console.error(`❌ Test "${test.name}" threw an error:`, error.message)
    }
    console.log('') // Add spacing between tests
  }
  
  console.log('📊 Test Results:')
  console.log(`   Passed: ${passedTests}/${totalTests}`)
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Profile functionality is ready.')
    console.log('\n🚀 You can now:')
    console.log('   1. Start the development server: npm run dev')
    console.log('   2. Navigate to /SectionAdmin/settings')
    console.log('   3. Test profile photo upload')
    console.log('   4. Update social media links')
    console.log('   5. Modify profile information')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('💥 Test suite failed:', error.message)
  process.exit(1)
})

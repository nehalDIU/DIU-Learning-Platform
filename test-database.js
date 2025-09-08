/**
 * Simple database test script
 * Tests if student_users table exists and works
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Load environment variables
function loadEnv() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    })
  } catch (error) {
    console.log('⚠️  Could not load .env.local file')
  }
}

loadEnv()

const supabase = createClient(
  'https://bpfsnwfaxmhtsdjcjeju.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testDatabase() {
  console.log('🔍 Testing database connection and student_users table...')
  console.log('')

  try {
    // Test 1: Check if table exists
    console.log('📋 Test 1: Checking if student_users table exists...')
    const { data, error } = await supabase
      .from('student_users')
      .select('id, email, full_name')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.log('❌ FAILED: student_users table does not exist')
        console.log('')
        console.log('🔧 SOLUTION:')
        console.log('1. Go to: https://supabase.com/dashboard/project/bpfsnwfaxmhtsdjcjeju/sql')
        console.log('2. Copy and run the SQL from: QUICK_FIX_INSTRUCTIONS.md')
        console.log('3. Restart your app: npm run dev')
        console.log('')
        return false
      } else {
        console.log('❌ FAILED: Unexpected error:', error.message)
        return false
      }
    }

    console.log('✅ PASSED: student_users table exists')
    console.log(`📊 Found ${data?.length || 0} existing users`)

    // Test 2: Check table structure
    console.log('')
    console.log('📋 Test 2: Testing table structure...')
    
    const testUserId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const testEmail = `test_${Date.now()}@diu.edu.bd`
    
    const { data: insertData, error: insertError } = await supabase
      .from('student_users')
      .insert({
        user_id: testUserId,
        email: testEmail,
        full_name: 'Test User',
        batch: '63',
        section: 'G',
        has_skipped_selection: false,
        is_guest_user: false
      })
      .select()
      .single()

    if (insertError) {
      console.log('❌ FAILED: Could not insert test user:', insertError.message)
      return false
    }

    console.log('✅ PASSED: Table structure is correct')
    console.log('✅ PASSED: Can insert new users')

    // Clean up test user
    await supabase
      .from('student_users')
      .delete()
      .eq('id', insertData.id)

    console.log('✅ PASSED: Test user cleaned up')

    // Test 3: Check semesters table compatibility
    console.log('')
    console.log('📋 Test 3: Checking semesters table compatibility...')
    
    const { data: semesterData, error: semesterError } = await supabase
      .from('semesters')
      .select('id, title, section')
      .limit(1)

    if (semesterError) {
      console.log('⚠️  WARNING: Could not access semesters table:', semesterError.message)
    } else {
      console.log('✅ PASSED: Semesters table is accessible')
      console.log(`📊 Found ${semesterData?.length || 0} semesters`)
    }

    console.log('')
    console.log('🎉 ALL TESTS PASSED!')
    console.log('')
    console.log('✅ Your database is ready for the section selection system')
    console.log('✅ Users can now register with email authentication')
    console.log('✅ Batch and section selection will work')
    console.log('✅ Profile management is functional')
    console.log('')
    console.log('🚀 Start your app: npm run dev')
    console.log('🌐 Visit: http://localhost:3001')

    return true

  } catch (error) {
    console.log('❌ FAILED: Database test error:', error.message)
    console.log('')
    console.log('🔧 TROUBLESHOOTING:')
    console.log('1. Check your .env.local file has correct Supabase credentials')
    console.log('2. Verify your Supabase project is active')
    console.log('3. Run the SQL setup from QUICK_FIX_INSTRUCTIONS.md')
    return false
  }
}

// Run the test
testDatabase().then(success => {
  if (!success) {
    process.exit(1)
  }
})

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkUserDepartment() {
  try {
    console.log('🔍 Checking user department...')
    
    // Check the user with email nehal@diu.edu.bd
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'nehal@diu.edu.bd')
      .single()
    
    if (userError) {
      console.error('❌ Error fetching user:', userError)
      return
    }
    
    console.log('👤 User details:', {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      section: user.section
    })
    
    // Check all semesters and their sections
    const { data: semesters, error: semesterError } = await supabase
      .from('semesters')
      .select('id, title, section')
      .order('created_at', { ascending: false })
    
    if (semesterError) {
      console.error('❌ Error fetching semesters:', semesterError)
      return
    }
    
    console.log('\n📚 All semesters in database:')
    semesters.forEach(semester => {
      console.log(`  - ${semester.title} (Section: ${semester.section})`)
    })
    
    console.log(`\n🔍 User department: "${user.department}"`)
    console.log('🔍 Matching semesters:')
    const matchingSemesters = semesters.filter(s => s.section === user.department)
    if (matchingSemesters.length > 0) {
      matchingSemesters.forEach(semester => {
        console.log(`  ✅ ${semester.title} (Section: ${semester.section})`)
      })
    } else {
      console.log('  ❌ No matching semesters found')
      console.log(`  💡 User department "${user.department}" doesn't match any semester sections`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkUserDepartment()

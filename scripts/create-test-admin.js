const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestAdmin() {
  try {
    // Hash the password
    const password = 'admin123'
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Update existing user or create new one
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', 'nehal@diu.edu.bd')
      .single()

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('admin_users')
        .update({
          role: 'section_admin',
          department: 'CS-A',
          is_active: true
        })
        .eq('email', 'nehal@diu.edu.bd')
        .select()

      if (error) {
        throw error
      }

      console.log('Updated existing user nehal@diu.edu.bd with section_admin role and CS-A department')
    } else {
      // Create test admin user
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          email: 'admin@diu.edu.bd',
          password_hash: passwordHash,
          full_name: 'Test Section Admin',
          role: 'section_admin',
          department: 'CS-A',
          is_active: true
        })
        .select()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log('Test admin user already exists')
          return
        }
        throw error
      }

      console.log('Test admin user created successfully:')
      console.log('Email: admin@diu.edu.bd')
      console.log('Password: admin123')
      console.log('Role: section_admin')
      console.log('Department: CS-A')
    }


  } catch (error) {
    console.error('Error creating test admin:', error)
  }
}

createTestAdmin()

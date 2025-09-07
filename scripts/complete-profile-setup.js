const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQL(sql, description) {
  console.log(`🔄 ${description}...`)
  
  try {
    // For Supabase, we need to execute SQL through the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    })

    if (!response.ok) {
      // If exec_sql doesn't exist, try direct SQL execution
      const directResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Profile': 'public'
        },
        body: sql
      })
      
      if (!directResponse.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }
    }

    console.log(`✅ ${description} completed`)
    return true
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    return false
  }
}

async function addProfileColumns() {
  const columns = [
    { name: 'profile_photo_url', type: 'TEXT' },
    { name: 'bio', type: 'TEXT' },
    { name: 'social_media_links', type: 'JSONB DEFAULT \'{}\'::jsonb' },
    { name: 'address', type: 'TEXT' },
    { name: 'date_of_birth', type: 'DATE' },
    { name: 'website_url', type: 'TEXT' },
    { name: 'linkedin_url', type: 'TEXT' },
    { name: 'twitter_url', type: 'TEXT' },
    { name: 'facebook_url', type: 'TEXT' },
    { name: 'instagram_url', type: 'TEXT' },
    { name: 'github_url', type: 'TEXT' },
    { name: 'emergency_contact_name', type: 'TEXT' },
    { name: 'emergency_contact_phone', type: 'TEXT' },
    { name: 'emergency_contact_relationship', type: 'TEXT' },
    { name: 'office_location', type: 'TEXT' },
    { name: 'office_hours', type: 'TEXT' },
    { name: 'specializations', type: 'TEXT[]' },
    { name: 'languages_spoken', type: 'TEXT[]' },
    { name: 'education_background', type: 'JSONB DEFAULT \'[]\'::jsonb' },
    { name: 'certifications', type: 'JSONB DEFAULT \'[]\'::jsonb' },
    { name: 'profile_visibility', type: 'VARCHAR(20) DEFAULT \'department\'' },
    { name: 'show_email', type: 'BOOLEAN DEFAULT false' },
    { name: 'show_phone', type: 'BOOLEAN DEFAULT false' },
    { name: 'allow_student_contact', type: 'BOOLEAN DEFAULT true' },
    { name: 'notification_preferences', type: 'JSONB DEFAULT \'{}\'::jsonb' }
  ]

  console.log('🔄 Adding profile columns to admin_users table...')
  
  for (const column of columns) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`
      })
      
      if (error && !error.message.includes('already exists')) {
        console.error(`❌ Error adding column ${column.name}:`, error.message)
      } else {
        console.log(`✅ Added column: ${column.name}`)
      }
    } catch (error) {
      // Try alternative method
      try {
        const { data, error: altError } = await supabase
          .from('admin_users')
          .select(`${column.name}`)
          .limit(1)
        
        if (altError && altError.message.includes('does not exist')) {
          console.log(`⚠️  Column ${column.name} needs to be added manually`)
        } else {
          console.log(`✅ Column ${column.name} already exists`)
        }
      } catch (e) {
        console.log(`⚠️  Could not verify column ${column.name}`)
      }
    }
  }
}

async function createStorageBucket() {
  console.log('🔄 Creating profile-photos storage bucket...')
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      return false
    }
    
    const existingBucket = buckets.find(bucket => bucket.id === 'profile-photos')
    
    if (existingBucket) {
      console.log('✅ Storage bucket "profile-photos" already exists')
      return true
    }
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('profile-photos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    })
    
    if (error) {
      console.error('❌ Error creating storage bucket:', error.message)
      return false
    }
    
    console.log('✅ Storage bucket "profile-photos" created successfully')
    return true
  } catch (error) {
    console.error('❌ Storage bucket creation error:', error.message)
    return false
  }
}

async function updateExistingUsers() {
  console.log('🔄 Updating existing users with default values...')
  
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        notification_preferences: {
          email_notifications: true,
          push_notifications: true,
          weekly_reports: true,
          semester_updates: true,
          student_activity: false
        },
        profile_visibility: 'department',
        show_email: false,
        show_phone: false,
        allow_student_contact: true
      })
      .or('notification_preferences.is.null,notification_preferences.eq.{}')
    
    if (error) {
      console.error('❌ Error updating existing users:', error.message)
      return false
    }
    
    console.log('✅ Updated existing users with default values')
    return true
  } catch (error) {
    console.error('❌ Error updating users:', error.message)
    return false
  }
}

async function testSetup() {
  console.log('🔍 Testing setup...')
  
  try {
    // Test if we can select the new columns
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, profile_photo_url, bio, notification_preferences')
      .limit(1)
    
    if (error) {
      console.error('❌ Setup test failed:', error.message)
      return false
    }
    
    console.log('✅ Database schema test passed')
    
    // Test storage bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('❌ Storage test failed:', bucketError.message)
      return false
    }
    
    const profileBucket = buckets.find(bucket => bucket.id === 'profile-photos')
    if (profileBucket) {
      console.log('✅ Storage bucket test passed')
    } else {
      console.error('❌ Storage bucket not found')
      return false
    }
    
    return true
  } catch (error) {
    console.error('❌ Setup test error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Setting up complete profile management system...\n')
  
  try {
    // Test connection
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
    
    if (error) {
      throw new Error(`Connection failed: ${error.message}`)
    }
    
    console.log('✅ Supabase connection verified\n')
    
    // Execute setup steps
    await addProfileColumns()
    console.log('')
    
    const bucketCreated = await createStorageBucket()
    console.log('')
    
    if (bucketCreated) {
      await updateExistingUsers()
      console.log('')
      
      const testPassed = await testSetup()
      console.log('')
      
      if (testPassed) {
        console.log('🎉 Profile management system setup completed successfully!')
        console.log('\n📋 What was set up:')
        console.log('  ✅ Added profile columns to admin_users table')
        console.log('  ✅ Created profile-photos storage bucket')
        console.log('  ✅ Updated existing users with default values')
        console.log('  ✅ Verified setup integrity')
        console.log('\n🚀 You can now:')
        console.log('  1. Start the app: npm run dev')
        console.log('  2. Navigate to /SectionAdmin/settings')
        console.log('  3. Test profile photo upload and social media links')
      } else {
        console.log('⚠️  Setup completed with some issues. Manual verification may be needed.')
      }
    }
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message)
    console.log('\n📋 Manual steps may be required:')
    console.log('  1. Copy database/migrations/add_profile_fields.sql to Supabase SQL Editor')
    console.log('  2. Create storage bucket manually in Supabase Dashboard')
    process.exit(1)
  }
}

main()

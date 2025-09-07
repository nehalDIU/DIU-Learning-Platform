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

async function addProfileColumns() {
  console.log('🔄 Adding profile columns to admin_users table...')
  
  const columns = [
    'profile_photo_url TEXT',
    'bio TEXT',
    'social_media_links JSONB DEFAULT \'{}\'',
    'address TEXT',
    'date_of_birth DATE',
    'website_url TEXT',
    'linkedin_url TEXT',
    'twitter_url TEXT',
    'facebook_url TEXT',
    'instagram_url TEXT',
    'github_url TEXT',
    'emergency_contact_name TEXT',
    'emergency_contact_phone TEXT',
    'emergency_contact_relationship TEXT',
    'office_location TEXT',
    'office_hours TEXT',
    'specializations TEXT[]',
    'languages_spoken TEXT[]',
    'education_background JSONB DEFAULT \'[]\'',
    'certifications JSONB DEFAULT \'[]\'',
    'profile_visibility VARCHAR(20) DEFAULT \'department\'',
    'show_email BOOLEAN DEFAULT false',
    'show_phone BOOLEAN DEFAULT false',
    'allow_student_contact BOOLEAN DEFAULT true',
    'notification_preferences JSONB DEFAULT \'{}\''
  ]

  for (const column of columns) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS ${column};`
      })
      
      if (error && !error.message.includes('already exists')) {
        console.error(`❌ Error adding column ${column.split(' ')[0]}:`, error.message)
      } else {
        console.log(`✅ Added column: ${column.split(' ')[0]}`)
      }
    } catch (error) {
      console.error(`❌ Error adding column ${column.split(' ')[0]}:`, error.message)
    }
  }
}

async function createStorageBucket() {
  console.log('🔄 Creating profile-photos storage bucket...')
  
  try {
    const { data, error } = await supabase.storage.createBucket('profile-photos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    })
    
    if (error && !error.message.includes('already exists')) {
      console.error('❌ Error creating storage bucket:', error.message)
    } else {
      console.log('✅ Storage bucket created/verified')
    }
  } catch (error) {
    console.error('❌ Storage bucket error:', error.message)
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
      .is('notification_preferences', null)
    
    if (error) {
      console.error('❌ Error updating existing users:', error.message)
    } else {
      console.log('✅ Updated existing users with default values')
    }
  } catch (error) {
    console.error('❌ Error updating users:', error.message)
  }
}

async function testChanges() {
  console.log('🔍 Testing applied changes...')
  
  try {
    // Test if columns exist by selecting them
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, profile_photo_url, bio, notification_preferences, profile_visibility')
      .limit(1)
    
    if (error) {
      console.error('❌ Test failed:', error.message)
      return false
    }
    
    console.log('✅ Database schema changes verified')
    
    // Test storage bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('❌ Storage test failed:', bucketError.message)
      return false
    }
    
    const profileBucket = buckets.find(bucket => bucket.id === 'profile-photos')
    if (profileBucket) {
      console.log('✅ Storage bucket verified')
    } else {
      console.error('❌ Storage bucket not found')
      return false
    }
    
    return true
  } catch (error) {
    console.error('❌ Test error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Applying profile management migrations...\n')
  
  try {
    // Test connection first
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
    
    if (error) {
      throw new Error(`Connection failed: ${error.message}`)
    }
    
    console.log('✅ Supabase connection verified\n')
    
    // Apply changes
    await addProfileColumns()
    console.log('')
    
    await createStorageBucket()
    console.log('')
    
    await updateExistingUsers()
    console.log('')
    
    // Test the changes
    const success = await testChanges()
    
    if (success) {
      console.log('\n🎉 Migration completed successfully!')
      console.log('\n📋 Applied changes:')
      console.log('  ✅ Added profile columns to admin_users table')
      console.log('  ✅ Created profile-photos storage bucket')
      console.log('  ✅ Updated existing users with default values')
      console.log('\n🚀 You can now test the profile functionality!')
    } else {
      console.log('\n⚠️  Migration completed with some issues. Please check the logs above.')
    }
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message)
    process.exit(1)
  }
}

main()

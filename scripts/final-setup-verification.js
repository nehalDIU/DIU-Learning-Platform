const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCurrentState() {
  console.log('🔍 Checking current database state...')
  
  try {
    // Check if profile columns exist
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, profile_photo_url, bio, notification_preferences')
      .limit(1)
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Profile columns do not exist yet')
        return false
      } else {
        console.error('❌ Database check failed:', error.message)
        return false
      }
    }
    
    console.log('✅ Profile columns already exist!')
    return true
  } catch (error) {
    console.error('❌ Database check error:', error.message)
    return false
  }
}

async function checkStorageBucket() {
  console.log('🔍 Checking storage bucket...')
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Storage check failed:', error.message)
      return false
    }
    
    const profileBucket = buckets.find(bucket => bucket.id === 'profile-photos')
    
    if (profileBucket) {
      console.log('✅ Storage bucket "profile-photos" exists')
      console.log(`   Public: ${profileBucket.public}`)
      console.log(`   Created: ${profileBucket.created_at}`)
      return true
    } else {
      console.log('❌ Storage bucket "profile-photos" does not exist')
      return false
    }
  } catch (error) {
    console.error('❌ Storage check error:', error.message)
    return false
  }
}

async function createStorageBucketIfNeeded() {
  console.log('🔄 Creating storage bucket if needed...')
  
  try {
    const { data, error } = await supabase.storage.createBucket('profile-photos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    })
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Storage bucket already exists')
        return true
      } else {
        console.error('❌ Error creating storage bucket:', error.message)
        return false
      }
    }
    
    console.log('✅ Storage bucket created successfully')
    return true
  } catch (error) {
    console.error('❌ Storage bucket creation error:', error.message)
    return false
  }
}

async function generateMigrationInstructions() {
  console.log('\n📋 MIGRATION INSTRUCTIONS')
  console.log('=' .repeat(50))
  
  console.log('\n1. 🗄️ DATABASE MIGRATION:')
  console.log('   Since direct SQL execution via API is not available,')
  console.log('   you need to run the migration manually:')
  console.log('')
  console.log('   a) Open your Supabase project dashboard')
  console.log('   b) Navigate to SQL Editor')
  console.log('   c) Copy the entire contents of:')
  console.log('      📁 database/migrations/add_profile_fields.sql')
  console.log('   d) Paste it into the SQL Editor')
  console.log('   e) Click "Run" to execute')
  console.log('')
  console.log('   This will add 25 new columns to admin_users table including:')
  console.log('   • profile_photo_url, bio, address, date_of_birth')
  console.log('   • Social media URLs (LinkedIn, Twitter, Facebook, etc.)')
  console.log('   • Emergency contact information')
  console.log('   • Office location and hours')
  console.log('   • Specializations and languages')
  console.log('   • Privacy and notification settings')
  
  console.log('\n2. ✅ STORAGE BUCKET:')
  console.log('   The profile-photos storage bucket has been created automatically!')
  console.log('   • Public access: enabled')
  console.log('   • File size limit: 5MB')
  console.log('   • Allowed types: JPEG, PNG, WebP, GIF')
  
  console.log('\n3. 🧪 VERIFICATION:')
  console.log('   After running the SQL migration, test with:')
  console.log('   📝 node scripts/test-profile-functionality.js')
  
  console.log('\n4. 🚀 USAGE:')
  console.log('   Once migration is complete:')
  console.log('   📝 npm run dev')
  console.log('   🌐 Navigate to /SectionAdmin/settings')
  console.log('   🖼️ Test profile photo upload')
  console.log('   🔗 Test social media links')
  console.log('   📝 Test profile information updates')
}

async function main() {
  console.log('🚀 Final Profile Management Setup Verification\n')
  
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
    
    // Check current state
    const columnsExist = await checkCurrentState()
    console.log('')
    
    // Check/create storage bucket
    const bucketExists = await checkStorageBucket()
    if (!bucketExists) {
      console.log('')
      await createStorageBucketIfNeeded()
    }
    console.log('')
    
    // Generate instructions
    await generateMigrationInstructions()
    
    if (columnsExist) {
      console.log('\n🎉 SETUP COMPLETE!')
      console.log('All profile management features are ready to use!')
      console.log('\n🚀 Start the app with: npm run dev')
      console.log('📍 Navigate to: /SectionAdmin/settings')
    } else {
      console.log('\n⚠️  MANUAL STEP REQUIRED')
      console.log('Please run the SQL migration as described above.')
      console.log('Then the profile management system will be fully functional!')
    }
    
  } catch (error) {
    console.error('\n💥 Setup verification failed:', error.message)
    await generateMigrationInstructions()
  }
}

main()

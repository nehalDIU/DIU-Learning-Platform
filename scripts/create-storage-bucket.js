const { createClient } = require('@supabase/supabase-js')

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

async function createProfilePhotosBucket() {
  console.log('🔄 Creating profile-photos storage bucket...')
  
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      return false
    }
    
    const existingBucket = buckets.find(bucket => bucket.id === 'profile-photos')
    
    if (existingBucket) {
      console.log('✅ Storage bucket "profile-photos" already exists')
      console.log(`   Public: ${existingBucket.public}`)
      console.log(`   Created: ${existingBucket.created_at}`)
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
    console.log('   Settings:')
    console.log('   - Public: true')
    console.log('   - File size limit: 5MB')
    console.log('   - Allowed types: JPEG, PNG, WebP, GIF')
    
    return true
  } catch (error) {
    console.error('❌ Storage bucket creation error:', error.message)
    return false
  }
}

async function testBucketAccess() {
  console.log('🔍 Testing bucket access...')
  
  try {
    // Try to list objects in the bucket (should be empty)
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .list('', { limit: 1 })
    
    if (error) {
      console.error('❌ Bucket access test failed:', error.message)
      return false
    }
    
    console.log('✅ Bucket access test successful')
    console.log(`   Objects in bucket: ${data.length}`)
    
    return true
  } catch (error) {
    console.error('❌ Bucket access test error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Setting up profile photos storage bucket...\n')
  
  try {
    // Test connection
    const { data, error } = await supabase.storage.listBuckets()
    if (error) {
      throw new Error(`Connection failed: ${error.message}`)
    }
    console.log('✅ Supabase connection verified\n')
    
    // Create bucket
    const bucketCreated = await createProfilePhotosBucket()
    console.log('')
    
    if (bucketCreated) {
      // Test bucket access
      const accessTest = await testBucketAccess()
      console.log('')
      
      if (accessTest) {
        console.log('🎉 Storage bucket setup completed successfully!')
        console.log('\n📋 Next steps:')
        console.log('  1. Run the database migration: Copy and paste database/migrations/add_profile_fields.sql into Supabase SQL Editor')
        console.log('  2. Test the setup: node scripts/test-profile-functionality.js')
        console.log('  3. Start the app: npm run dev')
        console.log('  4. Navigate to /SectionAdmin/settings to test profile features')
      } else {
        console.log('⚠️  Bucket created but access test failed')
        process.exit(1)
      }
    } else {
      console.log('❌ Failed to create storage bucket')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Setup interrupted by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Setup terminated')
  process.exit(0)
})

main()

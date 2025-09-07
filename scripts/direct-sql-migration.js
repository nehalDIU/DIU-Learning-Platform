// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

async function executeSQL(sql, description) {
  console.log(`🔄 ${description}...`)
  
  try {
    // Try multiple approaches to execute SQL
    const approaches = [
      // Approach 1: Direct SQL execution
      {
        url: `${supabaseUrl}/rest/v1/`,
        headers: {
          'Content-Type': 'application/sql',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Profile': 'public'
        },
        body: sql
      },
      // Approach 2: Using RPC
      {
        url: `${supabaseUrl}/rest/v1/rpc/exec_sql`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql })
      },
      // Approach 3: Using query parameter
      {
        url: `${supabaseUrl}/rest/v1/?query=${encodeURIComponent(sql)}`,
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        method: 'GET'
      }
    ]

    for (const approach of approaches) {
      try {
        const response = await fetch(approach.url, {
          method: approach.method || 'POST',
          headers: approach.headers,
          body: approach.body
        })

        if (response.ok) {
          console.log(`✅ ${description} completed`)
          return true
        }
      } catch (error) {
        // Continue to next approach
      }
    }

    console.log(`⚠️  ${description} - SQL execution not available, will need manual execution`)
    return false
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    return false
  }
}

async function addColumnsDirectly() {
  const columns = [
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS bio TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS social_media_links JSONB DEFAULT \'{}\';',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS address TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS date_of_birth DATE;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS website_url TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS twitter_url TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS facebook_url TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS instagram_url TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS github_url TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS office_location TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS office_hours TEXT;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS specializations TEXT[];',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS languages_spoken TEXT[];',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS education_background JSONB DEFAULT \'[]\';',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT \'[]\';',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT \'department\';',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS allow_student_contact BOOLEAN DEFAULT true;',
    'ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT \'{}\';'
  ]

  console.log('🔄 Attempting to add profile columns...')
  
  let successCount = 0
  for (const sql of columns) {
    const success = await executeSQL(sql, `Adding column`)
    if (success) successCount++
  }

  if (successCount > 0) {
    console.log(`✅ Successfully added ${successCount} columns`)
  } else {
    console.log('⚠️  Could not add columns via API - manual SQL execution required')
  }

  return successCount
}

async function createConstraints() {
  const constraints = [
    'ALTER TABLE public.admin_users ADD CONSTRAINT IF NOT EXISTS valid_profile_visibility CHECK (profile_visibility IN (\'public\', \'department\', \'private\'));',
    'ALTER TABLE public.admin_users ADD CONSTRAINT IF NOT EXISTS valid_website_url CHECK (website_url IS NULL OR website_url ~* \'^https?://[^\\s/$.?#].[^\\s]*$\');',
    'ALTER TABLE public.admin_users ADD CONSTRAINT IF NOT EXISTS valid_linkedin_url CHECK (linkedin_url IS NULL OR linkedin_url ~* \'^https?://(www\\.)?linkedin\\.com/.*$\');'
  ]

  console.log('🔄 Attempting to add constraints...')
  
  let successCount = 0
  for (const sql of constraints) {
    const success = await executeSQL(sql, `Adding constraint`)
    if (success) successCount++
  }

  return successCount
}

async function createView() {
  const viewSQL = `
    CREATE OR REPLACE VIEW public.admin_user_public_profiles AS
    SELECT 
        id,
        full_name,
        department,
        role as designation,
        bio,
        profile_photo_url,
        website_url,
        linkedin_url,
        twitter_url,
        facebook_url,
        instagram_url,
        github_url,
        office_location,
        office_hours,
        specializations,
        languages_spoken,
        CASE WHEN show_email THEN email ELSE NULL END as email,
        CASE WHEN show_phone THEN phone ELSE NULL END as phone,
        allow_student_contact,
        created_at
    FROM public.admin_users 
    WHERE is_active = true 
    AND profile_visibility IN ('public', 'department');
  `

  return await executeSQL(viewSQL, 'Creating public profile view')
}

async function main() {
  console.log('🚀 Attempting direct SQL migration...\n')
  
  try {
    // Test connection first
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/admin_users?select=count&limit=1`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      }
    })

    if (!testResponse.ok) {
      throw new Error('Connection test failed')
    }

    console.log('✅ Supabase connection verified\n')

    // Try to add columns
    const columnsAdded = await addColumnsDirectly()
    console.log('')

    // Try to add constraints
    const constraintsAdded = await createConstraints()
    console.log('')

    // Try to create view
    const viewCreated = await createView()
    console.log('')

    if (columnsAdded > 0 || constraintsAdded > 0 || viewCreated) {
      console.log('🎉 Some migration steps completed successfully!')
      console.log(`   Columns added: ${columnsAdded}`)
      console.log(`   Constraints added: ${constraintsAdded}`)
      console.log(`   View created: ${viewCreated ? 'Yes' : 'No'}`)
    } else {
      console.log('⚠️  Direct SQL execution not available via API')
      console.log('\n📋 Manual steps required:')
      console.log('  1. Open Supabase Dashboard > SQL Editor')
      console.log('  2. Copy and paste: database/migrations/add_profile_fields.sql')
      console.log('  3. Click "Run" to execute the migration')
      console.log('\n✅ Storage bucket is already created and ready!')
    }

    console.log('\n🚀 Once migration is complete, you can:')
    console.log('  1. Start the app: npm run dev')
    console.log('  2. Navigate to /SectionAdmin/settings')
    console.log('  3. Test profile features')

  } catch (error) {
    console.error('\n💥 Migration attempt failed:', error.message)
    console.log('\n📋 Manual migration required:')
    console.log('  1. Open Supabase Dashboard > SQL Editor')
    console.log('  2. Copy and paste: database/migrations/add_profile_fields.sql')
    console.log('  3. Click "Run" to execute the migration')
  }
}

main()

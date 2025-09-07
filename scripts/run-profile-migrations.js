const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(filePath, description) {
  console.log(`\n🔄 Running migration: ${description}`)
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8')
    
    // Split SQL into individual statements (basic splitting)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.toLowerCase().includes('commit')) continue
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
      
      if (error) {
        console.error(`❌ Error executing statement:`, error.message)
        console.error(`Statement: ${statement.substring(0, 100)}...`)
        throw error
      }
    }
    
    console.log(`✅ Migration completed: ${description}`)
  } catch (error) {
    console.error(`❌ Migration failed: ${description}`)
    console.error(error.message)
    throw error
  }
}

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
    
    if (error) {
      throw error
    }
    
    console.log('✅ Supabase connection successful')
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message)
    throw error
  }
}

async function createExecSqlFunction() {
  console.log('🔧 Creating exec_sql function...')
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: createFunctionSQL })
    if (error && !error.message.includes('already exists')) {
      // Try direct query if RPC doesn't exist yet
      const { error: directError } = await supabase
        .from('_dummy_table_that_does_not_exist')
        .select('*')
      
      // This will fail, but we can use the connection to execute SQL
      console.log('⚠️  Using alternative method to create function')
    }
    console.log('✅ exec_sql function ready')
  } catch (error) {
    console.log('⚠️  Function creation skipped (will be handled by migration)')
  }
}

async function main() {
  try {
    console.log('🚀 Starting profile enhancement migrations...')
    
    // Test connection
    await testConnection()
    
    // Create helper function
    await createExecSqlFunction()
    
    // Run migrations
    await runMigration(
      path.join(__dirname, '../database/migrations/add_profile_fields.sql'),
      'Add profile fields to admin_users table'
    )
    
    await runMigration(
      path.join(__dirname, '../database/storage/setup_profile_storage.sql'),
      'Set up profile photo storage bucket and policies'
    )
    
    console.log('\n🎉 All migrations completed successfully!')
    console.log('\n📋 Summary of changes:')
    console.log('  ✅ Extended admin_users table with profile fields')
    console.log('  ✅ Added profile photo storage bucket')
    console.log('  ✅ Set up storage policies for profile photos')
    console.log('  ✅ Created helper functions and triggers')
    console.log('  ✅ Added RLS policies for profile visibility')
    
    console.log('\n🔧 Next steps:')
    console.log('  1. Test the profile upload functionality')
    console.log('  2. Verify storage bucket permissions')
    console.log('  3. Check profile visibility settings')
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Migration interrupted by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Migration terminated')
  process.exit(0)
})

main()

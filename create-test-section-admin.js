const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestSectionAdmin() {
  console.log('🔍 Creating test section admin user...\n');
  
  const testUser = {
    email: 'test-section-admin@diu.edu.bd',
    password: 'testpassword123',
    full_name: 'Test Section Admin',
    department: 'TEST-SECTION'
  };
  
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', testUser.email)
      .single();
    
    if (existingUser) {
      console.log('✅ Test user already exists!');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
      console.log('\n📋 Login Instructions:');
      console.log('1. Go to http://localhost:3000/login');
      console.log(`2. Email: ${testUser.email}`);
      console.log(`3. Password: ${testUser.password}`);
      console.log('4. After login, go to http://localhost:3000/SectionAdmin/semester-management');
      console.log('5. Try editing a semester');
      return;
    }
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(testUser.password, saltRounds);
    
    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('admin_users')
      .insert({
        email: testUser.email.toLowerCase(),
        password_hash,
        full_name: testUser.full_name,
        role: 'section_admin',
        department: testUser.department,
        is_active: true,
        login_count: 0
      })
      .select('id, email, full_name, role, department')
      .single();
    
    if (createError) {
      console.error('❌ Error creating user:', createError);
      return;
    }
    
    console.log('✅ Test section admin created successfully!');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   Department: ${newUser.department}`);
    
    console.log('\n📋 Login Instructions:');
    console.log('1. Go to http://localhost:3000/login');
    console.log(`2. Email: ${testUser.email}`);
    console.log(`3. Password: ${testUser.password}`);
    console.log('4. After login, go to http://localhost:3000/SectionAdmin/semester-management');
    console.log('5. Try editing a semester');
    
    console.log('\n🔧 Or test the debug page:');
    console.log('1. Go to http://localhost:3000/debug-auth');
    console.log('2. Check authentication status');
    console.log('3. Use "Go to Login" button if not authenticated');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestSectionAdmin();

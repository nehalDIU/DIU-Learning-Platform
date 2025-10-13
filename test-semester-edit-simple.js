const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET;

async function createTestToken() {
  console.log('🔍 Creating test authentication token...\n');
  
  try {
    // Get a test admin user
    const { data: adminUsers, error: usersError } = await supabase
      .from('admin_users')
      .select('id, email, role, department, is_active')
      .eq('is_active', true)
      .eq('role', 'section_admin')
      .limit(1);
    
    if (usersError || !adminUsers.length) {
      console.error('❌ No section admin users found:', usersError);
      return;
    }
    
    const testUser = adminUsers[0];
    console.log(`✅ Using test user: ${testUser.email} (${testUser.role})`);
    
    // Create JWT token
    const token = jwt.sign(
      {
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
        department: testUser.department
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    console.log('\n✅ JWT token created successfully!');
    console.log(`Token: ${token.substring(0, 50)}...`);
    
    // Get a test semester ID
    const { data: semesters, error: semestersError } = await supabase
      .from('semesters')
      .select('id, title')
      .limit(1);
    
    if (semestersError || !semesters.length) {
      console.error('❌ No semesters found:', semestersError);
      return;
    }
    
    const testSemester = semesters[0];
    console.log(`\n✅ Test semester: ${testSemester.title} (ID: ${testSemester.id})`);
    
    console.log('\n📋 Manual Testing Instructions:');
    console.log('1. Open your browser developer tools');
    console.log('2. Go to Application/Storage > Cookies > localhost:3000');
    console.log('3. Add a new cookie:');
    console.log(`   Name: admin_token`);
    console.log(`   Value: ${token}`);
    console.log(`   Domain: localhost`);
    console.log(`   Path: /`);
    console.log(`   HttpOnly: true`);
    console.log('4. Refresh the page');
    console.log('5. Try editing the semester');
    
    console.log('\n🧪 Or test with PowerShell:');
    console.log(`Invoke-WebRequest -Uri "http://localhost:3000/api/section-admin/semesters/${testSemester.id}" -Method GET -Headers @{"Cookie"="admin_token=${token}"}`);
    
    console.log('\n🔧 Or use this token in your browser:');
    console.log('Open browser console and run:');
    console.log(`document.cookie = "admin_token=${token}; path=/; domain=localhost";`);
    console.log('Then refresh and try editing a semester.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestToken();

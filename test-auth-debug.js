const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAuthentication() {
  console.log('🔍 Testing Authentication System...\n');
  
  try {
    // 1. Check if we can connect to database
    console.log('1. Testing database connection...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful\n');

    // 2. Check existing admin users
    console.log('2. Checking existing admin users...');
    const { data: adminUsers, error: usersError } = await supabase
      .from('admin_users')
      .select('id, email, role, department, is_active')
      .eq('is_active', true);
    
    if (usersError) {
      console.error('❌ Error fetching admin users:', usersError);
      return;
    }
    
    console.log(`✅ Found ${adminUsers.length} active admin users:`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Department: ${user.department || 'N/A'}`);
    });
    console.log('');

    // 3. Check existing semesters
    console.log('3. Checking existing semesters...');
    const { data: semesters, error: semestersError } = await supabase
      .from('semesters')
      .select('id, title, section, is_active')
      .limit(5);
    
    if (semestersError) {
      console.error('❌ Error fetching semesters:', semestersError);
      return;
    }
    
    console.log(`✅ Found ${semesters.length} semesters:`);
    semesters.forEach(semester => {
      console.log(`   - ${semester.title} (Section: ${semester.section}) - Active: ${semester.is_active}`);
    });
    console.log('');

    // 4. Test JWT secret
    console.log('4. Checking JWT configuration...');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not found in environment variables');
      return;
    }
    console.log(`✅ JWT_SECRET configured (length: ${jwtSecret.length})\n`);

    // 5. Test creating a test login token
    console.log('5. Testing JWT token creation...');
    const jwt = require('jsonwebtoken');
    
    if (adminUsers.length > 0) {
      const testUser = adminUsers.find(u => u.role === 'section_admin') || adminUsers[0];
      const testToken = jwt.sign(
        {
          userId: testUser.id,
          email: testUser.email,
          role: testUser.role,
          department: testUser.department
        },
        jwtSecret,
        { expiresIn: "24h" }
      );
      
      console.log('✅ JWT token created successfully');
      console.log(`   Token length: ${testToken.length}`);
      console.log(`   Test user: ${testUser.email} (${testUser.role})`);
      
      // Verify the token
      try {
        const decoded = jwt.verify(testToken, jwtSecret);
        console.log('✅ JWT token verification successful');
        console.log(`   Decoded user: ${decoded.email}`);
      } catch (verifyError) {
        console.error('❌ JWT token verification failed:', verifyError.message);
      }
    }
    
    console.log('\n🎯 Authentication system appears to be configured correctly!');
    console.log('\n📋 Next steps to test:');
    console.log('   1. Try logging in through the web interface');
    console.log('   2. Check browser cookies after login');
    console.log('   3. Test API endpoints with authentication');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

// Run the test
testAuthentication();

const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET;

async function testEditSemesterAPI() {
  console.log('🔍 Testing Edit Semester API...\n');
  
  try {
    // 1. Get a test admin user
    console.log('1. Getting test admin user...');
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
    
    // 2. Get a test semester
    console.log('\n2. Getting test semester...');
    const { data: semesters, error: semestersError } = await supabase
      .from('semesters')
      .select('id, title, section, description, has_midterm, has_final, is_active')
      .limit(1);
    
    if (semestersError || !semesters.length) {
      console.error('❌ No semesters found:', semestersError);
      return;
    }
    
    const testSemester = semesters[0];
    console.log(`✅ Using test semester: ${testSemester.title} (ID: ${testSemester.id})`);
    
    // 3. Create a valid JWT token
    console.log('\n3. Creating JWT token...');
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
    console.log('✅ JWT token created');
    
    // 4. Test GET endpoint (fetch semester for editing)
    console.log('\n4. Testing GET semester endpoint...');
    const { default: fetch } = await import('node-fetch');
    
    const getResponse = await fetch(`http://localhost:3000/api/section-admin/semesters/${testSemester.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `admin_token=${token}`
      },
    });
    
    console.log(`   GET response status: ${getResponse.status}`);
    
    if (getResponse.ok) {
      const semesterData = await getResponse.json();
      console.log('✅ GET request successful');
      console.log(`   Semester: ${semesterData.title}`);
      console.log(`   Courses: ${semesterData.courses?.length || 0}`);
      
      // 5. Test PUT endpoint (update semester)
      console.log('\n5. Testing PUT semester endpoint...');
      
      const updateData = {
        semester: {
          title: semesterData.title + ' (Updated)',
          description: (semesterData.description || '') + ' - Test update',
          section: semesterData.section,
          has_midterm: semesterData.has_midterm,
          has_final: semesterData.has_final,
          is_active: semesterData.is_active,
          default_credits: semesterData.default_credits || 3
        },
        courses: semesterData.courses || []
      };
      
      const putResponse = await fetch(`http://localhost:3000/api/section-admin/semesters/${testSemester.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `admin_token=${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      console.log(`   PUT response status: ${putResponse.status}`);
      
      if (putResponse.ok) {
        const updateResult = await putResponse.json();
        console.log('✅ PUT request successful');
        console.log(`   Updated semester: ${updateResult.semester?.title || 'N/A'}`);
        
        // 6. Verify the update in database
        console.log('\n6. Verifying update in database...');
        const { data: updatedSemester, error: verifyError } = await supabase
          .from('semesters')
          .select('title, description, updated_at')
          .eq('id', testSemester.id)
          .single();
        
        if (verifyError) {
          console.error('❌ Error verifying update:', verifyError);
        } else {
          console.log('✅ Update verified in database');
          console.log(`   New title: ${updatedSemester.title}`);
          console.log(`   New description: ${updatedSemester.description}`);
          console.log(`   Updated at: ${updatedSemester.updated_at}`);
        }
        
      } else {
        const errorText = await putResponse.text();
        console.error('❌ PUT request failed:', errorText);
      }
      
    } else {
      const errorText = await getResponse.text();
      console.error('❌ GET request failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 The development server is not running!');
      console.log('   Please start it with: npm run dev');
    }
  }
}

// Run the test
testEditSemesterAPI();

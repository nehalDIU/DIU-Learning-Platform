const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bpfsnwfaxmhtsdjcjeju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZnNud2ZheG1odHNkamNqZWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE3MTExNywiZXhwIjoyMDcyNzQ3MTE3fQ.9N9XFEvxTo5BMKC3EZJdyGNYoe9kdG_ldfoTczNNRqA'
);

async function checkAndCreateStudentUsersTable() {
  console.log('Checking if student_users table exists...');
  
  try {
    // First check if table exists
    const { data: existingData, error: checkError } = await supabase
      .from('student_users')
      .select('id')
      .limit(1);
      
    if (!checkError) {
      console.log('✅ student_users table already exists!');
      console.log('Sample data:', existingData);
      return;
    }
    
    if (checkError.code !== '42P01') {
      console.error('❌ Unexpected error:', checkError);
      return;
    }
    
    console.log('❌ Table does not exist.');
    console.log('');
    console.log('📋 Please create the table manually in Supabase SQL Editor:');
    console.log('');
    console.log('-- Create student_users table');
    console.log('CREATE TABLE IF NOT EXISTS "public"."student_users" (');
    console.log('    "id" uuid DEFAULT gen_random_uuid() NOT NULL,');
    console.log('    "user_id" varchar(255) UNIQUE NOT NULL,');
    console.log('    "section_id" uuid NOT NULL,');
    console.log('    "section" varchar(50) NOT NULL,');
    console.log('    "display_name" varchar(255),');
    console.log('    "created_at" timestamp with time zone DEFAULT now(),');
    console.log('    "updated_at" timestamp with time zone DEFAULT now(),');
    console.log('    "last_accessed" timestamp with time zone DEFAULT now(),');
    console.log('    "is_active" boolean DEFAULT true,');
    console.log('    CONSTRAINT "student_users_pkey" PRIMARY KEY ("id")');
    console.log(');');
    console.log('');
    console.log('-- Create indexes');
    console.log('CREATE INDEX IF NOT EXISTS "idx_student_users_user_id" ON "public"."student_users" ("user_id");');
    console.log('CREATE INDEX IF NOT EXISTS "idx_student_users_section_id" ON "public"."student_users" ("section_id");');
    console.log('');
    console.log('-- Enable RLS and create policy');
    console.log('ALTER TABLE "public"."student_users" ENABLE ROW LEVEL SECURITY;');
    console.log('CREATE POLICY "Allow public access to student_users" ON "public"."student_users" FOR ALL USING (true);');
    console.log('');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/bpfsnwfaxmhtsdjcjeju/sql');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndCreateStudentUsersTable();

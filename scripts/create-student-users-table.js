const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bpfsnwfaxmhtsdjcjeju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZnNud2ZheG1odHNkamNqZWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE3MTExNywiZXhwIjoyMDcyNzQ3MTE3fQ.9N9XFEvxTo5BMKC3EZJdyGNYoe9kdG_ldfoTczNNRqA'
);

async function createStudentUsersTable() {
  console.log('Creating student_users table...');
  
  const createTableSQL = `
    -- Create student_users table for section-based user tracking
    CREATE TABLE IF NOT EXISTS "public"."student_users" (
        "id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "user_id" varchar(255) UNIQUE NOT NULL,
        "section_id" uuid NOT NULL,
        "section" varchar(50) NOT NULL,
        "display_name" varchar(255),
        "created_at" timestamp with time zone DEFAULT now(),
        "updated_at" timestamp with time zone DEFAULT now(),
        "last_accessed" timestamp with time zone DEFAULT now(),
        "is_active" boolean DEFAULT true,
        CONSTRAINT "student_users_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "student_users_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."semesters"("id") ON DELETE CASCADE
    );

    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS "idx_student_users_user_id" ON "public"."student_users" ("user_id");
    CREATE INDEX IF NOT EXISTS "idx_student_users_section_id" ON "public"."student_users" ("section_id");
    CREATE INDEX IF NOT EXISTS "idx_student_users_section" ON "public"."student_users" ("section");

    -- Enable RLS
    ALTER TABLE "public"."student_users" ENABLE ROW LEVEL SECURITY;

    -- Create RLS policy for public access (students don't need authentication)
    DROP POLICY IF EXISTS "Allow public access to student_users" ON "public"."student_users";
    CREATE POLICY "Allow public access to student_users" ON "public"."student_users"
        FOR ALL USING (true);
  `;

  const { error } = await supabase.rpc('exec', { sql: createTableSQL });
  
  if (error) {
    console.error('Error creating student_users table:', error);
  } else {
    console.log('student_users table created successfully');
  }
}

createStudentUsersTable().catch(console.error);

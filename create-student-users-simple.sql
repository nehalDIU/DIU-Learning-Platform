-- =====================================================
-- Simple Student Users Table Creation
-- Fixed to work with existing semesters table structure
-- =====================================================

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS "public"."student_users" CASCADE;

-- Create student_users table with correct schema
CREATE TABLE "public"."student_users" (
    -- Primary identification
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar(255) UNIQUE NOT NULL,
    
    -- Authentication & Contact
    "email" varchar(255) UNIQUE NOT NULL,
    "full_name" varchar(255) NOT NULL,
    "phone" varchar(20),
    
    -- Academic Information
    "student_id" varchar(50),
    "batch" varchar(10),
    "section" varchar(10),
    "section_id" uuid,
    
    -- User Preferences & Status
    "has_skipped_selection" boolean DEFAULT false,
    "is_guest_user" boolean DEFAULT false,
    "preferred_language" varchar(10) DEFAULT 'en',
    
    -- Profile & Media
    "profile_photo_url" text,
    "bio" text,
    
    -- System Fields
    "is_active" boolean DEFAULT true,
    "email_verified" boolean DEFAULT false,
    "last_login" timestamp with time zone,
    "login_count" integer DEFAULT 0,
    
    -- Timestamps
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "last_accessed" timestamp with time zone DEFAULT now(),
    
    -- Constraints
    CONSTRAINT "student_users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "student_users_email_check" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT "student_users_batch_check" CHECK (batch IS NULL OR length(batch) <= 10),
    CONSTRAINT "student_users_section_check" CHECK (section IS NULL OR length(section) <= 10)
);

-- Create essential indexes
CREATE INDEX "idx_student_users_user_id" ON "public"."student_users" ("user_id");
CREATE INDEX "idx_student_users_email" ON "public"."student_users" ("email");
CREATE INDEX "idx_student_users_batch" ON "public"."student_users" ("batch");
CREATE INDEX "idx_student_users_section" ON "public"."student_users" ("section");
CREATE INDEX "idx_student_users_section_id" ON "public"."student_users" ("section_id");
CREATE INDEX "idx_student_users_active" ON "public"."student_users" ("is_active");

-- Enable Row Level Security
ALTER TABLE "public"."student_users" ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy for public access
DROP POLICY IF EXISTS "Allow public access to student_users" ON "public"."student_users";
CREATE POLICY "Allow public access to student_users" ON "public"."student_users"
    FOR ALL USING (true);

-- Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_student_users_updated_at ON "public"."student_users";
CREATE TRIGGER update_student_users_updated_at
    BEFORE UPDATE ON "public"."student_users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON "public"."student_users" TO anon;
GRANT ALL ON "public"."student_users" TO authenticated;

-- Insert test data
INSERT INTO "public"."student_users" (
    user_id, email, full_name, batch, section, has_skipped_selection, is_guest_user
) VALUES 
(
    'student_' || extract(epoch from now()) || '_test',
    'test@diu.edu.bd',
    'Test Student',
    '63',
    'G',
    false,
    false
),
(
    'guest_' || extract(epoch from now()) || '_test',
    'guest@example.com',
    'Guest User',
    NULL,
    NULL,
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Student users table created successfully!' as result;

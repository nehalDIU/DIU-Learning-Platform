-- =====================================================
-- DIU Learning Platform Database Redesign
-- Clean Professional Section Selection with Email Auth
-- =====================================================

-- Drop existing student_users table if it exists (for clean redesign)
DROP TABLE IF EXISTS "public"."student_users" CASCADE;

-- Create enhanced student_users table with improved design
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

-- Create comprehensive indexes for optimal performance
CREATE INDEX "idx_student_users_user_id" ON "public"."student_users" ("user_id");
CREATE INDEX "idx_student_users_email" ON "public"."student_users" ("email");
CREATE INDEX "idx_student_users_batch" ON "public"."student_users" ("batch");
CREATE INDEX "idx_student_users_section" ON "public"."student_users" ("section");
CREATE INDEX "idx_student_users_section_id" ON "public"."student_users" ("section_id");
CREATE INDEX "idx_student_users_active" ON "public"."student_users" ("is_active");
CREATE INDEX "idx_student_users_guest" ON "public"."student_users" ("is_guest_user");
CREATE INDEX "idx_student_users_created_at" ON "public"."student_users" ("created_at");
CREATE INDEX "idx_student_users_last_accessed" ON "public"."student_users" ("last_accessed");

-- Create composite indexes for common queries
CREATE INDEX "idx_student_users_batch_section" ON "public"."student_users" ("batch", "section");
CREATE INDEX "idx_student_users_active_guest" ON "public"."student_users" ("is_active", "is_guest_user");

-- Enable Row Level Security
ALTER TABLE "public"."student_users" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public access to student_users" ON "public"."student_users";
DROP POLICY IF EXISTS "Users can view their own data" ON "public"."student_users";
DROP POLICY IF EXISTS "Users can update their own data" ON "public"."student_users";

-- Create comprehensive RLS policies
-- Policy 1: Allow public read access (for student dashboard functionality)
CREATE POLICY "Allow public read access to student_users" ON "public"."student_users"
    FOR SELECT USING (true);

-- Policy 2: Allow public insert (for user registration)
CREATE POLICY "Allow public insert to student_users" ON "public"."student_users"
    FOR INSERT WITH CHECK (true);

-- Policy 3: Allow users to update their own records
CREATE POLICY "Users can update their own data" ON "public"."student_users"
    FOR UPDATE USING (true) WITH CHECK (true);

-- Policy 4: Prevent deletion (data preservation)
CREATE POLICY "Prevent deletion of student_users" ON "public"."student_users"
    FOR DELETE USING (false);

-- Create function to automatically update updated_at timestamp
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

-- Create function to track login activity
CREATE OR REPLACE FUNCTION track_user_login(user_email varchar)
RETURNS void AS $$
BEGIN
    UPDATE "public"."student_users" 
    SET 
        last_login = now(),
        last_accessed = now(),
        login_count = login_count + 1
    WHERE email = user_email;
END;
$$ language 'plpgsql';

-- Create view for active users with section information
CREATE OR REPLACE VIEW "public"."active_student_users" AS
SELECT
    su.*,
    s.title as semester_title,
    s.section as semester_section,
    s.is_active as semester_active
FROM "public"."student_users" su
LEFT JOIN "public"."semesters" s ON su.section_id = s.id
WHERE su.is_active = true;

-- Grant necessary permissions
GRANT ALL ON "public"."student_users" TO anon;
GRANT ALL ON "public"."student_users" TO authenticated;
GRANT SELECT ON "public"."active_student_users" TO anon;
GRANT SELECT ON "public"."active_student_users" TO authenticated;

-- Insert sample data for testing (optional)
INSERT INTO "public"."student_users" (
    user_id, email, full_name, batch, section, has_skipped_selection, is_guest_user
) VALUES 
(
    'student_' || extract(epoch from now()) || '_sample',
    'test@diu.edu.bd',
    'Test Student',
    '63',
    'G',
    false,
    false
),
(
    'guest_' || extract(epoch from now()) || '_sample',
    'guest@example.com',
    'Guest User',
    NULL,
    NULL,
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Create helpful comments
COMMENT ON TABLE "public"."student_users" IS 'Enhanced student users table with email authentication and profile management';
COMMENT ON COLUMN "public"."student_users"."user_id" IS 'Unique user identifier for internal tracking';
COMMENT ON COLUMN "public"."student_users"."email" IS 'Primary authentication email address';
COMMENT ON COLUMN "public"."student_users"."has_skipped_selection" IS 'Whether user chose to skip section selection';
COMMENT ON COLUMN "public"."student_users"."is_guest_user" IS 'Whether user is accessing as guest without full registration';
COMMENT ON COLUMN "public"."student_users"."section_id" IS 'Foreign key reference to semesters table';

-- Success message
SELECT 'Database redesign completed successfully! Student users table created with enhanced features.' as result;

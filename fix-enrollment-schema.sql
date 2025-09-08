-- Fix user_course_enrollments table schema for multiple enrollments
-- This script ensures the database schema supports multiple course enrollments per user

-- Drop existing table if it has issues (be careful in production!)
-- DROP TABLE IF EXISTS "public"."user_course_enrollments" CASCADE;

-- Create user_course_enrollments table with proper schema
CREATE TABLE IF NOT EXISTS "public"."user_course_enrollments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar(255) NOT NULL,
    "course_id" uuid NOT NULL,
    "status" varchar(50) DEFAULT 'active' NOT NULL,
    "progress_percentage" integer DEFAULT 0 NOT NULL,
    "enrollment_date" timestamp with time zone DEFAULT now() NOT NULL,
    "last_accessed" timestamp with time zone,
    "completion_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    -- Primary key
    CONSTRAINT "user_course_enrollments_pkey" PRIMARY KEY ("id"),
    
    -- Unique constraint to prevent duplicate enrollments (one user per course)
    CONSTRAINT "user_course_enrollments_user_course_unique" UNIQUE ("user_id", "course_id"),
    
    -- Foreign key to courses table
    CONSTRAINT "user_course_enrollments_course_id_fkey" 
        FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT "user_course_enrollments_progress_check" 
        CHECK (("progress_percentage" >= 0) AND ("progress_percentage" <= 100)),
    CONSTRAINT "user_course_enrollments_status_check" 
        CHECK (("status" IN ('active', 'completed', 'dropped', 'paused')))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_user_course_enrollments_user_id" 
    ON "public"."user_course_enrollments" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_course_enrollments_course_id" 
    ON "public"."user_course_enrollments" ("course_id");
CREATE INDEX IF NOT EXISTS "idx_user_course_enrollments_status" 
    ON "public"."user_course_enrollments" ("status");
CREATE INDEX IF NOT EXISTS "idx_user_course_enrollments_enrollment_date" 
    ON "public"."user_course_enrollments" ("enrollment_date");

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_course_enrollments_updated_at ON "public"."user_course_enrollments";
CREATE TRIGGER update_user_course_enrollments_updated_at
    BEFORE UPDATE ON "public"."user_course_enrollments"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE "public"."user_course_enrollments" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for now, can be tightened later)
DROP POLICY IF EXISTS "Users can view enrollments" ON "public"."user_course_enrollments";
CREATE POLICY "Users can view enrollments" ON "public"."user_course_enrollments"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert enrollments" ON "public"."user_course_enrollments";
CREATE POLICY "Users can insert enrollments" ON "public"."user_course_enrollments"
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update enrollments" ON "public"."user_course_enrollments";
CREATE POLICY "Users can update enrollments" ON "public"."user_course_enrollments"
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete enrollments" ON "public"."user_course_enrollments";
CREATE POLICY "Users can delete enrollments" ON "public"."user_course_enrollments"
    FOR DELETE USING (true);

-- Grant necessary permissions
GRANT ALL ON "public"."user_course_enrollments" TO anon;
GRANT ALL ON "public"."user_course_enrollments" TO authenticated;
GRANT ALL ON "public"."user_course_enrollments" TO service_role;

-- Insert some demo data for testing (only if courses exist)
INSERT INTO "public"."user_course_enrollments" ("user_id", "course_id", "status", "progress_percentage", "enrollment_date")
SELECT 
    'demo_user_default',
    c.id,
    'active',
    FLOOR(RANDOM() * 101)::integer,
    now() - (RANDOM() * interval '30 days')
FROM "public"."courses" c
WHERE c.is_highlighted = true
LIMIT 3
ON CONFLICT ("user_id", "course_id") DO NOTHING;

-- Verify table creation and show summary
SELECT 
    'user_course_enrollments table setup completed successfully!' as result,
    COUNT(*) as total_enrollments,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT course_id) as unique_courses
FROM "public"."user_course_enrollments";

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_course_enrollments'
ORDER BY ordinal_position;

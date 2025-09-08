-- Create student_users table for batch-based user authentication
CREATE TABLE IF NOT EXISTS "public"."student_users" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar(255) UNIQUE NOT NULL,
    "email" varchar(255) UNIQUE NOT NULL,
    "full_name" varchar(255),
    "batch" varchar(10),
    "section" varchar(10),
    "section_id" uuid,
    "has_skipped_selection" boolean DEFAULT false,
    "profile_photo_url" text,
    "phone" varchar(20),
    "student_id" varchar(50),
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "last_accessed" timestamp with time zone DEFAULT now(),
    "is_active" boolean DEFAULT true,
    CONSTRAINT "student_users_pkey" PRIMARY KEY ("id")
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS "idx_student_users_user_id" ON "public"."student_users" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_student_users_email" ON "public"."student_users" ("email");
CREATE INDEX IF NOT EXISTS "idx_student_users_batch" ON "public"."student_users" ("batch");
CREATE INDEX IF NOT EXISTS "idx_student_users_section_id" ON "public"."student_users" ("section_id");

-- Enable RLS
ALTER TABLE "public"."student_users" ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public access (students don't need authentication)
DROP POLICY IF EXISTS "Allow public access to student_users" ON "public"."student_users";
CREATE POLICY "Allow public access to student_users" ON "public"."student_users"
    FOR ALL USING (true);

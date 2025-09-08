# Database Setup Instructions

## Required: Create student_users Table

Please run the following SQL in your Supabase SQL Editor:

**Dashboard URL**: https://supabase.com/dashboard/project/bpfsnwfaxmhtsdjcjeju/sql

```sql
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
```

## After Running the SQL

1. Restart the application: `npm run dev`
2. Visit http://localhost:3001
3. Test the new section selection form
4. Try both joining a batch and skipping selection
5. Test the profile functionality in the header

## Features to Test

### 1. Section Selection Form
- ✅ Email validation
- ✅ Batch selection from dropdown
- ✅ Section selection within batch
- ✅ Skip functionality
- ✅ Success feedback

### 2. Header Profile
- ✅ User avatar display
- ✅ Profile dropdown with user info
- ✅ Edit profile link
- ✅ Sign out functionality

### 3. Profile Management
- ✅ Edit personal information
- ✅ Update batch/section
- ✅ Form validation
- ✅ Success feedback

### 4. User Flow
- ✅ Email-based authentication
- ✅ Guest user support
- ✅ Profile persistence
- ✅ Responsive design

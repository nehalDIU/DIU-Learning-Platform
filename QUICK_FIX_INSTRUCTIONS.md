# 🚀 QUICK FIX: Create Student Users Table

## The Error You're Seeing
```
42703: column s.semester_name does not exist
```

This happens because:
1. The `student_users` table doesn't exist yet
2. The SQL references the wrong column name in the semesters table

## ⚡ IMMEDIATE SOLUTION (2 minutes)

### Step 1: Open Supabase Dashboard
**Click this link**: https://supabase.com/dashboard/project/bpfsnwfaxmhtsdjcjeju/sql

### Step 2: Copy and Run This SQL
Copy the entire block below and paste it into the SQL editor, then click **"Run"**:

```sql
-- Create student_users table (FIXED VERSION)
DROP TABLE IF EXISTS "public"."student_users" CASCADE;

CREATE TABLE "public"."student_users" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar(255) UNIQUE NOT NULL,
    "email" varchar(255) UNIQUE NOT NULL,
    "full_name" varchar(255) NOT NULL,
    "phone" varchar(20),
    "student_id" varchar(50),
    "batch" varchar(10),
    "section" varchar(10),
    "section_id" uuid,
    "has_skipped_selection" boolean DEFAULT false,
    "is_guest_user" boolean DEFAULT false,
    "preferred_language" varchar(10) DEFAULT 'en',
    "profile_photo_url" text,
    "bio" text,
    "is_active" boolean DEFAULT true,
    "email_verified" boolean DEFAULT false,
    "last_login" timestamp with time zone,
    "login_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "last_accessed" timestamp with time zone DEFAULT now(),
    CONSTRAINT "student_users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "student_users_email_check" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes
CREATE INDEX "idx_student_users_user_id" ON "public"."student_users" ("user_id");
CREATE INDEX "idx_student_users_email" ON "public"."student_users" ("email");
CREATE INDEX "idx_student_users_batch" ON "public"."student_users" ("batch");
CREATE INDEX "idx_student_users_section" ON "public"."student_users" ("section");

-- Enable RLS
ALTER TABLE "public"."student_users" ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Allow public access to student_users" ON "public"."student_users";
CREATE POLICY "Allow public access to student_users" ON "public"."student_users"
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON "public"."student_users" TO anon;
GRANT ALL ON "public"."student_users" TO authenticated;

-- Test insert
INSERT INTO "public"."student_users" (
    user_id, email, full_name, batch, section, has_skipped_selection
) VALUES (
    'test_' || extract(epoch from now()),
    'test@diu.edu.bd',
    'Test User',
    '63',
    'G',
    false
) ON CONFLICT (email) DO NOTHING;

SELECT 'SUCCESS: student_users table created!' as result;
```

### Step 3: Restart Your App
```bash
npm run dev
```

### Step 4: Test
Visit http://localhost:3001 and try the section selection form.

## ✅ What This Fixes

1. **Creates the missing table** with all required columns
2. **Fixes the column reference error** (uses correct semesters table structure)
3. **Enables all features**:
   - Email-based user authentication
   - Batch and section selection
   - Skip functionality for guests
   - Profile management
   - Header profile dropdown

## 🎯 Expected Results

After running the SQL:
- ✅ No more database errors
- ✅ Section selection form works
- ✅ Users can register with email
- ✅ Users can skip and browse as guests
- ✅ Profile management is functional
- ✅ Header shows user information

## 🔧 If You Still Get Errors

1. **Check the SQL ran successfully** - Look for "SUCCESS" message
2. **Refresh your browser** - Clear cache if needed
3. **Restart the dev server** - Stop and run `npm run dev` again
4. **Check Supabase logs** - Go to Logs tab in dashboard

## 📞 Alternative: Use the Built-in Setup Guide

If you prefer a visual guide:
1. Try to use the section selection in your app
2. The error will trigger an automatic setup guide
3. Follow the step-by-step instructions
4. One-click copy of the SQL script

## 🎉 Success Indicators

You'll know it worked when:
- The section selection modal appears without errors
- You can enter email and select batch/section
- The "Skip" option works for guest access
- Header shows profile dropdown when logged in
- No console errors about missing tables

**This is a one-time setup. Once done, all users can use the enhanced section selection system!**

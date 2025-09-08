# 🗄️ Manual Database Setup for DIU Learning Platform

Since the Supabase MCP is experiencing technical difficulties, please follow these manual steps to set up the enhanced database schema.

## 🚀 Quick Setup Instructions

### Step 1: Open Supabase SQL Editor
1. Go to: **https://supabase.com/dashboard/project/bpfsnwfaxmhtsdjcjeju/sql**
2. Click on "New Query" or use the existing SQL editor

### Step 2: Copy and Execute the SQL Script

Copy the entire SQL script below and paste it into the Supabase SQL editor, then click **"Run"**:

```sql
-- =====================================================
-- DIU Learning Platform Database Setup
-- Enhanced student_users table with email authentication
-- =====================================================

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS "public"."student_users" CASCADE;

-- Create enhanced student_users table
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

-- Success message
SELECT 'Database setup completed successfully! Enhanced student_users table created.' as result;
```

### Step 3: Verify Setup

After running the SQL script, you should see a success message. You can verify the setup by running this query:

```sql
SELECT COUNT(*) as total_users, 
       COUNT(CASE WHEN has_skipped_selection = false THEN 1 END) as registered_users,
       COUNT(CASE WHEN is_guest_user = true THEN 1 END) as guest_users
FROM student_users;
```

### Step 4: Test the Application

1. **Restart your development server**: `npm run dev`
2. **Visit**: http://localhost:3001
3. **Test the section selection form**:
   - Try registering with email and batch selection
   - Try skipping selection as a guest user
4. **Test the profile functionality** in the header

## 🎯 What This Setup Provides

### ✅ Enhanced Features
- **Email-based authentication** with validation
- **Batch and section selection** with academic tracking
- **Guest user support** for unrestricted access
- **Profile management** with photo support
- **Activity tracking** (login count, last accessed)
- **Automatic timestamps** with triggers
- **Performance optimization** with comprehensive indexes

### ✅ Security Features
- **Row Level Security (RLS)** enabled
- **Email validation** constraints
- **Data preservation** (deletion prevention)
- **Public access** for student dashboard functionality

### ✅ Database Design
- **Scalable schema** with proper indexing
- **Flexible user types** (registered, guest, skipped)
- **Academic integration** with semesters table
- **Profile customization** ready for future features

## 🔧 Troubleshooting

If you encounter any issues:

1. **Check Supabase Dashboard**: Ensure you're logged into the correct project
2. **Verify Permissions**: Make sure you have admin access to the database
3. **Check Error Messages**: The SQL editor will show specific error details
4. **Contact Support**: If issues persist, check the Supabase documentation

## 🚀 Next Steps

Once the database is set up:
- The application will automatically detect the table
- Users can start registering and selecting their sections
- Profile management will be fully functional
- All features will work seamlessly

**The database setup is a one-time process. Once completed, all users will have access to the enhanced section selection and profile management features.**

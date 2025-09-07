-- =====================================================
-- COMPLETE PROFILE MANAGEMENT MIGRATION
-- =====================================================
-- This script sets up the complete profile management system
-- Run this entire script in the Supabase SQL Editor

-- =====================================================
-- STEP 1: ADD PROFILE COLUMNS TO ADMIN_USERS TABLE
-- =====================================================

-- Add new columns to admin_users table
ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS social_media_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
ADD COLUMN IF NOT EXISTS office_location TEXT,
ADD COLUMN IF NOT EXISTS office_hours TEXT,
ADD COLUMN IF NOT EXISTS specializations TEXT[],
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[],
ADD COLUMN IF NOT EXISTS education_background JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'department',
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_student_contact BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';

-- =====================================================
-- STEP 2: ADD CONSTRAINTS AND VALIDATION
-- =====================================================

-- Add constraints for profile visibility (with proper error handling)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'valid_profile_visibility'
        AND conrelid = 'public.admin_users'::regclass
    ) THEN
        ALTER TABLE public.admin_users
        ADD CONSTRAINT valid_profile_visibility
        CHECK (profile_visibility IN ('public', 'department', 'private'));
    END IF;
END $$;

-- Add constraints for URL validation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'valid_website_url'
        AND conrelid = 'public.admin_users'::regclass
    ) THEN
        ALTER TABLE public.admin_users
        ADD CONSTRAINT valid_website_url
        CHECK (website_url IS NULL OR website_url ~* '^https?://[^\s/$.?#].[^\s]*$');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'valid_linkedin_url'
        AND conrelid = 'public.admin_users'::regclass
    ) THEN
        ALTER TABLE public.admin_users
        ADD CONSTRAINT valid_linkedin_url
        CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://(www\.)?linkedin\.com/.*$');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'valid_twitter_url'
        AND conrelid = 'public.admin_users'::regclass
    ) THEN
        ALTER TABLE public.admin_users
        ADD CONSTRAINT valid_twitter_url
        CHECK (twitter_url IS NULL OR twitter_url ~* '^https?://(www\.)?(twitter\.com|x\.com)/.*$');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'valid_facebook_url'
        AND conrelid = 'public.admin_users'::regclass
    ) THEN
        ALTER TABLE public.admin_users
        ADD CONSTRAINT valid_facebook_url
        CHECK (facebook_url IS NULL OR facebook_url ~* '^https?://(www\.)?facebook\.com/.*$');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'valid_instagram_url'
        AND conrelid = 'public.admin_users'::regclass
    ) THEN
        ALTER TABLE public.admin_users
        ADD CONSTRAINT valid_instagram_url
        CHECK (instagram_url IS NULL OR instagram_url ~* '^https?://(www\.)?instagram\.com/.*$');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'valid_github_url'
        AND conrelid = 'public.admin_users'::regclass
    ) THEN
        ALTER TABLE public.admin_users
        ADD CONSTRAINT valid_github_url
        CHECK (github_url IS NULL OR github_url ~* '^https?://(www\.)?github\.com/.*$');
    END IF;
END $$;

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Add index for profile photo URL for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_users_profile_photo
ON public.admin_users(profile_photo_url)
WHERE profile_photo_url IS NOT NULL;

-- Add index for profile visibility for filtering
CREATE INDEX IF NOT EXISTS idx_admin_users_profile_visibility
ON public.admin_users(profile_visibility);

-- =====================================================
-- STEP 4: CREATE/UPDATE TRIGGERS
-- =====================================================

-- Update the updated_at trigger to include new columns
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_admin_users_updated_at_trigger ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at_trigger
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN public.admin_users.profile_photo_url IS 'URL to the user profile photo stored in Supabase storage';
COMMENT ON COLUMN public.admin_users.bio IS 'User biography/description';
COMMENT ON COLUMN public.admin_users.social_media_links IS 'JSON object containing various social media links';
COMMENT ON COLUMN public.admin_users.address IS 'Physical address of the user';
COMMENT ON COLUMN public.admin_users.date_of_birth IS 'Date of birth for age calculation and birthday notifications';
COMMENT ON COLUMN public.admin_users.website_url IS 'Personal or professional website URL';
COMMENT ON COLUMN public.admin_users.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.admin_users.twitter_url IS 'Twitter/X profile URL';
COMMENT ON COLUMN public.admin_users.facebook_url IS 'Facebook profile URL';
COMMENT ON COLUMN public.admin_users.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN public.admin_users.github_url IS 'GitHub profile URL';
COMMENT ON COLUMN public.admin_users.emergency_contact_name IS 'Emergency contact person name';
COMMENT ON COLUMN public.admin_users.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN public.admin_users.emergency_contact_relationship IS 'Relationship to emergency contact';
COMMENT ON COLUMN public.admin_users.office_location IS 'Office/room location';
COMMENT ON COLUMN public.admin_users.office_hours IS 'Office hours for student meetings';
COMMENT ON COLUMN public.admin_users.specializations IS 'Array of specialization areas';
COMMENT ON COLUMN public.admin_users.languages_spoken IS 'Array of languages the user speaks';
COMMENT ON COLUMN public.admin_users.education_background IS 'JSON array of education history';
COMMENT ON COLUMN public.admin_users.certifications IS 'JSON array of certifications and achievements';
COMMENT ON COLUMN public.admin_users.profile_visibility IS 'Who can see the profile: public, department, private';
COMMENT ON COLUMN public.admin_users.show_email IS 'Whether to show email in public profile';
COMMENT ON COLUMN public.admin_users.show_phone IS 'Whether to show phone in public profile';
COMMENT ON COLUMN public.admin_users.allow_student_contact IS 'Whether students can contact this user';
COMMENT ON COLUMN public.admin_users.notification_preferences IS 'JSON object with notification settings';

-- =====================================================
-- STEP 5: UPDATE EXISTING USERS WITH DEFAULT VALUES
-- =====================================================

-- Sample data update for existing users (optional)
UPDATE public.admin_users
SET
    notification_preferences = jsonb_build_object(
        'email_notifications', true,
        'push_notifications', true,
        'weekly_reports', true,
        'semester_updates', true,
        'student_activity', false
    ),
    profile_visibility = 'department',
    show_email = false,
    show_phone = false,
    allow_student_contact = true
WHERE notification_preferences = '{}' OR notification_preferences IS NULL;

-- =====================================================
-- STEP 6: CREATE PUBLIC PROFILE VIEW
-- =====================================================

-- Create a view for public profile information
CREATE OR REPLACE VIEW public.admin_user_public_profiles AS
SELECT
    id,
    full_name,
    department,
    role as designation,
    bio,
    profile_photo_url,
    website_url,
    linkedin_url,
    twitter_url,
    facebook_url,
    instagram_url,
    github_url,
    office_location,
    office_hours,
    specializations,
    languages_spoken,
    CASE WHEN show_email THEN email ELSE NULL END as email,
    CASE WHEN show_phone THEN phone ELSE NULL END as phone,
    allow_student_contact,
    created_at
FROM public.admin_users
WHERE is_active = true
AND profile_visibility IN ('public', 'department');

-- Grant appropriate permissions
GRANT SELECT ON public.admin_user_public_profiles TO anon;
GRANT SELECT ON public.admin_user_public_profiles TO authenticated;

-- =====================================================
-- STEP 7: SETUP STORAGE BUCKET (MANUAL STEP REQUIRED)
-- =====================================================

-- NOTE: The storage bucket must be created manually in Supabase Dashboard
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket named "profile-photos"
-- 3. Set as Public: true
-- 4. File size limit: 5242880 (5MB)
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage policies for profile photos (with proper error handling)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can upload own profile photos'
        AND tablename = 'objects'
    ) THEN
        CREATE POLICY "Users can upload own profile photos" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = 'profile-photos'
                AND auth.role() = 'authenticated'
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Anyone can view profile photos'
        AND tablename = 'objects'
    ) THEN
        CREATE POLICY "Anyone can view profile photos" ON storage.objects
            FOR SELECT USING (bucket_id = 'profile-photos');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can update own profile photos'
        AND tablename = 'objects'
    ) THEN
        CREATE POLICY "Users can update own profile photos" ON storage.objects
            FOR UPDATE USING (
                bucket_id = 'profile-photos'
                AND auth.role() = 'authenticated'
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can delete own profile photos'
        AND tablename = 'objects'
    ) THEN
        CREATE POLICY "Users can delete own profile photos" ON storage.objects
            FOR DELETE USING (
                bucket_id = 'profile-photos'
                AND auth.role() = 'authenticated'
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END $$;

-- =====================================================
-- STEP 8: STORAGE HELPER FUNCTIONS
-- =====================================================

-- Function to generate profile photo URL
CREATE OR REPLACE FUNCTION public.get_profile_photo_url(user_id UUID, filename TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN format('%s/storage/v1/object/public/profile-photos/%s/%s',
                  current_setting('app.supabase_url'),
                  user_id,
                  filename);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old profile photos when a new one is uploaded
CREATE OR REPLACE FUNCTION public.cleanup_old_profile_photos()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete old profile photos from storage when profile_photo_url is updated
    IF OLD.profile_photo_url IS NOT NULL AND NEW.profile_photo_url != OLD.profile_photo_url THEN
        -- Extract filename from old URL and delete from storage
        PERFORM storage.delete_object('profile-photos',
            format('%s/%s', OLD.id, split_part(OLD.profile_photo_url, '/', -1)));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to cleanup old profile photos
DROP TRIGGER IF EXISTS cleanup_old_profile_photos_trigger ON public.admin_users;
CREATE TRIGGER cleanup_old_profile_photos_trigger
    BEFORE UPDATE OF profile_photo_url ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_old_profile_photos();

-- =====================================================
-- STEP 9: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own profile (with proper error handling)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can view own profile'
        AND tablename = 'admin_users'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.admin_users
            FOR SELECT USING (auth.uid()::text = id::text);
    END IF;
END $$;

-- Policy for users to update their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can update own profile'
        AND tablename = 'admin_users'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.admin_users
            FOR UPDATE USING (auth.uid()::text = id::text);
    END IF;
END $$;

-- Policy for department visibility
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Department members can view department profiles'
        AND tablename = 'admin_users'
    ) THEN
        CREATE POLICY "Department members can view department profiles" ON public.admin_users
            FOR SELECT USING (
                profile_visibility = 'public' OR
                (profile_visibility = 'department' AND department = (
                    SELECT department FROM public.admin_users WHERE id::text = auth.uid()::text
                ))
            );
    END IF;
END $$;

-- =====================================================
-- STEP 10: VERIFICATION AND COMPLETION
-- =====================================================

-- Verify new columns were added
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'admin_users'
    AND column_name IN ('profile_photo_url', 'bio', 'website_url', 'linkedin_url', 'notification_preferences');

    IF column_count >= 5 THEN
        RAISE NOTICE 'SUCCESS: Profile columns added successfully (% columns found)', column_count;
    ELSE
        RAISE NOTICE 'WARNING: Only % profile columns found, expected at least 5', column_count;
    END IF;
END $$;

-- =====================================================
-- MANUAL STEPS REQUIRED AFTER RUNNING THIS SCRIPT:
-- =====================================================

-- 1. CREATE STORAGE BUCKET:
--    - Go to Supabase Dashboard > Storage
--    - Click "Create Bucket"
--    - Name: "profile-photos"
--    - Public: true
--    - File size limit: 5242880 (5MB)
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- 2. VERIFY SETUP:
--    Run: node scripts/test-profile-functionality.js

-- 3. TEST FUNCTIONALITY:
--    - Start the app: npm run dev
--    - Navigate to /SectionAdmin/settings
--    - Test profile photo upload
--    - Test social media links
--    - Test profile information updates

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Profile Management Migration Completed Successfully!' as status;

-- =====================================================
-- SIMPLE PROFILE MANAGEMENT MIGRATION
-- =====================================================
-- This is a simplified version that avoids syntax issues
-- Run this script in the Supabase SQL Editor

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
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Add index for profile photo URL for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_users_profile_photo 
ON public.admin_users(profile_photo_url) 
WHERE profile_photo_url IS NOT NULL;

-- Add index for profile visibility for filtering
CREATE INDEX IF NOT EXISTS idx_admin_users_profile_visibility 
ON public.admin_users(profile_visibility);

-- =====================================================
-- STEP 3: UPDATE EXISTING USERS WITH DEFAULT VALUES
-- =====================================================

-- Update existing users with default notification preferences
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
-- STEP 4: CREATE PUBLIC PROFILE VIEW
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
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Note: RLS on storage.objects is already enabled by Supabase
-- No need to enable it manually

-- =====================================================
-- STEP 6: ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

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
-- STEP 7: VERIFICATION
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
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Simple Profile Management Migration Completed Successfully!' as status;

-- =====================================================
-- NEXT STEPS:
-- =====================================================
-- 1. The storage bucket "profile-photos" should already exist
-- 2. Run: node scripts/test-profile-functionality.js
-- 3. Start the app: npm run dev
-- 4. Navigate to /SectionAdmin/settings
-- 5. Test profile features
-- =====================================================

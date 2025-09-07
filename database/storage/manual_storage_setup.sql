-- Manual Storage Setup Script
-- Run this script in the Supabase SQL Editor after creating the storage bucket

-- Step 1: Create the profile-photos bucket (run this in the Storage section of Supabase Dashboard)
-- Bucket name: profile-photos
-- Public: true
-- File size limit: 5242880 (5MB)
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Step 2: Set up storage policies (run this in SQL Editor)

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload their own profile photos
CREATE POLICY "Users can upload own profile photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-photos' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Allow users to view all profile photos (since bucket is public)
CREATE POLICY "Anyone can view profile photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-photos');

-- Policy: Allow users to update their own profile photos
CREATE POLICY "Users can update own profile photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile-photos' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Allow users to delete their own profile photos
CREATE POLICY "Users can delete own profile photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-photos' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Step 3: Create helper functions

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

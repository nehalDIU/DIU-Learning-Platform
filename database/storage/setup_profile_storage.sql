-- Storage setup for profile photos
-- Description: Creates storage bucket and policies for user profile photos

-- Create the profile-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects
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

-- Function to validate and resize profile photos (placeholder for future implementation)
CREATE OR REPLACE FUNCTION public.validate_profile_photo(file_path TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- This function can be extended to validate image dimensions, file size, etc.
    -- For now, just return true
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

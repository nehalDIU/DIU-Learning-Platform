# Profile Management Setup Guide

## Overview

This guide will help you set up the enhanced profile management functionality for the SectionAdmin settings page.

## Prerequisites

- Supabase project with admin access
- DIU Learning Platform codebase
- Environment variables configured

## Step-by-Step Setup

### 1. Database Schema Migration

#### Option A: Using Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/migrations/manual_profile_migration.sql`
4. Click **Run** to execute the migration
5. Verify that all columns were added successfully

#### Option B: Using the Migration Script

```bash
# If you prefer to use the script (may require additional setup)
node scripts/apply-migrations-direct.js
```

### 2. Storage Bucket Setup

#### Create the Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **Create Bucket**
3. Set the following:
   - **Name**: `profile-photos`
   - **Public**: ✅ Enabled
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
4. Click **Create bucket**

#### Set Up Storage Policies

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the contents of `database/storage/manual_storage_setup.sql`
3. Click **Run** to execute the storage policies

### 3. Verify Setup

#### Test Database Schema

Run the test script to verify everything is working:

```bash
node scripts/test-profile-functionality.js
```

Expected output:
```
✅ Database schema is correct
✅ Storage bucket exists: profile-photos
✅ Profile update successful
✅ Public profile view working
✅ API endpoint files exist
```

#### Manual Verification

1. **Check Database Columns**:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'admin_users' 
   AND column_name LIKE '%profile%' 
   OR column_name LIKE '%social%'
   OR column_name LIKE '%notification%';
   ```

2. **Check Storage Bucket**:
   - Go to Storage in Supabase Dashboard
   - Verify `profile-photos` bucket exists and is public

3. **Check Storage Policies**:
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'objects' 
   AND policyname LIKE '%profile%';
   ```

### 4. Start the Application

```bash
npm run dev
```

Navigate to `/SectionAdmin/settings` to test the new profile functionality.

## Features to Test

### Profile Photo Upload

1. Click "Upload Photo" in the Profile Information section
2. Select an image file (JPEG, PNG, WebP, or GIF, max 5MB)
3. Preview the image in the dialog
4. Click "Upload Photo"
5. Verify the photo appears in the profile section

### Social Media Links

1. Scroll to the "Social Media & Links" section
2. Enter URLs for various platforms:
   - Website: `https://example.com`
   - LinkedIn: `https://linkedin.com/in/username`
   - Twitter: `https://twitter.com/username`
   - GitHub: `https://github.com/username`
3. Click the external link icons to test opening
4. Verify links are saved automatically

### Extended Profile Information

1. Fill in additional fields:
   - Bio/description
   - Address
   - Date of birth
   - Office location and hours
   - Emergency contact information
2. Click "Save Changes"
3. Refresh the page to verify data persistence

### Privacy Settings

1. Test profile visibility options:
   - Public: Everyone can see
   - Department: Only department members
   - Private: Only you
2. Toggle email/phone visibility
3. Set student contact permissions
4. Save and verify settings

## Troubleshooting

### Common Issues

#### 1. "Column does not exist" Error

**Problem**: Database migration didn't run successfully

**Solution**:
- Re-run the manual migration SQL script
- Check for any SQL errors in the Supabase logs
- Verify you have the correct permissions

#### 2. "Storage bucket not found" Error

**Problem**: Storage bucket wasn't created or configured properly

**Solution**:
- Create the bucket manually in Supabase Dashboard
- Ensure it's set to public
- Run the storage policies SQL script

#### 3. Profile Photo Upload Fails

**Problem**: Storage policies not configured correctly

**Solution**:
- Check storage policies in Supabase Dashboard
- Verify the bucket is public
- Check file size and type restrictions

#### 4. API Endpoints Not Working

**Problem**: Authentication or API configuration issues

**Solution**:
- Verify JWT_SECRET is set in environment variables
- Check that user is properly authenticated
- Review browser console for error messages

### Debug Steps

1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for JavaScript errors in Console tab
   - Check Network tab for failed API requests

2. **Check Supabase Logs**:
   - Go to Supabase Dashboard > Logs
   - Look for database or storage errors
   - Check API request logs

3. **Verify Environment Variables**:
   ```bash
   # Check .env.local file contains:
   SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-jwt-secret
   ```

4. **Test API Endpoints**:
   ```bash
   # Test profile endpoint
   curl -X GET http://localhost:3000/api/profile \
     -H "Cookie: admin_token=your-jwt-token"
   ```

## Security Considerations

- Profile photos are stored in a public bucket but organized by user ID
- RLS policies ensure users can only modify their own data
- URL validation prevents malicious links
- File type and size restrictions prevent abuse
- JWT authentication protects API endpoints

## Next Steps

After successful setup:

1. **Customize the UI**: Modify components to match your design system
2. **Add Validation**: Implement additional client-side validation
3. **Enhance Features**: Add image cropping, bulk operations, etc.
4. **Monitor Usage**: Set up analytics for profile features
5. **Backup Strategy**: Ensure profile photos are included in backups

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the logs in Supabase Dashboard
3. Test with the provided scripts
4. Check the browser console for errors

For additional help, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- Project README files

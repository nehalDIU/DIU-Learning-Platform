# Profile Management System

## Overview

The Profile Management System enhances the SectionAdmin settings with comprehensive profile functionality including profile photos, social media links, and extended user information.

## Features

### 🖼️ Profile Photo Management
- Upload profile photos (JPEG, PNG, WebP, GIF)
- 5MB file size limit
- Automatic image preview
- Photo deletion functionality
- Secure storage in Supabase

### 🌐 Social Media Integration
- Website URL
- LinkedIn profile
- Twitter/X profile
- Facebook profile
- Instagram profile
- GitHub profile
- URL validation and external link opening

### 👤 Extended Profile Information
- Bio/description
- Address
- Date of birth
- Office location and hours
- Emergency contact information
- Specializations and languages
- Education background
- Certifications

### 🔒 Privacy Controls
- Profile visibility settings (Public, Department, Private)
- Email/phone visibility toggles
- Student contact permissions
- Notification preferences

## Database Schema

### New Columns in `admin_users` Table

```sql
-- Profile Information
profile_photo_url TEXT
bio TEXT
social_media_links JSONB DEFAULT '{}'
address TEXT
date_of_birth DATE
website_url TEXT
linkedin_url TEXT
twitter_url TEXT
facebook_url TEXT
instagram_url TEXT
github_url TEXT

-- Contact Information
emergency_contact_name TEXT
emergency_contact_phone TEXT
emergency_contact_relationship TEXT
office_location TEXT
office_hours TEXT

-- Professional Information
specializations TEXT[]
languages_spoken TEXT[]
education_background JSONB DEFAULT '[]'
certifications JSONB DEFAULT '[]'

-- Privacy Settings
profile_visibility VARCHAR(20) DEFAULT 'department'
show_email BOOLEAN DEFAULT false
show_phone BOOLEAN DEFAULT false
allow_student_contact BOOLEAN DEFAULT true
notification_preferences JSONB DEFAULT '{}'
```

### Storage Bucket

- **Bucket Name**: `profile-photos`
- **Public Access**: Enabled
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Path Structure**: `{user_id}/{filename}`

## API Endpoints

### Profile Management

#### GET `/api/profile`
Retrieve current user's profile information.

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "full_name": "Dr. Sarah Ahmed",
    "email": "sarah@diu.edu.bd",
    "profile_photo_url": "https://...",
    "bio": "Experienced educator...",
    // ... other profile fields
  }
}
```

#### PUT `/api/profile`
Update user profile information.

**Request Body:**
```json
{
  "full_name": "Dr. Sarah Ahmed",
  "bio": "Updated bio...",
  "website_url": "https://example.com",
  "linkedin_url": "https://linkedin.com/in/user",
  "specializations": ["Computer Science", "Education"],
  "notification_preferences": {
    "email_notifications": true,
    "push_notifications": false
  }
}
```

### Profile Photo Management

#### POST `/api/profile/photo`
Upload a new profile photo.

**Request:** Multipart form data with `file` field

**Response:**
```json
{
  "success": true,
  "profile_photo_url": "https://...",
  "message": "Profile photo uploaded successfully"
}
```

#### DELETE `/api/profile/photo`
Remove current profile photo.

**Response:**
```json
{
  "success": true,
  "message": "Profile photo removed successfully"
}
```

## Components

### ProfilePhotoUpload
Reusable component for profile photo management.

```tsx
<ProfilePhotoUpload
  currentPhotoUrl={photoUrl}
  userName={userName}
  onPhotoUpdate={(newUrl) => handlePhotoUpdate(newUrl)}
/>
```

### SocialMediaLinks
Component for managing social media profiles.

```tsx
<SocialMediaLinks
  websiteUrl={websiteUrl}
  linkedinUrl={linkedinUrl}
  twitterUrl={twitterUrl}
  facebookUrl={facebookUrl}
  instagramUrl={instagramUrl}
  githubUrl={githubUrl}
  onUpdate={(links) => handleSocialMediaUpdate(links)}
/>
```

## Setup Instructions

### 1. Run Database Migrations

```bash
node scripts/run-profile-migrations.js
```

This will:
- Add new columns to `admin_users` table
- Create storage bucket for profile photos
- Set up RLS policies
- Create helper functions and triggers

### 2. Test Functionality

```bash
node scripts/test-profile-functionality.js
```

This will verify:
- Database schema changes
- Storage bucket configuration
- Profile update functionality
- API endpoint availability

### 3. Environment Variables

Ensure these variables are set in `.env.local`:

```env
SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

## Usage

### Accessing Profile Settings

1. Navigate to `/SectionAdmin/settings`
2. The Profile Information section now includes:
   - Profile photo upload
   - Extended profile fields
   - Social media links
   - Privacy settings

### Profile Photo Upload

1. Click "Upload Photo" or "Change Photo"
2. Select an image file (max 5MB)
3. Preview the image in the dialog
4. Click "Upload Photo" to save
5. Use "Remove" to delete current photo

### Social Media Links

1. Enter URLs for various social platforms
2. URLs are validated automatically
3. Click external link icon to open profiles
4. Changes are saved automatically

### Privacy Settings

1. Set profile visibility level
2. Toggle email/phone visibility
3. Control student contact permissions
4. Configure notification preferences

## Security Features

- **File Upload Validation**: Type and size restrictions
- **URL Validation**: Social media URL format checking
- **RLS Policies**: Row-level security for profile data
- **Storage Policies**: User-specific file access
- **JWT Authentication**: Secure API access

## Troubleshooting

### Common Issues

1. **Profile photo upload fails**
   - Check file size (max 5MB)
   - Verify file type (JPEG, PNG, WebP, GIF)
   - Ensure storage bucket exists

2. **Social media links not saving**
   - Verify URL format
   - Check network connectivity
   - Review browser console for errors

3. **Profile data not loading**
   - Verify JWT token is valid
   - Check API endpoint accessibility
   - Review database permissions

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API responses in Network tab
3. Test database connectivity
4. Review Supabase logs

## Future Enhancements

- Image cropping and resizing
- Bulk profile import/export
- Profile templates
- Advanced privacy controls
- Profile analytics
- Integration with external systems

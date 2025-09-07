# 🚀 Profile Management Setup Instructions

## ✅ Storage Bucket Created Successfully!

The `profile-photos` storage bucket has been created with the following settings:
- **Public**: true
- **File size limit**: 5MB
- **Allowed types**: JPEG, PNG, WebP, GIF

## 📋 Next Steps to Complete Setup

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Execute Migration Script**
   - Copy the entire contents of `database/migrations/add_profile_fields.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute the migration

   The script will:
   - ✅ Add 24 new profile columns to `admin_users` table
   - ✅ Create constraints and validation rules
   - ✅ Set up indexes for performance
   - ✅ Create storage policies for profile photos
   - ✅ Add helper functions and triggers
   - ✅ Create public profile view
   - ✅ Set up Row Level Security policies

### Step 2: Verify Setup

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

### Step 3: Test the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the settings page**:
   - Go to `http://localhost:3000/SectionAdmin/settings`
   - Login with your section admin credentials

3. **Test the new features**:
   - **Profile Photo Upload**: Click "Upload Photo" and select an image
   - **Social Media Links**: Add your LinkedIn, Twitter, GitHub, etc.
   - **Extended Profile**: Fill in bio, address, office hours, etc.
   - **Privacy Settings**: Configure profile visibility and contact permissions

## 🎯 New Features Available

### Profile Photo Management
- Upload photos with drag-and-drop interface
- Preview before uploading
- Automatic validation (type, size)
- Delete existing photos
- Secure storage with user-specific folders

### Social Media Integration
- Website URL
- LinkedIn profile
- Twitter/X profile
- Facebook profile
- Instagram profile
- GitHub profile
- URL validation and external link opening

### Extended Profile Information
- Bio/description
- Physical address
- Date of birth
- Office location and hours
- Emergency contact information
- Specializations and languages spoken
- Education background
- Certifications and achievements

### Privacy Controls
- Profile visibility (Public, Department, Private)
- Email/phone visibility toggles
- Student contact permissions
- Notification preferences

## 🔧 API Endpoints Available

- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile information
- `POST /api/profile/photo` - Upload profile photo
- `DELETE /api/profile/photo` - Remove profile photo

## 🛡️ Security Features

- **JWT Authentication**: All API endpoints are protected
- **Row Level Security**: Users can only access their own data
- **File Validation**: Type and size restrictions on uploads
- **URL Validation**: Social media URLs are validated
- **Storage Policies**: User-specific file access controls

## 🐛 Troubleshooting

### If profile photo upload fails:
1. Check file size (max 5MB)
2. Verify file type (JPEG, PNG, WebP, GIF only)
3. Ensure you're logged in
4. Check browser console for errors

### If social media links don't save:
1. Verify URL format (must include https://)
2. Check network connectivity
3. Review browser console for errors

### If profile data doesn't load:
1. Verify database migration ran successfully
2. Check that you're logged in with valid JWT token
3. Review API responses in browser Network tab

## 📞 Support

If you encounter any issues:

1. **Check the browser console** for JavaScript errors
2. **Review the Network tab** in browser dev tools for failed API calls
3. **Check Supabase logs** in the dashboard for database errors
4. **Run the test script** to verify setup: `node scripts/test-profile-functionality.js`

## 🎉 You're All Set!

The profile management system is now fully functional. Users can:
- Upload and manage profile photos
- Add social media links
- Update comprehensive profile information
- Control privacy settings
- Manage notification preferences

Enjoy the enhanced profile functionality! 🚀

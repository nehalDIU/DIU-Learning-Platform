# Course Enrollments Table Setup

## 🎯 **Issue**
The application is showing an error: `useCourseEnrollment: Failed to fetch enrolled courses` because the `user_course_enrollments` table doesn't exist in your Supabase database.

## ⚡ **Quick Fix (2 minutes)**

### **Step 1: Open Supabase SQL Editor**
Click here: https://supabase.com/dashboard/project/bpfsnwfaxmhtsdjcjeju/sql

### **Step 2: Run the SQL Script**
1. Copy the entire contents of `create-user-course-enrollments.sql`
2. Paste it into the SQL editor
3. Click **"Run"**

### **Step 3: Verify Success**
You should see a success message like:
```
user_course_enrollments table created successfully | demo_enrollments_created: 3
```

## 🎯 **What This Table Does**

The `user_course_enrollments` table tracks:
- ✅ **Which users are enrolled in which courses**
- ✅ **Enrollment status** (active, completed, dropped, paused)
- ✅ **Progress tracking** (0-100% completion)
- ✅ **Enrollment dates** and last accessed times
- ✅ **Completion dates** when courses are finished

## 🚀 **After Setup**

Once the table is created, the application will:
- ✅ **Stop showing enrollment errors**
- ✅ **Display enrolled courses** for users
- ✅ **Allow course enrollment/unenrollment**
- ✅ **Track course progress**
- ✅ **Show enrollment statistics**

## 🔧 **Features Enabled**

1. **Course Enrollment System**
   - Users can enroll in courses
   - Track enrollment status and progress
   - View enrolled courses list

2. **Progress Tracking**
   - Track completion percentage
   - Record last accessed dates
   - Mark completion dates

3. **Demo Data**
   - Creates sample enrollments for testing
   - Uses demo user with highlighted courses
   - Random progress percentages for realistic testing

## 🛡️ **Security**

The table includes:
- ✅ **Row Level Security (RLS)** enabled
- ✅ **Foreign key constraints** to courses table
- ✅ **Check constraints** for valid progress percentages
- ✅ **Unique constraints** to prevent duplicate enrollments
- ✅ **Indexes** for optimal performance

## 📝 **Note**

This is a **one-time setup**. Once the table is created, all course enrollment features will work seamlessly across the application.

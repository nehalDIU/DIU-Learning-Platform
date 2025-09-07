import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Helper function to verify JWT token and get user ID
async function verifyToken(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value

  if (!token) {
    throw new Error("No token provided")
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.userId
  } catch (error) {
    throw new Error("Invalid token")
  }
}

// GET - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyToken(request)
    const supabase = createClient()

    const { data: profile, error } = await supabase
      .from("admin_users")
      .select(`
        id,
        email,
        full_name,
        role,
        department,
        phone,
        profile_photo_url,
        bio,
        social_media_links,
        address,
        date_of_birth,
        website_url,
        linkedin_url,
        twitter_url,
        facebook_url,
        instagram_url,
        github_url,
        specializations,
        languages_spoken,
        education_background,
        certifications,
        profile_visibility,
        show_email,
        show_phone,
        allow_student_contact,
        notification_preferences,
        created_at,
        updated_at
      `)
      .eq("id", userId)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error: any) {
    console.error("Profile GET error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userId = await verifyToken(request)
    const body = await request.json()
    const supabase = createClient()

    // Extract and validate the fields that can be updated
    const {
      full_name,
      phone,
      bio,
      address,
      date_of_birth,
      website_url,
      linkedin_url,
      twitter_url,
      facebook_url,
      instagram_url,
      github_url,
      specializations,
      languages_spoken,
      education_background,
      certifications,
      profile_visibility,
      show_email,
      show_phone,
      allow_student_contact,
      notification_preferences
    } = body

    // Build update object with only provided fields
    const updateData: any = {}
    
    if (full_name !== undefined) updateData.full_name = full_name
    if (phone !== undefined) updateData.phone = phone
    if (bio !== undefined) updateData.bio = bio
    if (address !== undefined) updateData.address = address
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth
    if (website_url !== undefined) updateData.website_url = website_url
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url
    if (twitter_url !== undefined) updateData.twitter_url = twitter_url
    if (facebook_url !== undefined) updateData.facebook_url = facebook_url
    if (instagram_url !== undefined) updateData.instagram_url = instagram_url
    if (github_url !== undefined) updateData.github_url = github_url
    if (specializations !== undefined) updateData.specializations = specializations
    if (languages_spoken !== undefined) updateData.languages_spoken = languages_spoken
    if (education_background !== undefined) updateData.education_background = education_background
    if (certifications !== undefined) updateData.certifications = certifications
    if (profile_visibility !== undefined) updateData.profile_visibility = profile_visibility
    if (show_email !== undefined) updateData.show_email = show_email
    if (show_phone !== undefined) updateData.show_phone = show_phone
    if (allow_student_contact !== undefined) updateData.allow_student_contact = allow_student_contact
    if (notification_preferences !== undefined) updateData.notification_preferences = notification_preferences

    // Update the profile
    const { data: updatedProfile, error } = await supabase
      .from("admin_users")
      .update(updateData)
      .eq("id", userId)
      .select(`
        id,
        email,
        full_name,
        role,
        department,
        phone,
        profile_photo_url,
        bio,
        social_media_links,
        address,
        date_of_birth,
        website_url,
        linkedin_url,
        twitter_url,
        facebook_url,
        instagram_url,
        github_url,
        specializations,
        languages_spoken,
        education_background,
        certifications,
        profile_visibility,
        show_email,
        show_phone,
        allow_student_contact,
        notification_preferences,
        updated_at
      `)
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: "Profile updated successfully"
    })

  } catch (error: any) {
    console.error("Profile PUT error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === "Invalid token" ? 401 : 500 }
    )
  }
}

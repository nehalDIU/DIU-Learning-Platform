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

// POST - Upload profile photo
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyToken(request)
    const supabase = createClient()

    // Get the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `profile-${Date.now()}.${fileExtension}`
    const filePath = `${userId}/${fileName}`

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json(
        { success: false, error: "Failed to upload file" },
        { status: 500 }
      )
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath)

    const photoUrl = urlData.publicUrl

    // Update user profile with new photo URL
    const { data: updatedUser, error: updateError } = await supabase
      .from("admin_users")
      .update({ profile_photo_url: photoUrl })
      .eq("id", userId)
      .select("id, profile_photo_url")
      .single()

    if (updateError) {
      console.error("Profile update error:", updateError)
      // Try to clean up uploaded file
      await supabase.storage.from("profile-photos").remove([filePath])
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile_photo_url: photoUrl,
      message: "Profile photo uploaded successfully"
    })

  } catch (error: any) {
    console.error("Profile photo upload error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === "Invalid token" ? 401 : 500 }
    )
  }
}

// DELETE - Remove profile photo
export async function DELETE(request: NextRequest) {
  try {
    const userId = await verifyToken(request)
    const supabase = createClient()

    // Get current profile photo URL
    const { data: currentUser, error: fetchError } = await supabase
      .from("admin_users")
      .select("profile_photo_url")
      .eq("id", userId)
      .single()

    if (fetchError || !currentUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    if (!currentUser.profile_photo_url) {
      return NextResponse.json(
        { success: false, error: "No profile photo to delete" },
        { status: 400 }
      )
    }

    // Extract file path from URL
    const url = new URL(currentUser.profile_photo_url)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(-2).join('/') // Get userId/filename

    // Remove from storage
    const { error: deleteError } = await supabase.storage
      .from("profile-photos")
      .remove([filePath])

    if (deleteError) {
      console.error("Storage delete error:", deleteError)
    }

    // Update user profile to remove photo URL
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ profile_photo_url: null })
      .eq("id", userId)

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Profile photo removed successfully"
    })

  } catch (error: any) {
    console.error("Profile photo delete error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === "Invalid token" ? 401 : 500 }
    )
  }
}

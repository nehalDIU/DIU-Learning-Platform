import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

interface UpdateUserRequest {
  userId: string
  email?: string
  fullName?: string
  batch?: string
  section?: string
  profilePhotoUrl?: string
  phone?: string
  studentId?: string
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, ...updates } = await request.json() as UpdateUserRequest

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
      last_accessed: new Date().toISOString()
    }

    if (updates.email) updateData.email = updates.email.toLowerCase()
    if (updates.fullName) updateData.full_name = updates.fullName
    if (updates.batch) updateData.batch = updates.batch
    if (updates.section) updateData.section = updates.section
    if (updates.profilePhotoUrl) updateData.profile_photo_url = updates.profilePhotoUrl
    if (updates.phone) updateData.phone = updates.phone
    if (updates.studentId) updateData.student_id = updates.studentId

    // If batch and section are provided, try to find the corresponding semester
    if (updates.batch && updates.section) {
      const sectionString = `${updates.batch}_${updates.section}`
      const { data: semester } = await supabase
        .from("semesters")
        .select("id")
        .eq("section", sectionString)
        .eq("is_active", true)
        .single()
      
      if (semester) {
        updateData.section_id = semester.id
      }
    }

    // Update the user record
    const { data: updatedUser, error: updateError } = await supabase
      .from("student_users")
      .update(updateData)
      .eq("user_id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating user:", updateError)
      
      if (updateError.code === 'PGRST205') {
        return NextResponse.json({
          error: "Student users table not found",
          needsSetup: true
        }, { status: 500 })
      }
      
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      )
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      studentUser: {
        id: updatedUser.id,
        userId: updatedUser.user_id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        batch: updatedUser.batch,
        section: updatedUser.section,
        sectionId: updatedUser.section_id,
        hasSkippedSelection: updatedUser.has_skipped_selection,
        profilePhotoUrl: updatedUser.profile_photo_url,
        phone: updatedUser.phone,
        studentId: updatedUser.student_id,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      }
    })

  } catch (error) {
    console.error("Error in update user API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

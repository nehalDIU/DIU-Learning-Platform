import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createClient } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Section format validation: {batch}_{section_letter}
function validateSectionFormat(section: string): boolean {
  const sectionPattern = /^\d{2,3}_[A-Z]$/
  return sectionPattern.test(section)
}

// Email validation
function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, section, password } = await request.json()

    // Validate required fields
    if (!name || !email || !section || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required: name, email, section, and password" },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    // Validate section format
    if (!validateSectionFormat(section)) {
      return NextResponse.json(
        { success: false, error: "Section must be in format '{batch}_{section_letter}' (e.g., '63_G')" },
        { status: 400 }
      )
    }

    // Validate password length (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters long" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("admin_users")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create section admin user
    const { data: newUser, error: createError } = await supabase
      .from("admin_users")
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name: name.trim(),
        role: "section_admin",
        department: section, // Store section in department field
        is_active: true,
        login_count: 0
      })
      .select("id, email, full_name, role, department, is_active, created_at")
      .single()

    if (createError) {
      console.error("Error creating section admin user:", createError)
      
      // Handle specific database errors
      if (createError.code === '23505') {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists" },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: "Failed to create account. Please try again." },
        { status: 500 }
      )
    }

    // Create JWT token for immediate login
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    // Update login count and last login
    await supabase
      .from("admin_users")
      .update({
        last_login: new Date().toISOString(),
        login_count: 1
      })
      .eq("id", newUser.id)

    // Create session record
    const sessionToken = jwt.sign(
      { userId: newUser.id, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await supabase
      .from("admin_sessions")
      .insert({
        user_id: newUser.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown"
      })

    // Create response with success data
    const response = NextResponse.json({
      success: true,
      message: "Account created successfully! Redirecting to dashboard...",
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        section: newUser.department
      }
    })

    // Set HTTP-only cookie for authentication
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response

  } catch (error) {
    console.error("Section admin signup error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    )
  }
}

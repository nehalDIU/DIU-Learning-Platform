import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get("admin_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Test database connection by checking tables
    const tests = []

    // Test 1: Check admin_users table
    try {
      const { data: adminUser, error: userError } = await supabase
        .from("admin_users")
        .select("id, email, role, department")
        .eq("id", decoded.userId)
        .single()

      tests.push({
        test: "admin_users table access",
        success: !userError,
        data: adminUser,
        error: userError?.message
      })
    } catch (error) {
      tests.push({
        test: "admin_users table access",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 2: Check semesters table
    try {
      const { data: semesters, error: semesterError } = await supabase
        .from("semesters")
        .select("id, title, section")
        .limit(5)

      tests.push({
        test: "semesters table access",
        success: !semesterError,
        count: semesters?.length || 0,
        data: semesters,
        error: semesterError?.message
      })
    } catch (error) {
      tests.push({
        test: "semesters table access",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 3: Check courses table
    try {
      const { data: courses, error: courseError } = await supabase
        .from("courses")
        .select("id, title, course_code")
        .limit(5)

      tests.push({
        test: "courses table access",
        success: !courseError,
        count: courses?.length || 0,
        data: courses,
        error: courseError?.message
      })
    } catch (error) {
      tests.push({
        test: "courses table access",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 4: Check topics table
    try {
      const { data: topics, error: topicError } = await supabase
        .from("topics")
        .select("id, title")
        .limit(5)

      tests.push({
        test: "topics table access",
        success: !topicError,
        count: topics?.length || 0,
        data: topics,
        error: topicError?.message
      })
    } catch (error) {
      tests.push({
        test: "topics table access",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 5: Check study_tools table
    try {
      const { data: studyTools, error: studyToolError } = await supabase
        .from("study_tools")
        .select("id, title, type")
        .limit(5)

      tests.push({
        test: "study_tools table access",
        success: !studyToolError,
        count: studyTools?.length || 0,
        data: studyTools,
        error: studyToolError?.message
      })
    } catch (error) {
      tests.push({
        test: "study_tools table access",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 6: Check videos table
    try {
      const { data: videos, error: videoError } = await supabase
        .from("videos")
        .select("id, title, youtube_url")
        .limit(5)

      tests.push({
        test: "videos table access",
        success: !videoError,
        count: videos?.length || 0,
        data: videos,
        error: videoError?.message
      })
    } catch (error) {
      tests.push({
        test: "videos table access",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 7: Check slides table
    try {
      const { data: slides, error: slideError } = await supabase
        .from("slides")
        .select("id, title, google_drive_url")
        .limit(5)

      tests.push({
        test: "slides table access",
        success: !slideError,
        count: slides?.length || 0,
        data: slides,
        error: slideError?.message
      })
    } catch (error) {
      tests.push({
        test: "slides table access",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    const allTestsPassed = tests.every(test => test.success)

    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed ? "All database tests passed!" : "Some database tests failed",
      tests,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

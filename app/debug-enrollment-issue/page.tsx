"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useCourseEnrollment } from "@/hooks/useCourseEnrollment"
import { useSectionContext, useStudentUserId } from "@/contexts/SectionContext"

interface Course {
  id: string
  title: string
  course_code: string
  teacher_name: string
}

export default function DebugEnrollmentIssuePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Get user context
  const sectionContext = useSectionContext()
  const studentUserId = useStudentUserId()
  
  // Get enrollment hook with different user IDs
  const enrollmentWithStudentId = useCourseEnrollment(studentUserId)
  const enrollmentWithDemo = useCourseEnrollment('demo_user_debug')
  const enrollmentWithUndefined = useCourseEnrollment(undefined)

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/all')
      const data = await response.json()
      setCourses(data.slice(0, 2)) // Only get first 2 courses for testing
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const runDiagnostics = async () => {
    setLoading(true)
    setTestResults([])
    
    const results = []
    
    // Test 1: Check user context
    results.push({
      test: "User Context Check",
      status: sectionContext.isAuthenticated ? "success" : "warning",
      details: {
        isAuthenticated: sectionContext.isAuthenticated,
        userId: sectionContext.userId,
        studentUser: sectionContext.studentUser ? "Present" : "Missing",
        studentUserId: studentUserId
      }
    })
    
    // Test 2: Check enrollment hook states
    results.push({
      test: "Enrollment Hook States",
      status: "info",
      details: {
        withStudentId: {
          loading: enrollmentWithStudentId.loading,
          error: enrollmentWithStudentId.error,
          enrollmentCount: enrollmentWithStudentId.enrollmentCount
        },
        withDemo: {
          loading: enrollmentWithDemo.loading,
          error: enrollmentWithDemo.error,
          enrollmentCount: enrollmentWithDemo.enrollmentCount
        },
        withUndefined: {
          loading: enrollmentWithUndefined.loading,
          error: enrollmentWithUndefined.error,
          enrollmentCount: enrollmentWithUndefined.enrollmentCount
        }
      }
    })
    
    // Test 3: Direct API test
    if (courses.length > 0) {
      try {
        const testCourse = courses[0]
        const response = await fetch('/api/courses/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            courseId: testCourse.id, 
            userId: `debug_test_${Date.now()}` 
          })
        })
        
        const data = await response.json()
        
        results.push({
          test: "Direct API Enrollment Test",
          status: response.ok ? "success" : "error",
          details: {
            status: response.status,
            response: data,
            courseId: testCourse.id
          }
        })
      } catch (error) {
        results.push({
          test: "Direct API Enrollment Test",
          status: "error",
          details: { error: error.message }
        })
      }
    }
    
    // Test 4: Hook enrollment test
    if (courses.length > 0) {
      try {
        const testCourse = courses[0]
        const result = await enrollmentWithDemo.enrollInCourse(testCourse.id)
        
        results.push({
          test: "Hook Enrollment Test (Demo User)",
          status: "success",
          details: {
            result,
            courseId: testCourse.id,
            isNowEnrolled: enrollmentWithDemo.isEnrolledInCourse(testCourse.id)
          }
        })
      } catch (error) {
        results.push({
          test: "Hook Enrollment Test (Demo User)",
          status: "error",
          details: { error: error.message }
        })
      }
    }
    
    setTestResults(results)
    setLoading(false)
  }

  const createTestUser = async () => {
    try {
      setLoading(true)
      await sectionContext.createUserWithEmail({
        email: `test_${Date.now()}@diu.edu.bd`,
        fullName: "Test User",
        batch: "63",
        section: "G"
      })

      // Refresh the page state after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Failed to create test user:', error)
      setTestResults(prev => [...prev, {
        test: "Create Test User",
        status: "error",
        details: { error: error.message }
      }])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error": return <XCircle className="h-4 w-4 text-red-600" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default: return <div className="h-4 w-4 bg-blue-500 rounded-full" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Enrollment Issue Debug
        </h1>
        <p className="text-muted-foreground mb-8">
          Comprehensive debugging of the course enrollment system
        </p>

        <div className="space-y-6">
          {/* Quick Status */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">User Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={sectionContext.isAuthenticated ? "default" : "secondary"}>
                  {sectionContext.isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Courses Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Enrollments (Demo)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrollmentWithDemo.enrollmentCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Hook Loading</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={enrollmentWithDemo.loading ? "destructive" : "default"}>
                  {enrollmentWithDemo.loading ? "Loading" : "Ready"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={runDiagnostics} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Run Full Diagnostics
                </Button>
                
                {!sectionContext.isAuthenticated && (
                  <Button variant="outline" onClick={createTestUser} disabled={loading}>
                    Create Test User
                  </Button>
                )}
                
                <Button variant="outline" onClick={fetchCourses}>
                  Refresh Courses
                </Button>
                
                <Button variant="outline" onClick={() => enrollmentWithDemo.refreshEnrolledCourses()}>
                  Refresh Enrollments
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(result.status)}
                        <h3 className="font-medium">{result.test}</h3>
                        <Badge variant="outline">{result.status}</Badge>
                      </div>
                      <div className="bg-muted p-3 rounded text-sm">
                        <pre className="whitespace-pre-wrap overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current State */}
          <Card>
            <CardHeader>
              <CardTitle>Current State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Section Context</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify({
                        isAuthenticated: sectionContext.isAuthenticated,
                        userId: sectionContext.userId,
                        hasStudentUser: !!sectionContext.studentUser,
                        isLoading: sectionContext.isLoading,
                        error: sectionContext.error
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Enrollment Hook (Demo)</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify({
                        loading: enrollmentWithDemo.loading,
                        error: enrollmentWithDemo.error,
                        enrollmentCount: enrollmentWithDemo.enrollmentCount,
                        hasEnrollments: enrollmentWithDemo.hasEnrollments
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

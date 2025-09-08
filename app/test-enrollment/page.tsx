"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function TestEnrollmentPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/all')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/courses/enrolled')
      const data = await response.json()
      setEnrollments(data)
    } catch (error) {
      console.error('Failed to fetch enrollments:', error)
    }
  }

  const testEnrollment = async (courseId: string) => {
    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          courseId, 
          userId: `test_user_${Date.now()}` 
        })
      })

      const data = await response.json()
      
      setResult({ 
        success: response.ok,
        status: response.status,
        data,
        courseId
      })

      if (response.ok) {
        await fetchEnrollments()
      }
    } catch (error) {
      setResult({ 
        success: false,
        error: error.message,
        courseId
      })
    } finally {
      setLoading(false)
    }
  }

  const setupDatabase = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/setup-database', { method: 'POST' })
      const data = await response.json()
      setResult({ type: 'setup', success: response.ok, data })
    } catch (error) {
      setResult({ type: 'setup', success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchEnrollments()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Enrollment System Test
        </h1>
        <p className="text-muted-foreground mb-8">
          Test and debug the course enrollment functionality
        </p>

        <div className="space-y-6">
          {/* Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Database Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={setupDatabase} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Setup Database
                </Button>
                <Button variant="outline" onClick={fetchCourses}>
                  Refresh Courses
                </Button>
                <Button variant="outline" onClick={fetchEnrollments}>
                  Refresh Enrollments
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Courses Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {courses.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-2xl font-bold">{courses.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {enrollments.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-2xl font-bold">{enrollments.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Last Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {result?.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : result?.success === false ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <div className="h-4 w-4 bg-gray-300 rounded-full" />
                  )}
                  <span className="text-sm">
                    {result?.success ? 'Success' : result?.success === false ? 'Failed' : 'Not tested'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Courses */}
          {courses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Enrollment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {course.course_code} - {course.teacher_name}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => testEnrollment(course.id)}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Enroll'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Enrollments */}
          {enrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Current Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="p-3 border rounded">
                      <h3 className="font-medium">{enrollment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Enrolled: {new Date(enrollment.enrollment?.enrollment_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Test Result
                  {result.success !== undefined && (
                    <span className={`ml-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      ({result.success ? 'Success' : 'Failed'})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!result.success && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      {result.error || result.data?.error || 'Unknown error occurred'}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="p-4 border rounded bg-muted">
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

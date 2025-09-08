"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function DebugEnrollmentSimplePage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses/all')
      const data = await response.json()
      setCourses(data)
      setResult({ type: 'courses', data })
    } catch (error) {
      setResult({ type: 'error', error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testEnrollment = async (courseId: string) => {
    try {
      setLoading(true)
      setResult({ type: 'enrolling', courseId })

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
        type: 'enrollment_result', 
        success: response.ok,
        status: response.status,
        data 
      })
    } catch (error) {
      setResult({ 
        type: 'enrollment_error', 
        error: error.message 
      })
    } finally {
      setLoading(false)
    }
  }

  const checkEnrolledCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses/enrolled')
      const data = await response.json()
      setResult({ type: 'enrolled', data, status: response.status })
    } catch (error) {
      setResult({ type: 'error', error: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Simple Enrollment Debug
        </h1>
        <p className="text-muted-foreground mb-8">
          Step-by-step enrollment testing
        </p>

        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={fetchCourses} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Fetch Courses
                </Button>
                <Button onClick={checkEnrolledCourses} disabled={loading}>
                  Check Enrolled Courses
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Courses */}
          {courses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Courses ({courses.length})</CardTitle>
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
                        Test Enroll
                      </Button>
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
                  Result: {result.type}
                  {result.success !== undefined && (
                    <span className={`ml-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      ({result.success ? 'Success' : 'Failed'})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.type === 'enrollment_result' && !result.success && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      Enrollment failed with status {result.status}
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

          {/* Quick SQL Check */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Database Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/api/courses/test-enrollment', '_blank')}
                >
                  Open Test API
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/debug-enrollment', '_blank')}
                >
                  Open Full Debug Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CourseEnrollmentProvider, useCourseEnrollmentContext } from "@/contexts/CourseEnrollmentContext"
import { Loader2, RefreshCw } from "lucide-react"

function TestEnrollmentUIContent() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)

  const {
    enrollInCourse,
    unenrollFromCourse,
    isEnrolledInCourse,
    enrollmentCount,
    loading: enrollmentLoading,
    error: enrollmentError,
    enrolledCourses
  } = useCourseEnrollmentContext()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses/all')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    try {
      setResult({ type: 'enrolling', courseId })
      console.log('UI Test: Starting enrollment for course:', courseId)
      
      const result = await enrollInCourse(courseId)
      console.log('UI Test: Enrollment completed:', result)
      
      setResult({ 
        type: 'enrolled', 
        courseId, 
        success: true,
        enrollmentCount: enrollmentCount,
        isNowEnrolled: isEnrolledInCourse(courseId)
      })
    } catch (error) {
      console.error('UI Test: Enrollment failed:', error)
      setResult({ 
        type: 'error', 
        courseId, 
        error: error.message 
      })
    }
  }

  const handleUnenroll = async (courseId: string) => {
    try {
      setResult({ type: 'unenrolling', courseId })
      const result = await unenrollFromCourse(courseId)
      setResult({ 
        type: 'unenrolled', 
        courseId, 
        success: true,
        enrollmentCount: enrollmentCount,
        isNowEnrolled: isEnrolledInCourse(courseId)
      })
    } catch (error) {
      setResult({ 
        type: 'unenroll_error', 
        courseId, 
        error: error.message 
      })
    }
  }

  const refreshEnrollments = async () => {
    // Force refresh by calling the fetch function directly
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Enrollment UI Test
        </h1>
        <p className="text-muted-foreground mb-8">
          Test the enrollment UI state management
        </p>

        <div className="space-y-6">
          {/* Context Status */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Context Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Enrollment Count</p>
                  <p className="text-2xl font-bold">{enrollmentCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Loading</p>
                  <Badge variant={enrollmentLoading ? "destructive" : "default"}>
                    {enrollmentLoading ? 'Loading...' : 'Ready'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Error</p>
                  <p className="text-sm text-muted-foreground">
                    {enrollmentError || 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Enrolled Courses</p>
                  <p className="text-sm">{enrolledCourses?.length || 0} courses</p>
                </div>
              </div>
              <div className="mt-4">
                <Button size="sm" onClick={refreshEnrollments}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Result */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Last Action Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded bg-muted">
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Actions */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading courses...</span>
            </div>
          ) : courses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Test Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.slice(0, 3).map((course) => {
                    const isEnrolled = isEnrolledInCourse(course.id)
                    return (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <h3 className="font-medium">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.course_code} - {course.teacher_name}
                          </p>
                          <Badge variant={isEnrolled ? "default" : "outline"} className="mt-1">
                            {isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                          </Badge>
                        </div>
                        <div className="space-x-2">
                          {isEnrolled ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleUnenroll(course.id)}
                            >
                              Unenroll
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => handleEnroll(course.id)}
                            >
                              Enroll
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => console.log('Enrollment status:', isEnrolledInCourse(course.id))}
                          >
                            Check Status
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertDescription>
                No courses available. Please add some courses first.
              </AlertDescription>
            </Alert>
          )}

          {/* Enrolled Courses List */}
          {enrolledCourses && enrolledCourses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Currently Enrolled Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enrolledCourses.map((course: any) => (
                    <div key={course.id} className="p-3 border rounded">
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Enrolled: {course.enrollment?.enrollment_date ? 
                          new Date(course.enrollment.enrollment_date).toLocaleDateString() : 
                          'Unknown'
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function TestEnrollmentUIPage() {
  return (
    <CourseEnrollmentProvider>
      <TestEnrollmentUIContent />
    </CourseEnrollmentProvider>
  )
}

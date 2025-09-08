"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProfessionalCourseCard } from "@/components/ui/professional-course-card"
import { CourseEnrollmentProvider, useCourseEnrollmentContext } from "@/contexts/CourseEnrollmentContext"
import { Loader2 } from "lucide-react"

function TestCourseCardContent() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)

  const {
    enrollInCourse,
    unenrollFromCourse,
    isEnrolledInCourse,
    enrollmentCount,
    loading: enrollmentLoading,
    error: enrollmentError
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
    console.log('Test page: handleEnroll called', courseId)
    try {
      setResult({ type: 'enrolling', courseId })
      const result = await enrollInCourse(courseId)
      setResult({ type: 'success', courseId, result })
    } catch (error) {
      console.error('Test page: Enrollment failed', error)
      setResult({ type: 'error', courseId, error: error.message })
    }
  }

  const handleUnenroll = async (courseId: string) => {
    console.log('Test page: handleUnenroll called', courseId)
    try {
      setResult({ type: 'unenrolling', courseId })
      const result = await unenrollFromCourse(courseId)
      setResult({ type: 'unenroll_success', courseId, result })
    } catch (error) {
      console.error('Test page: Unenrollment failed', error)
      setResult({ type: 'unenroll_error', courseId, error: error.message })
    }
  }

  const handleViewDetails = (courseId: string) => {
    console.log('View details:', courseId)
  }

  const testDirectEnrollment = async () => {
    if (courses.length === 0) return
    
    const courseId = courses[0].id
    const userId = `test_direct_${Date.now()}`
    
    try {
      setResult({ type: 'direct_test', courseId })
      
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, userId })
      })
      
      const data = await response.json()
      setResult({ 
        type: 'direct_result', 
        courseId, 
        success: response.ok, 
        status: response.status, 
        data 
      })
    } catch (error) {
      setResult({ type: 'direct_error', courseId, error: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Course Card Test
        </h1>
        <p className="text-muted-foreground mb-8">
          Test the ProfessionalCourseCard component with enrollment
        </p>

        <div className="space-y-6">
          {/* Context Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Context Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p><strong>Enrollment Count:</strong> {enrollmentCount}</p>
                <p><strong>Enrollment Loading:</strong> {enrollmentLoading ? 'Yes' : 'No'}</p>
                <p><strong>Enrollment Error:</strong> {enrollmentError || 'None'}</p>
                <p><strong>enrollInCourse function:</strong> {typeof enrollInCourse}</p>
                <p><strong>isEnrolledInCourse function:</strong> {typeof isEnrolledInCourse}</p>
                <div className="mt-2">
                  <Button size="sm" onClick={testDirectEnrollment}>
                    Test Direct API Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Result */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Test Result</CardTitle>
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

          {/* Course Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading courses...</span>
            </div>
          ) : courses.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Test Course Cards</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.slice(0, 3).map((course) => (
                  <ProfessionalCourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={isEnrolledInCourse(course.id)}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                    onViewDetails={handleViewDetails}
                    variant="default"
                  />
                ))}
              </div>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No courses available. Please add some courses first.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}

export default function TestCourseCardPage() {
  return (
    <CourseEnrollmentProvider>
      <TestCourseCardContent />
    </CourseEnrollmentProvider>
  )
}

"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw } from "lucide-react"

export default function DebugFullEnrollmentPage() {
  const [enrollmentData, setEnrollmentData] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug-enrollments')
      const data = await response.json()
      setEnrollmentData(data)
    } catch (error) {
      console.error('Failed to fetch enrollment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/all')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const testEnrollment = async () => {
    if (courses.length === 0) return

    try {
      setLoading(true)
      setTestResult(null)

      const courseId = courses[0].id
      const userId = `debug_test_${Date.now()}`

      // Test enrollment
      const enrollResponse = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, userId })
      })

      const enrollResult = await enrollResponse.json()

      // Check if it was saved
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait a bit
      await fetchEnrollmentData()

      setTestResult({
        success: enrollResponse.ok,
        status: enrollResponse.status,
        courseId,
        userId,
        result: enrollResult
      })

    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const cleanupTestData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug-enrollments', { method: 'DELETE' })
      const data = await response.json()
      
      // Refresh data
      await fetchEnrollmentData()
      
      setTestResult({
        type: 'cleanup',
        success: response.ok,
        data
      })
    } catch (error) {
      setTestResult({
        type: 'cleanup',
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrollmentData()
    fetchCourses()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Full Enrollment Debug
        </h1>
        <p className="text-muted-foreground mb-8">
          Complete debugging of the enrollment system
        </p>

        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={fetchEnrollmentData} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Refresh Data
                </Button>
                <Button onClick={testEnrollment} disabled={loading || courses.length === 0}>
                  Test Enrollment
                </Button>
                <Button variant="destructive" onClick={cleanupTestData} disabled={loading}>
                  Cleanup Test Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enrollmentData?.totalEnrollments || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Unique Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enrollmentData?.uniqueUsers || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Unique Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enrollmentData?.uniqueCourses || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Available Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courses.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Result */}
          {testResult && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Test Result
                  <Badge className="ml-2" variant={testResult.success ? "default" : "destructive"}>
                    {testResult.success ? 'Success' : 'Failed'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded bg-muted">
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Enrollments */}
          {enrollmentData?.enrollments && enrollmentData.enrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enrollmentData.enrollments.slice(0, 10).map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">
                          {enrollment.course?.title || 'Unknown Course'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          User: {enrollment.user_id} | Status: {enrollment.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </p>
                        <Badge variant="outline">
                          {enrollment.progress_percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Data */}
          {enrollmentData && (
            <Card>
              <CardHeader>
                <CardTitle>Raw Enrollment Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded bg-muted">
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(enrollmentData, null, 2)}
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

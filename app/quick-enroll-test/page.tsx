"use client"

import React, { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function QuickEnrollTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectEnrollment = async () => {
    try {
      setLoading(true)
      setResult(null)

      // First get a course
      const coursesResponse = await fetch('/api/courses/all')
      const courses = await coursesResponse.json()
      
      if (!courses || courses.length === 0) {
        setResult({ error: 'No courses available' })
        return
      }

      const testCourse = courses[0]
      const testUserId = `quick_test_${Date.now()}`

      // Try direct enrollment
      const enrollResponse = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: testCourse.id,
          userId: testUserId
        })
      })

      const enrollResult = await enrollResponse.json()

      setResult({
        step: 'enrollment',
        success: enrollResponse.ok,
        status: enrollResponse.status,
        course: testCourse,
        userId: testUserId,
        result: enrollResult
      })

    } catch (error) {
      setResult({
        error: error.message,
        step: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testEnrollmentAPI = async () => {
    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/init-enrollment', { method: 'POST' })
      const data = await response.json()

      setResult({
        step: 'api_test',
        success: response.ok,
        status: response.status,
        data
      })

    } catch (error) {
      setResult({
        error: error.message,
        step: 'api_error'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async () => {
    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/init-enrollment')
      const data = await response.json()

      setResult({
        step: 'status_check',
        success: response.ok,
        status: response.status,
        data
      })

    } catch (error) {
      setResult({
        error: error.message,
        step: 'status_error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Quick Enrollment Test
        </h1>
        <p className="text-muted-foreground mb-8">
          Direct API testing for enrollment functionality
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={checkStatus} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Check Status
                </Button>
                <Button onClick={testEnrollmentAPI} disabled={loading}>
                  Test API
                </Button>
                <Button onClick={testDirectEnrollment} disabled={loading}>
                  Test Direct Enrollment
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Test Result: {result.step}
                  {result.success !== undefined && (
                    <span className={`ml-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      ({result.success ? 'Success' : 'Failed'} - {result.status})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.error && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      Error: {result.error}
                    </AlertDescription>
                  </Alert>
                )}

                {result.data?.needsManualSetup && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      <strong>Manual Setup Required:</strong> {result.data.instructions}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="p-4 border rounded bg-muted">
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>

                {result.data?.sql && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">SQL to run in Supabase:</h3>
                    <div className="p-3 bg-gray-100 rounded text-sm font-mono overflow-auto">
                      {result.data.sql}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>1. Check Status:</strong> Verify if tables exist and are accessible</p>
                <p><strong>2. Test API:</strong> Test the enrollment system initialization</p>
                <p><strong>3. Test Direct Enrollment:</strong> Try to enroll in a course directly</p>
                <p className="text-muted-foreground mt-4">
                  If you see "needsManualSetup: true", copy the SQL and run it in your Supabase dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

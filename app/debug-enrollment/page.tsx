"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface SystemStatus {
  coursesTable?: { working?: boolean; count?: number; error?: string }
  enrollmentsTable?: { working?: boolean; error?: string; needsSetup?: boolean }
}

export default function DebugEnrollmentPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const checkStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses/test-enrollment')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to check status:', error)
    } finally {
      setLoading(false)
    }
  }

  const runTest = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses/test-enrollment', { method: 'POST' })
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      console.error('Failed to run test:', error)
      setTestResult({ error: 'Failed to run test' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Course Enrollment Debug
        </h1>
        <p className="text-muted-foreground mb-8">
          Debug and test the course enrollment system
        </p>

        <div className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                System Status
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkStatus}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status ? (
                <div className="space-y-4">
                  {/* Courses Table */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Courses Table</span>
                    {status.coursesTable?.working ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <Badge variant="secondary">{status.coursesTable.count} courses</Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <Badge variant="destructive">Error</Badge>
                      </div>
                    )}
                  </div>

                  {/* Enrollments Table */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Enrollments Table</span>
                    {status.enrollmentsTable?.working ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <Badge variant="secondary">Working</Badge>
                      </div>
                    ) : status.enrollmentsTable?.needsSetup ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <Badge variant="outline">Needs Setup</Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <Badge variant="destructive">Error</Badge>
                      </div>
                    )}
                  </div>

                  {status.enrollmentsTable?.error && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {status.enrollmentsTable.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Loading status...</p>
              )}
            </CardContent>
          </Card>

          {/* Test Enrollment */}
          <Card>
            <CardHeader>
              <CardTitle>Test Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runTest} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Run Enrollment Test
                </Button>

                {testResult && (
                  <div className="p-4 border rounded bg-muted">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SQL Migration */}
          {status?.enrollmentsTable?.needsSetup && (
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Database Migration Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    The enrollment table doesn't exist. You need to run the SQL migration in your Supabase dashboard.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Go to your Supabase dashboard → SQL Editor and run:
                  </p>
                  <div className="p-3 bg-muted rounded text-sm font-mono overflow-auto">
                    {`CREATE TABLE "public"."user_course_enrollments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar(255) NOT NULL,
    "course_id" uuid NOT NULL,
    "enrollment_date" timestamp with time zone DEFAULT now(),
    "status" varchar(20) DEFAULT 'active',
    "progress_percentage" integer DEFAULT 0,
    "last_accessed" timestamp with time zone,
    "completion_date" timestamp with time zone,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "user_course_enrollments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_user_course_enrollment" UNIQUE ("user_id", "course_id")
);

ALTER TABLE "public"."user_course_enrollments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON "public"."user_course_enrollments" FOR ALL USING (true);
GRANT ALL ON "public"."user_course_enrollments" TO "postgres", "anon", "authenticated";`}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

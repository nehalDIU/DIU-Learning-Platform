"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSectionContext } from "@/contexts/SectionContext"
import { CheckCircle2, XCircle, AlertTriangle, Shield, User, Key } from "lucide-react"

interface AdminAuthStatus {
  isAuthenticated: boolean
  user?: {
    id: string
    email: string
    role: string
    department?: string
  }
  error?: string
  lastChecked?: string
}

export default function DebugAuthPage() {
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [adminAuthStatus, setAdminAuthStatus] = useState<AdminAuthStatus>({ isAuthenticated: false })
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false)

  const sectionContext = useSectionContext()
  
  const checkAdminAuth = async () => {
    setIsLoadingAdmin(true)
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAdminAuthStatus({
          isAuthenticated: true,
          user: data.user,
          lastChecked: new Date().toLocaleTimeString()
        })
      } else {
        setAdminAuthStatus({
          isAuthenticated: false,
          error: data.error || "Authentication failed",
          lastChecked: new Date().toLocaleTimeString()
        })
      }
    } catch (error) {
      setAdminAuthStatus({
        isAuthenticated: false,
        error: "Network error or server not responding",
        lastChecked: new Date().toLocaleTimeString()
      })
    } finally {
      setIsLoadingAdmin(false)
    }
  }

  const testSemesterAPI = async () => {
    try {
      const response = await fetch("/api/section-admin/semesters", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ API Test Successful! Found ${data.length || 0} semesters.`)
      } else {
        const errorText = await response.text()
        alert(`❌ API Test Failed: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      alert(`❌ API Test Error: ${error.message}`)
    }
  }

  useEffect(() => {
    // Check localStorage data
    const checkLocalStorage = () => {
      try {
        const studentUser = localStorage.getItem('diu_student_user')
        const selectedSection = localStorage.getItem('diu_selected_section')

        setLocalStorageData({
          studentUser: studentUser ? JSON.parse(studentUser) : null,
          selectedSection: selectedSection ? JSON.parse(selectedSection) : null,
          raw: {
            studentUser,
            selectedSection
          }
        })
      } catch (error) {
        setLocalStorageData({
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    checkLocalStorage()
    checkAdminAuth()
  }, [refreshKey])
  
  const clearLocalStorage = () => {
    localStorage.removeItem('diu_student_user')
    localStorage.removeItem('diu_selected_section')
    setRefreshKey(prev => prev + 1)
    sectionContext.clearSelection()
  }
  
  const createTestUser = async () => {
    try {
      await sectionContext.createUserWithEmail({
        email: `debug_${Date.now()}@test.com`,
        fullName: 'Debug Test User',
        batch: '63',
        section: 'G'
      })
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error creating test user:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Authentication Debug</h1>
            <p className="text-muted-foreground">Debug authentication and user state</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Admin Authentication Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Admin Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {adminAuthStatus.isAuthenticated ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {adminAuthStatus.isAuthenticated ? "Authenticated" : "Not Authenticated"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkAdminAuth}
                    disabled={isLoadingAdmin}
                  >
                    Refresh
                  </Button>
                </div>

                {adminAuthStatus.user && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">User Info</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Email:</strong> {adminAuthStatus.user.email}</div>
                      <div><strong>Role:</strong> <Badge variant="outline">{adminAuthStatus.user.role}</Badge></div>
                      <div><strong>Department:</strong> {adminAuthStatus.user.department || "N/A"}</div>
                    </div>
                  </div>
                )}

                {adminAuthStatus.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {adminAuthStatus.error}
                    </AlertDescription>
                  </Alert>
                )}

                {adminAuthStatus.lastChecked && (
                  <div className="text-xs text-muted-foreground">
                    Last checked: {adminAuthStatus.lastChecked}
                  </div>
                )}

                <div className="space-y-2">
                  {!adminAuthStatus.isAuthenticated ? (
                    <Button asChild className="w-full" size="sm">
                      <a href="/login">Go to Login</a>
                    </Button>
                  ) : (
                    <Button onClick={testSemesterAPI} variant="outline" className="w-full" size="sm">
                      Test Semester API
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section Context State */}
            <Card>
              <CardHeader>
                <CardTitle>Student Context State</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong>Is Authenticated:</strong>{" "}
                  <Badge variant={sectionContext.isAuthenticated ? "default" : "destructive"}>
                    {sectionContext.isAuthenticated ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <strong>User ID:</strong>{" "}
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {sectionContext.userId || "null"}
                  </code>
                </div>
                <div>
                  <strong>Is Loading:</strong>{" "}
                  <Badge variant={sectionContext.isLoading ? "secondary" : "outline"}>
                    {sectionContext.isLoading ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <strong>Error:</strong>{" "}
                  <span className="text-destructive">
                    {sectionContext.error || "None"}
                  </span>
                </div>
                <div>
                  <strong>Student User:</strong>
                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(sectionContext.studentUser, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* LocalStorage Data */}
            <Card>
              <CardHeader>
                <CardTitle>LocalStorage Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong>Student User Data:</strong>
                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(localStorageData?.studentUser, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>Selected Section:</strong>
                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(localStorageData?.selectedSection, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>Raw Data:</strong>
                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(localStorageData?.raw, null, 2)}
                  </pre>
                </div>
                {localStorageData?.error && (
                  <div className="text-destructive">
                    <strong>Error:</strong> {localStorageData.error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <Button onClick={() => setRefreshKey(prev => prev + 1)}>
                  Refresh Data
                </Button>
                <Button onClick={clearLocalStorage} variant="destructive">
                  Clear LocalStorage
                </Button>
                <Button onClick={createTestUser} variant="secondary">
                  Create Test User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

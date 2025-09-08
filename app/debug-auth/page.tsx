"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSectionContext } from "@/contexts/SectionContext"

export default function DebugAuthPage() {
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  
  const sectionContext = useSectionContext()
  
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Section Context State */}
            <Card>
              <CardHeader>
                <CardTitle>Section Context State</CardTitle>
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

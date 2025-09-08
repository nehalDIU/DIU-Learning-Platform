"use client"

import React, { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FixAuthPage() {
  const [status, setStatus] = useState<string>("")
  const [isFixed, setIsFixed] = useState(false)

  const fixUserIdMismatch = () => {
    try {
      // Get current localStorage data
      const currentData = localStorage.getItem('diu_student_user')
      if (!currentData) {
        setStatus("❌ No user data found in localStorage")
        return
      }

      const userData = JSON.parse(currentData)
      
      // Update the user_id to match the database
      const correctedUserData = {
        ...userData,
        userId: "student_1757323634368_5yqklnwz2" // Correct user_id from database
      }

      // Save corrected data back to localStorage
      localStorage.setItem('diu_student_user', JSON.stringify(correctedUserData))
      
      setStatus("✅ User ID corrected! You can now enroll in courses.")
      setIsFixed(true)
      
      // Reload the page to refresh the context
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      setStatus(`❌ Error fixing user data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const clearAndRecreate = () => {
    localStorage.removeItem('diu_student_user')
    localStorage.removeItem('diu_selected_section')
    setStatus("✅ Data cleared. Please go to the main page to recreate your account.")
    setTimeout(() => {
      window.location.href = "/"
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Fix Authentication Issue</h1>
            <p className="text-muted-foreground">
              Fix the user ID mismatch between localStorage and database
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Issue Detected</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  <strong>Problem:</strong> Your account exists in the database, but there's a user ID mismatch 
                  between your browser storage and the database record. This prevents course enrollment.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p><strong>Your Email:</strong> nehalmahamud99@gmail.com</p>
                <p><strong>LocalStorage User ID:</strong> student_1757323634368_5yqk1mzr2</p>
                <p><strong>Database User ID:</strong> student_1757323634368_5yqklnwz2</p>
              </div>

              {status && (
                <Alert className={`${status.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <AlertDescription className={status.includes('✅') ? 'text-green-800' : 'text-red-800'}>
                    {status}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fix Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Option 1: Quick Fix (Recommended)</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Update your browser storage to use the correct user ID from the database.
                  </p>
                  <Button 
                    onClick={fixUserIdMismatch} 
                    disabled={isFixed}
                    className="w-full"
                  >
                    {isFixed ? "✅ Fixed!" : "Fix User ID Mismatch"}
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Option 2: Clear and Recreate</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Clear all data and recreate your account from scratch.
                  </p>
                  <Button 
                    onClick={clearAndRecreate} 
                    variant="outline"
                    className="w-full"
                  >
                    Clear Data & Recreate Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              After fixing, go to the <a href="/courses" className="underline">courses page</a> to test enrollment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

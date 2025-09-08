"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, TestTube, UserPlus, LogIn, Eye } from "lucide-react"

export default function TestSectionAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  const router = useRouter()

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSignupFlow = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      addResult("Starting SectionAdmin signup test...")
      
      // Test data
      const testData = {
        name: "Test Section Admin",
        email: `test.admin.${Date.now()}@diu.edu.bd`,
        section: "63_G",
        password: "testpass123"
      }
      
      addResult(`Testing with data: ${JSON.stringify(testData, null, 2)}`)
      
      // Test signup API
      const response = await fetch('/api/auth/section-admin-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        addResult("✅ Signup successful!")
        addResult(`User created: ${data.user.full_name} (${data.user.email})`)
        addResult(`Section: ${data.user.section}`)
        addResult(`Role: ${data.user.role}`)
        
        // Test authentication check
        const authResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })
        
        if (authResponse.ok) {
          const authData = await authResponse.json()
          if (authData.success) {
            addResult("✅ Authentication check successful!")
            addResult(`Authenticated user: ${authData.user.full_name}`)
          } else {
            addResult("❌ Authentication check failed")
          }
        } else {
          addResult("❌ Authentication check request failed")
        }
        
        toast.success("Test completed successfully!")
      } else {
        addResult(`❌ Signup failed: ${data.error}`)
        toast.error("Test failed")
      }
    } catch (error) {
      addResult(`❌ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error("Test error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const testValidation = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      addResult("Testing validation...")
      
      // Test invalid section format
      const invalidTests = [
        { name: "", email: "test@diu.edu.bd", section: "63_G", password: "test123" },
        { name: "Test User", email: "invalid-email", section: "63_G", password: "test123" },
        { name: "Test User", email: "test@diu.edu.bd", section: "invalid", password: "test123" },
        { name: "Test User", email: "test@diu.edu.bd", section: "63_G", password: "123" },
      ]
      
      for (const testData of invalidTests) {
        const response = await fetch('/api/auth/section-admin-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        })
        
        const data = await response.json()
        
        if (!response.ok || !data.success) {
          addResult(`✅ Validation working: ${data.error}`)
        } else {
          addResult(`❌ Validation failed for: ${JSON.stringify(testData)}`)
        }
      }
      
      toast.success("Validation tests completed!")
    } catch (error) {
      addResult(`❌ Validation test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error("Validation test error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              SectionAdmin Authentication Test
            </CardTitle>
            <CardDescription>
              Test the SectionAdmin signup and authentication flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={testSignupFlow}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Test Signup Flow
              </Button>
              
              <Button 
                onClick={testValidation}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Test Validation
              </Button>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => router.push('/section-admin-signup')}
                variant="secondary"
                className="flex-1"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Go to Signup Page
              </Button>
              
              <Button 
                onClick={() => router.push('/SectionAdmin')}
                variant="secondary"
                className="flex-1"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

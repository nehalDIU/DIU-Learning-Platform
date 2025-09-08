"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, TestTube, LogIn, Eye, EyeOff } from "lucide-react"

export default function TestLoginRedirectPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  const router = useRouter()

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Helper function to get redirect URL based on user role
  const getRedirectUrl = (user: any) => {
    switch (user.role) {
      case "section_admin":
        return "/SectionAdmin"
      case "super_admin":
        return "/admin" // SuperAdmin uses the same admin dashboard
      case "admin":
      case "moderator":
      case "content_creator":
      default:
        return "/admin"
    }
  }

  const testLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password")
      return
    }

    setIsLoading(true)
    setTestResults([])
    
    try {
      addResult("Starting login test...")
      addResult(`Testing with email: ${email}`)
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      addResult(`Response status: ${response.status}`)
      addResult(`Response data: ${JSON.stringify(data, null, 2)}`)

      if (data.success) {
        const redirectUrl = getRedirectUrl(data.user)
        addResult(`✅ Login successful!`)
        addResult(`User: ${data.user.full_name} (${data.user.email})`)
        addResult(`Role: ${data.user.role}`)
        addResult(`Expected redirect URL: ${redirectUrl}`)
        
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
            addResult(`Authenticated role: ${authData.user.role}`)
          } else {
            addResult("❌ Authentication check failed")
          }
        } else {
          addResult("❌ Authentication check request failed")
        }
        
        toast.success(`Login successful! Should redirect to ${redirectUrl}`)
      } else {
        addResult(`❌ Login failed: ${data.error}`)
        toast.error("Login failed")
      }
    } catch (error) {
      addResult(`❌ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error("Test error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const testRoleRedirects = () => {
    setTestResults([])
    addResult("Testing role-based redirect URLs...")
    
    const testUsers = [
      { role: "section_admin", expected: "/SectionAdmin" },
      { role: "super_admin", expected: "/admin" },
      { role: "admin", expected: "/admin" },
      { role: "moderator", expected: "/admin" },
      { role: "content_creator", expected: "/admin" },
    ]
    
    testUsers.forEach(({ role, expected }) => {
      const redirectUrl = getRedirectUrl({ role })
      const isCorrect = redirectUrl === expected
      addResult(`${isCorrect ? '✅' : '❌'} Role: ${role} → ${redirectUrl} (expected: ${expected})`)
    })
    
    toast.success("Role redirect test completed!")
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Login Redirect Test
            </CardTitle>
            <CardDescription>
              Test the role-based login redirection system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@diu.edu.bd"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={testLogin}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Test Login & Redirect
              </Button>
              
              <Button 
                onClick={testRoleRedirects}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Role Redirects
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
              <p className="font-medium mb-2">Expected Redirects:</p>
              <ul className="space-y-1">
                <li>• <strong>section_admin</strong> → /SectionAdmin</li>
                <li>• <strong>super_admin</strong> → /admin</li>
                <li>• <strong>admin/moderator/content_creator</strong> → /admin</li>
              </ul>
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

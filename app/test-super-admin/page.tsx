"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, TestTube, LogIn, Eye, EyeOff, Shield, User } from "lucide-react"

export default function TestSuperAdminPage() {
  const [email, setEmail] = useState("admin@diu.edu.bd")
  const [password, setPassword] = useState("admin123")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  const router = useRouter()

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSuperAdminLogin = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      addResult("Testing SuperAdmin login...")
      addResult(`Email: ${email}`)
      addResult(`Password: ${password.replace(/./g, '*')}`)
      
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

      if (data.success) {
        addResult(`✅ Login successful!`)
        addResult(`User: ${data.user.full_name} (${data.user.email})`)
        addResult(`Role: ${data.user.role}`)
        addResult(`Department: ${data.user.department || 'N/A'}`)
        
        // Determine expected redirect
        const expectedRedirect = data.user.role === "super_admin" ? "/admin" : 
                                data.user.role === "section_admin" ? "/SectionAdmin" : "/admin"
        addResult(`Expected redirect: ${expectedRedirect}`)
        
        // Test authentication check
        const authResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })
        
        if (authResponse.ok) {
          const authData = await authResponse.json()
          if (authData.success) {
            addResult("✅ Authentication check successful!")
            addResult(`Authenticated as: ${authData.user.full_name}`)
            addResult(`Authenticated role: ${authData.user.role}`)
          } else {
            addResult("❌ Authentication check failed")
          }
        }
        
        // Test admin dashboard access
        const adminResponse = await fetch('/admin', {
          method: 'GET',
          credentials: 'include',
        })
        
        addResult(`Admin dashboard access: ${adminResponse.status === 200 ? '✅ Accessible' : '❌ Not accessible'}`)
        
        toast.success(`SuperAdmin login successful! Should redirect to ${expectedRedirect}`)
      } else {
        addResult(`❌ Login failed: ${data.error}`)
        toast.error("SuperAdmin login failed")
      }
    } catch (error) {
      addResult(`❌ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error("Test error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const testAdminUsersAPI = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      addResult("Testing admin users API...")
      
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include',
      })
      
      const data = await response.json()
      addResult(`API Response status: ${response.status}`)
      
      if (data.success && data.users) {
        addResult(`✅ Found ${data.users.length} admin users`)
        
        const superAdmins = data.users.filter((user: any) => user.role === 'super_admin')
        const sectionAdmins = data.users.filter((user: any) => user.role === 'section_admin')
        const regularAdmins = data.users.filter((user: any) => user.role === 'admin')
        
        addResult(`Super Admins: ${superAdmins.length}`)
        addResult(`Section Admins: ${sectionAdmins.length}`)
        addResult(`Regular Admins: ${regularAdmins.length}`)
        
        superAdmins.forEach((user: any) => {
          addResult(`  - ${user.full_name} (${user.email}) - Active: ${user.is_active}`)
        })
        
        if (superAdmins.length === 0) {
          addResult("⚠️ No super admin users found!")
        }
        
        toast.success("Admin users API test completed")
      } else {
        addResult(`❌ API failed: ${data.error || 'Unknown error'}`)
        toast.error("Admin users API test failed")
      }
    } catch (error) {
      addResult(`❌ API test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error("API test error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const createSuperAdmin = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      addResult("Creating SuperAdmin user...")
      
      const userData = {
        email: "admin@diu.edu.bd",
        password: "admin123",
        full_name: "Super Administrator",
        role: "super_admin",
        department: "Administration"
      }
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      })
      
      const data = await response.json()
      addResult(`Create user response: ${response.status}`)
      
      if (data.success) {
        addResult(`✅ SuperAdmin created successfully!`)
        addResult(`User: ${data.user.full_name} (${data.user.email})`)
        addResult(`Role: ${data.user.role}`)
        toast.success("SuperAdmin user created successfully!")
      } else {
        addResult(`❌ Creation failed: ${data.error}`)
        if (data.error.includes("already exists")) {
          addResult("ℹ️ SuperAdmin user already exists")
          toast.info("SuperAdmin user already exists")
        } else {
          toast.error("SuperAdmin creation failed")
        }
      }
    } catch (error) {
      addResult(`❌ Creation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error("SuperAdmin creation error")
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
              <Shield className="h-5 w-5" />
              SuperAdmin Test Dashboard
            </CardTitle>
            <CardDescription>
              Test SuperAdmin login, dashboard access, and user management
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
                  placeholder="admin@diu.edu.bd"
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
                    placeholder="admin123"
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={testSuperAdminLogin}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Test SuperAdmin Login
              </Button>
              
              <Button 
                onClick={testAdminUsersAPI}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <User className="h-4 w-4 mr-2" />
                )}
                Check Admin Users
              </Button>
              
              <Button 
                onClick={createSuperAdmin}
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Create SuperAdmin
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
              <p className="font-medium mb-2">Default SuperAdmin Credentials:</p>
              <ul className="space-y-1">
                <li>• <strong>Email:</strong> admin@diu.edu.bd</li>
                <li>• <strong>Password:</strong> admin123</li>
                <li>• <strong>Role:</strong> super_admin</li>
                <li>• <strong>Expected Redirect:</strong> /admin</li>
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

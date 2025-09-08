"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogIn } from "lucide-react"

export function AdminLogin() {
  const [email, setEmail] = useState("admin@diu.edu.bd")
  const [password, setPassword] = useState("admin123")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Welcome back, ${data.user.full_name}!`)

        // Determine redirect URL based on user role
        const redirectUrl = data.user?.role === "section_admin" ? "/SectionAdmin" : "/admin"
        console.log(`User role: ${data.user?.role}, redirecting to: ${redirectUrl}`)
        router.push(redirectUrl)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the section admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@diu.edu.bd"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Test Credentials:</p>
            <p className="text-xs font-mono">Email: admin@diu.edu.bd</p>
            <p className="text-xs font-mono">Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

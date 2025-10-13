"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  User, 
  Shield,
  Clock,
  Key
} from "lucide-react"

interface AuthStatus {
  isAuthenticated: boolean
  user?: {
    id: string
    email: string
    role: string
    department?: string
  }
  error?: string
  tokenPresent?: boolean
  lastChecked?: string
}

export function AuthStatusDebug() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false })
  const [isLoading, setIsLoading] = useState(false)

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setAuthStatus({
          isAuthenticated: true,
          user: data.user,
          tokenPresent: true,
          lastChecked: new Date().toLocaleTimeString()
        })
      } else {
        setAuthStatus({
          isAuthenticated: false,
          error: data.error || "Authentication failed",
          tokenPresent: false,
          lastChecked: new Date().toLocaleTimeString()
        })
      }
    } catch (error) {
      setAuthStatus({
        isAuthenticated: false,
        error: "Network error or server not responding",
        tokenPresent: false,
        lastChecked: new Date().toLocaleTimeString()
      })
    } finally {
      setIsLoading(false)
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
    checkAuthStatus()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authentication Status Debug
        </CardTitle>
        <CardDescription>
          Check your current authentication state and troubleshoot login issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authentication Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {authStatus.isAuthenticated ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium">
                {authStatus.isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </p>
              {authStatus.lastChecked && (
                <p className="text-sm text-muted-foreground">
                  Last checked: {authStatus.lastChecked}
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkAuthStatus}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        {/* User Information */}
        {authStatus.user && (
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              <span className="font-medium">User Information</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-mono">{authStatus.user.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>
                <Badge variant="outline">{authStatus.user.role}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>
                <p className="font-mono">{authStatus.user.department || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">User ID:</span>
                <p className="font-mono text-xs">{authStatus.user.id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Information */}
        {authStatus.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Authentication Error:</strong> {authStatus.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Token Status */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-4 w-4" />
            <span className="font-medium">Token Status</span>
          </div>
          <div className="flex items-center gap-2">
            {authStatus.tokenPresent ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Token Present
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                No Token
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {!authStatus.isAuthenticated ? (
            <Button asChild className="flex-1">
              <a href="/login">Go to Login</a>
            </Button>
          ) : (
            <Button onClick={testSemesterAPI} variant="outline" className="flex-1">
              Test Semester API
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/SectionAdmin/semester-management"}
          >
            Go to Semester Management
          </Button>
        </div>

        {/* Troubleshooting Tips */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Troubleshooting Tips:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>If not authenticated, try logging in at <code>/login</code></li>
              <li>Clear browser cookies and try logging in again</li>
              <li>Check if your session has expired (24 hours)</li>
              <li>Ensure you have section_admin role or higher</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

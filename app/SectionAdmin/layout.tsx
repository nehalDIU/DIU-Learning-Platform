"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SectionAdminSidebar } from "@/components/section-admin/section-admin-sidebar"
import { SectionAdminHeader } from "@/components/section-admin/section-admin-header"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus, LogIn, Shield } from "lucide-react"
import { Toaster } from "sonner"

function SectionAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, isSectionAdmin, isSuperAdmin } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Authentication Required</CardTitle>
            <CardDescription>
              Please sign up or log in to access the Section Admin Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push('/section-admin-signup')}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Section Admin Account
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user has section admin role
  if (!isSectionAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the Section Admin Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              <p>Current role: <span className="font-medium">{user?.role}</span></p>
              <p>Required role: Section Admin or Super Admin</p>
            </div>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Go to Main Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SectionAdminSidebar user={user} />
      <div className="lg:pl-64">
        <SectionAdminHeader user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default function SectionAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <SectionAdminLayoutContent>{children}</SectionAdminLayoutContent>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  )
}

"use client"

import React from "react"
import { SectionAdminSidebar } from "@/components/section-admin/section-admin-sidebar"
import { SectionAdminHeader } from "@/components/section-admin/section-admin-header"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { Toaster } from "sonner"

function SectionAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    // This should not happen due to middleware, but just in case
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Please log in to access the section admin panel.</p>
        </div>
      </div>
    )
  }

  // Check if user has section admin role
  if (user.role !== "section_admin" && user.role !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the section admin panel.</p>
        </div>
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

"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: "super_admin" | "admin" | "moderator" | "content_creator" | "section_admin"
  department?: string
  section?: string // Add section field for better clarity
  phone?: string
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

interface SectionAdminSignupData {
  name: string
  email: string
  section: string
  password: string
}

interface AuthContextType {
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>
  sectionAdminSignup: (data: SectionAdminSignupData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  getRedirectUrl: (user?: AdminUser) => string
  isAuthenticated: boolean
  isSectionAdmin: boolean
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Computed properties for easier access
  const isAuthenticated = !!user
  const isSectionAdmin = user?.role === "section_admin"
  const isSuperAdmin = user?.role === "super_admin"

  // Helper function to get redirect URL based on user role
  const getRedirectUrl = (targetUser?: AdminUser) => {
    const userToCheck = targetUser || user
    if (!userToCheck) return "/login"

    switch (userToCheck.role) {
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

  const checkAuth = async () => {
    try {
      console.log("🔍 Checking authentication...")
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      console.log("📊 Auth check response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("📊 Auth check response data:", data)
        if (data.success) {
          console.log("✅ User authenticated:", data.user.email)
          // Map department to section for section admins for better clarity
          const userData = {
            ...data.user,
            section: data.user.role === "section_admin" ? data.user.department : undefined
          }
          setUser(userData)
        } else {
          console.log("❌ Auth check failed:", data.error)
          setUser(null)
        }
      } else {
        console.log("❌ Auth check response not ok:", response.status)
        setUser(null)
      }
    } catch (error) {
      console.error("❌ Auth check error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("🔍 AuthContext login for:", email)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log("📊 AuthContext login response:", data)

      if (data.success) {
        console.log("✅ AuthContext login successful")
        // Map department to section for section admins for better clarity
        const userData = {
          ...data.user,
          section: data.user.role === "section_admin" ? data.user.department : undefined
        }
        setUser(userData)
        const redirectUrl = getRedirectUrl(userData)
        return { success: true, redirectUrl }
      } else {
        console.log("❌ AuthContext login failed:", data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("❌ AuthContext login error:", error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const sectionAdminSignup = async (signupData: SectionAdminSignupData) => {
    try {
      console.log("🔍 AuthContext section admin signup for:", signupData.email)
      const response = await fetch("/api/auth/section-admin-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(signupData),
      })

      const data = await response.json()
      console.log("📊 AuthContext signup response:", data)

      if (data.success) {
        console.log("✅ AuthContext signup successful")
        // Map department to section for section admins
        const userData = {
          ...data.user,
          section: data.user.section || data.user.department
        }
        setUser(userData)
        return { success: true }
      } else {
        console.log("❌ AuthContext signup failed:", data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("❌ AuthContext signup error:", error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    loading,
    login,
    sectionAdminSignup,
    logout,
    checkAuth,
    getRedirectUrl,
    isAuthenticated,
    isSectionAdmin,
    isSuperAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

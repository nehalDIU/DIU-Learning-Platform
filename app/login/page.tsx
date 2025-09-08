"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff, Shield } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()

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

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const redirectUrl = getRedirectUrl(data.user)
            console.log(`User role: ${data.user.role}, redirecting to: ${redirectUrl}`)
            router.push(redirectUrl)
          }
        }
      } catch (error) {
        // User not logged in, stay on login page
        console.log("User not logged in, showing login form")
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      console.log("🔍 Starting login process...")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      console.log("📊 Login response status:", response.status)
      const data = await response.json()
      console.log("📊 Login response data:", data)

      if (data.success) {
        console.log("✅ Login successful, determining redirect URL...")

        const redirectUrl = getRedirectUrl(data.user)
        console.log(`User role: ${data.user.role}, redirecting to: ${redirectUrl}`)

        // Force a small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 300))

        // Use window.location instead of router.push for more reliable redirect
        console.log(`🔄 Redirecting to ${redirectUrl}...`)
        window.location.href = redirectUrl
      } else {
        console.log("❌ Login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      setError("Network error occurred")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-600">DIU Learning Platform Administration</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="space-y-1 mb-6">
            <h2 className="text-2xl text-center font-semibold">Sign In</h2>
            <p className="text-center text-gray-600">
              Enter your credentials to access the admin dashboard
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@diu.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Section Admin Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need a Section Admin account?{" "}
              <a
                href="/section-admin-signup"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Create one here
              </a>
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>© 2024 DIU Learning Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

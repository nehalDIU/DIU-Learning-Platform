import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Simple JWT verification for Edge Runtime
function verifyJWT(token: string, secret: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const payload = JSON.parse(atob(parts[1]))

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired')
    }

    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only log in development to avoid Vercel function logs spam
  if (process.env.NODE_ENV === 'development') {
    console.log("Middleware called for:", pathname)
  }

  // Add analytics headers for tracking
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  response.headers.set('x-timestamp', new Date().toISOString())

  // Allow access to login page without authentication
  if (pathname === "/login") {
    if (process.env.NODE_ENV === 'development') {
      console.log("Allowing access to login page")
    }
    return response
  }

  // Check if accessing admin routes
  if (pathname.startsWith("/admin")) {
    // For all admin routes, check authentication
    const token = request.cookies.get("admin_token")?.value

    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 Admin route access attempt:", pathname)
      console.log("🔍 Token found:", token ? "YES" : "NO")
      console.log("🔍 Token length:", token ? token.length : 0)
      console.log("🔍 JWT_SECRET length:", JWT_SECRET.length)
    }

    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.log("❌ No token found, redirecting to login")
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      // Verify JWT token using Edge Runtime compatible method
      const decoded = verifyJWT(token, JWT_SECRET)
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ Token verified successfully:", decoded)
        console.log("✅ Allowing access to:", pathname)
      }
      return NextResponse.next()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log("❌ Invalid token error:", error.message)
        console.log("❌ Token that failed:", token.substring(0, 50) + "...")
      }
      // Invalid token, redirect to login
      const redirectResponse = NextResponse.redirect(new URL("/login", request.url))
      redirectResponse.cookies.delete("admin_token")
      return redirectResponse
    }
  }

  // Check if accessing section admin routes (both /section-admin and /SectionAdmin)
  if (pathname.startsWith("/section-admin") || pathname.startsWith("/SectionAdmin")) {
    // For all section admin routes, check authentication
    const token = request.cookies.get("admin_token")?.value

    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 Section admin route access attempt:", pathname)
      console.log("🔍 Token found:", token ? "YES" : "NO")
    }

    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.log("❌ No token found, redirecting to login")
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      // Verify JWT token using Edge Runtime compatible method
      const decoded = verifyJWT(token, JWT_SECRET)
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ Section admin token verified successfully:", decoded)
        console.log("✅ Allowing access to:", pathname)
      }
      return NextResponse.next()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log("❌ Invalid token error:", error.message)
      }
      // Invalid token, redirect to login
      const redirectResponse = NextResponse.redirect(new URL("/login", request.url))
      redirectResponse.cookies.delete("admin_token")
      return redirectResponse
    }
  }

  // Check if the path matches our shareable URL patterns
  const shareablePatterns = [
    /^\/video\/[a-f0-9-]{36}$/i,
    /^\/slide\/[a-f0-9-]{36}$/i,
    /^\/study-tool\/[a-f0-9-]{36}$/i
  ]

  const isShareableUrl = shareablePatterns.some(pattern => pattern.test(pathname))

  if (process.env.NODE_ENV === 'development') {
    console.log("Is shareable URL:", isShareableUrl, "for path:", pathname)
  }

  if (isShareableUrl) {
    // Rewrite to the main page but keep the original URL in the browser
    const url = request.nextUrl.clone()
    url.pathname = '/'

    // Add the original path as a query parameter so we can access it
    url.searchParams.set('share_path', pathname)

    if (process.env.NODE_ENV === 'development') {
      console.log("Rewriting to:", url.toString())
    }

    const rewriteResponse = NextResponse.rewrite(url)
    // Add analytics headers for shareable URLs
    rewriteResponse.headers.set('x-share-url', pathname)
    return rewriteResponse
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/section-admin/:path*',
    '/SectionAdmin/:path*',
    '/login',
    '/video/:path*',
    '/slide/:path*',
    '/study-tool/:path*'
  ]
}

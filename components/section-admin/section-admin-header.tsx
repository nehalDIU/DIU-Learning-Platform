"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useAuth, type AdminUser } from "@/contexts/auth-context"
import {
  Bell,
  Settings,
  User,
  Moon,
  Sun,
  LogOut,
  Search,
  Plus,
  Shield,
  Calendar,
  BookOpen,
  BarChart3
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface SectionAdminHeaderProps {
  user: AdminUser
}

export function SectionAdminHeader({ user }: SectionAdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)

  // Fetch user profile photo
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const response = await fetch("/api/profile")
        const result = await response.json()
        if (result.success && result.profile?.profile_photo_url) {
          setProfilePhotoUrl(result.profile.profile_photo_url)
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error)
      }
    }

    fetchProfilePhoto()
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/SectionAdmin/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800"
      case "section_admin":
        return "bg-blue-100 text-blue-800"
      case "admin":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <header className="bg-card sticky top-0 z-30 backdrop-blur-sm bg-card/95">
      <div className="border-b border-border lg:border-l lg:border-l-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left side - Title and Search */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1">
          {/* Mobile menu space */}
          <div className="w-9 lg:hidden"></div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <span className="hidden md:inline">Section Admin</span>
                <span className="md:hidden">Admin</span>
              </h1>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Admin</span>
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 max-w-sm lg:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-9 bg-background/50 border-border/50 focus:bg-background focus:border-border rounded-lg text-sm"
              />
            </div>
          </form>
        </div>

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-9 px-4">
              <Link href="/SectionAdmin/semester-management?mode=create">
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">New Semester</span>
                <span className="md:hidden">New</span>
              </Link>
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">New semester created</p>
                      <p className="text-xs text-muted-foreground">Spring 2025 semester has been created successfully</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Course updated</p>
                      <p className="text-xs text-muted-foreground">Database Management course content updated</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/SectionAdmin/notifications" className="w-full">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 sm:px-3">
                <div className="w-7 h-7 rounded-full overflow-hidden">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-foreground leading-none">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground leading-none mt-1">
                    {user.department || 'No Department'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <div className="px-2 py-1.5 space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                    {formatRole(user.role)}
                  </Badge>
                  {user.department && (
                    <Badge variant="outline" className="text-xs">
                      {user.department}
                    </Badge>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/SectionAdmin/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/SectionAdmin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Dashboard Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/SectionAdmin/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  My Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="sm:hidden mt-3 flex items-center gap-3">
        {/* Mobile New Semester Button */}
        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-9 px-4 flex-1">
          <Link href="/SectionAdmin/semester-management?mode=create">
            <Plus className="h-4 w-4 mr-1" />
            New Semester
          </Link>
        </Button>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-9 bg-background/50 border-border/50 focus:bg-background focus:border-border rounded-lg text-sm"
            />
          </div>
        </form>
      </div>
    </header>
  )
}

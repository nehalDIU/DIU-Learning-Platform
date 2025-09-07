"use client"

import { useState } from "react"
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
  HelpCircle,
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
    <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-30 backdrop-blur-sm bg-card/95">
      <div className="flex items-center justify-between">
        {/* Left side - Title and Search */}
        <div className="flex items-center gap-6 flex-1">
          <div className="hidden lg:block">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Section Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your section's academic content and performance
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search semesters, courses, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-9"
              />
            </div>
          </form>
        </div>

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/SectionAdmin/semester-management">
                <Plus className="h-4 w-4 mr-1" />
                New Semester
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
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  2
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New semester created</p>
                      <p className="text-xs text-muted-foreground">Spring 2025 semester has been created successfully</p>
                      <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Course updated</p>
                      <p className="text-xs text-muted-foreground">Database Management course content updated</p>
                      <p className="text-xs text-green-600 mt-1">1 day ago</p>
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

          {/* Help */}
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Help & Documentation">
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-3">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
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
                <p className="text-sm text-foreground">{user.full_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
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

      {/* Mobile Search Bar */}
      <form onSubmit={handleSearch} className="md:hidden mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search semesters, courses, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </form>
    </header>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  Home,
  Menu,
  Play,
  Settings,
  User,
  Users,
  X,
  Shield,
  Zap,
  Sparkles,
  TrendingUp,
  FolderOpen,
  ClipboardList,
  PieChart,
  Activity
} from "lucide-react"

import { type AdminUser } from "@/contexts/auth-context"

interface SectionAdminSidebarProps {
  user: AdminUser
}

const navigation = [
  { name: "Dashboard", href: "/SectionAdmin", icon: Home },
  { name: "My Profile", href: "/SectionAdmin/profile", icon: User },
  { name: "Semester Management", href: "/SectionAdmin/semester-management", icon: GraduationCap },
  { name: "All Semesters", href: "/SectionAdmin/semesters", icon: Calendar },
  { name: "Courses", href: "/SectionAdmin/courses", icon: BookOpen },
  { name: "Topics", href: "/SectionAdmin/topics", icon: FileText },
  { name: "Study Resources", href: "/SectionAdmin/study-resources", icon: FolderOpen },
  { name: "Analytics", href: "/SectionAdmin/analytics", icon: BarChart3 },
  { name: "Reports", href: "/SectionAdmin/reports", icon: PieChart },
  { name: "Activity Log", href: "/SectionAdmin/activity", icon: Activity },
  { name: "Settings", href: "/SectionAdmin/settings", icon: Settings },
]

export function SectionAdminSidebar({ user }: SectionAdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()



  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-4 z-50 lg:hidden bg-card border border-border shadow-sm h-9 w-9"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Section Admin</h2>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/SectionAdmin" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors flex-shrink-0",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-accent-foreground"
                  )} />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              <p>Section Admin v1.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

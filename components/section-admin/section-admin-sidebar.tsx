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
  {
    name: "Semester Management",
    href: "/SectionAdmin/semester-management",
    icon: GraduationCap,
    description: "Create and manage semesters"
  },
  { 
    name: "All Semesters", 
    href: "/SectionAdmin/semesters", 
    icon: Calendar,
    description: "View all semester data"
  },
  { 
    name: "Courses", 
    href: "/SectionAdmin/courses", 
    icon: BookOpen,
    description: "Manage course content"
  },
  { 
    name: "Topics", 
    href: "/SectionAdmin/topics", 
    icon: FileText,
    description: "Organize learning topics"
  },
  { 
    name: "Study Resources", 
    href: "/SectionAdmin/study-resources", 
    icon: FolderOpen,
    description: "Manage study materials"
  },
  { 
    name: "Analytics", 
    href: "/SectionAdmin/analytics", 
    icon: BarChart3,
    description: "Performance insights"
  },
  { 
    name: "Reports", 
    href: "/SectionAdmin/reports", 
    icon: PieChart,
    description: "Generate reports"
  },
  { 
    name: "Activity Log", 
    href: "/SectionAdmin/activity", 
    icon: Activity,
    description: "Track system activity"
  },
  { 
    name: "Settings", 
    href: "/SectionAdmin/settings", 
    icon: Settings,
    description: "Configure preferences"
  },
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
        className="fixed top-4 left-4 z-50 lg:hidden"
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
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Section Admin</h2>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/SectionAdmin" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={item.description}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground",
                    "group-hover:scale-110"
                  )} />
                  <div className="flex-1">
                    <span className="block">{item.name}</span>
                    {item.description && (
                      <span className={cn(
                        "text-xs transition-colors duration-200",
                        isActive ? "text-blue-100" : "text-muted-foreground"
                      )}>
                        {item.description}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              <p>Section Admin Dashboard</p>
              <p className="mt-1">v1.0.0</p>
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

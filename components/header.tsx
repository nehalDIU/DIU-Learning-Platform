"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, Sun, User, Moon, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const navigationItems = [
    { name: "Home", href: "/", primary: false },
    { name: "Notes", href: "/notes", primary: false },
    { name: "Courses", href: "/courses", primary: false },
    { name: "Contributor", href: "/contributor", primary: true },
    { name: "Result", href: "/result", primary: false },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <header className={cn(
        "border-b border-border/40 sticky top-0 z-50 backdrop-blur-md bg-background/98 shadow-sm",
        className
      )}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1 sm:flex-none">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0">
                  <img
                    src="/images/diu-logo.png"
                    alt="Daffodil International University Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to a simple DIU text if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent && !parent.querySelector('.fallback-text')) {
                        const fallback = document.createElement('span')
                        fallback.className = 'fallback-text text-primary font-bold text-xs sm:text-sm'
                        fallback.textContent = 'DIU'
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-base sm:text-lg text-foreground truncate">
                    DIU CSE
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block truncate">
                    Learning Platform
                  </span>
                </div>
              </div>
            </div>

            {/* Center Section - Navigation (Hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-1 xl:gap-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.name}
                    variant={item.primary ? "default" : "ghost"}
                    className={cn(
                      "text-sm font-medium px-3 md:px-4 lg:px-5 py-2 rounded-md transition-all duration-200",
                      item.primary
                        ? "px-4 md:px-6 bg-primary hover:bg-primary/90 hover:scale-105"
                        : "hover:bg-accent/80 hover:scale-105",
                      isActive && !item.primary && "bg-accent"
                    )}
                    onClick={() => handleNavigation(item.href)}
                  >
                    {item.name}
                  </Button>
                )
              })}
            </nav>

            {/* Right Section - Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-md hover:bg-accent/80 hover:scale-110 transition-all duration-200"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-md hover:bg-accent/80 hover:scale-110 transition-all duration-200 relative"
                title="Notifications"
              >
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {/* Notification badge */}
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
                  <span className="sr-only">3 notifications</span>
                </span>
              </Button>

              {/* Profile Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-accent/80 hover:scale-110 transition-all duration-200"
                title="Profile"
              >
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-md hover:bg-accent/80 hover:scale-110 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                title="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-md">
            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <nav className="flex flex-col gap-1.5 sm:gap-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Button
                      key={item.name}
                      variant={item.primary ? "default" : "ghost"}
                      className={cn(
                        "justify-start text-sm font-medium px-3 sm:px-4 py-2.5 sm:py-3 rounded-md transition-all duration-200",
                        item.primary
                          ? "bg-primary hover:bg-primary/90 hover:scale-[1.02]"
                          : "hover:bg-accent/80 hover:scale-[1.02]",
                        isActive && !item.primary && "bg-accent"
                      )}
                      onClick={() => handleNavigation(item.href)}
                    >
                      {item.name}
                    </Button>
                  )
                })}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

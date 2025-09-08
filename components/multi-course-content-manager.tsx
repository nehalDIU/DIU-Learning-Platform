"use client"

import { useState, useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  X, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Maximize2,
  Minimize2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LazyContentViewer } from "@/components/lazy-content-viewer"

interface ContentItem {
  type: "slide" | "video" | "document" | "syllabus" | "study-tool"
  title: string
  url: string
  id: string
  topicTitle?: string
  courseTitle?: string
  courseId?: string
  description?: string
  courseCode?: string
  teacherName?: string
}

interface CourseTab {
  id: string
  title: string
  courseCode?: string
  content: ContentItem | null
  isActive: boolean
}

interface MultiCourseContentManagerProps {
  className?: string
  onContentChange?: (content: ContentItem | null) => void
}

export function MultiCourseContentManager({ 
  className, 
  onContentChange 
}: MultiCourseContentManagerProps) {
  const [courseTabs, setCourseTabs] = useState<CourseTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Add or update a course tab
  const addOrUpdateCourseTab = useCallback((content: ContentItem) => {
    const courseId = content.courseId || content.courseTitle || 'unknown'
    const courseTitle = content.courseTitle || 'Unknown Course'
    const courseCode = content.courseCode

    setCourseTabs(prev => {
      const existingTabIndex = prev.findIndex(tab => tab.id === courseId)
      
      if (existingTabIndex >= 0) {
        // Update existing tab
        const updated = [...prev]
        updated[existingTabIndex] = {
          ...updated[existingTabIndex],
          content,
          isActive: true
        }
        // Deactivate other tabs
        updated.forEach((tab, index) => {
          if (index !== existingTabIndex) {
            tab.isActive = false
          }
        })
        return updated
      } else {
        // Add new tab
        const newTab: CourseTab = {
          id: courseId,
          title: courseTitle,
          courseCode,
          content,
          isActive: true
        }
        // Deactivate existing tabs and add new one
        const updated = prev.map(tab => ({ ...tab, isActive: false }))
        return [...updated, newTab]
      }
    })

    setActiveTabId(courseId)
    onContentChange?.(content)
  }, [onContentChange])

  // Remove a course tab
  const removeCourseTab = useCallback((tabId: string) => {
    setCourseTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId)
      
      // If we removed the active tab, activate another one
      if (activeTabId === tabId && filtered.length > 0) {
        const newActiveTab = filtered[filtered.length - 1]
        newActiveTab.isActive = true
        setActiveTabId(newActiveTab.id)
        onContentChange?.(newActiveTab.content)
      } else if (filtered.length === 0) {
        setActiveTabId(null)
        onContentChange?.(null)
      }
      
      return filtered
    })
  }, [activeTabId, onContentChange])

  // Switch to a different tab
  const switchToTab = useCallback((tabId: string) => {
    setCourseTabs(prev => 
      prev.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }))
    )
    setActiveTabId(tabId)
    
    const activeTab = courseTabs.find(tab => tab.id === tabId)
    onContentChange?.(activeTab?.content || null)
  }, [courseTabs, onContentChange])

  // Get the currently active content
  const activeContent = courseTabs.find(tab => tab.id === activeTabId)?.content || null

  // Expose methods for external use
  useEffect(() => {
    // Attach methods to window for external access (temporary solution)
    ;(window as any).multiCourseManager = {
      addContent: addOrUpdateCourseTab,
      removeTab: removeCourseTab,
      switchTab: switchToTab
    }
  }, [addOrUpdateCourseTab, removeCourseTab, switchToTab])

  if (courseTabs.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center h-full p-4 sm:p-6 lg:p-8",
        className
      )}>
        <div className="text-center max-w-sm sm:max-w-md lg:max-w-lg animate-slide-up">
          {/* Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-primary-lg transform hover:scale-105 transition-transform duration-300">
            <span className="text-primary-foreground font-bold text-xl sm:text-2xl lg:text-3xl">DIU</span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent mb-4 leading-tight">
            Welcome to DIU CSE Learning Platform
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-6 text-sm sm:text-base lg:text-lg leading-relaxed">
            Access your course materials, watch video lectures, and study with interactive content
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-xs sm:text-sm">
            <div className="flex flex-col items-center p-3 bg-card/50 rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 dark:text-blue-400 text-sm">📊</span>
              </div>
              <span className="text-muted-foreground">Slides</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card/50 rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-red-600 dark:text-red-400 text-sm">🎥</span>
              </div>
              <span className="text-muted-foreground">Videos</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card/50 rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 dark:text-green-400 text-sm">📚</span>
              </div>
              <span className="text-muted-foreground">Documents</span>
            </div>
          </div>

          {/* Hint */}
          <div className="text-xs text-muted-foreground/70 mt-4">
            Select content from the sidebar to start learning
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Course Tabs Header */}
      <div className="flex-none border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-2 py-1">
          {/* Tabs */}
          <ScrollArea className="flex-1">
            <div className="flex items-center gap-1 px-2">
              {courseTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={tab.isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => switchToTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 min-w-0 max-w-48 h-8 px-3",
                    tab.isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <BookOpen className="h-3 w-3 shrink-0" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-medium truncate">
                      {tab.courseCode || tab.title}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeCourseTab(tab.id)
                    }}
                    className="h-4 w-4 p-0 hover:bg-destructive/20 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Controls */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeContent && (
          <div className="h-full">
            <LazyContentViewer 
              content={activeContent} 
              isLoading={false}
            />
          </div>
        )}
      </div>

      {/* Content Info Footer */}
      {activeContent && (
        <div className="flex-none bg-card/95 backdrop-blur-sm px-3 py-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="secondary" className="text-xs">
                {activeContent.type}
              </Badge>
              <span className="text-sm font-medium truncate">
                {activeContent.title}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {activeContent.courseTitle}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

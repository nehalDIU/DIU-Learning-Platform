"use client"

import { useState, useCallback, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

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

interface MultiCourseContentManagerProps {
  className?: string
  onContentChange?: (content: ContentItem | null) => void
}

export function MultiCourseContentManager({
  className,
  onContentChange
}: MultiCourseContentManagerProps) {
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null)

  // Set content directly
  const setContent = useCallback((content: ContentItem) => {
    setCurrentContent(content)
    onContentChange?.(content)
  }, [onContentChange])

  // Expose methods for external use
  useEffect(() => {
    // Attach methods to window for external access (temporary solution)
    ;(window as any).multiCourseManager = {
      addContent: setContent
    }
  }, [setContent])

  if (!currentContent) {
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
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentContent && (
          <div className="h-full">
            <LazyContentViewer
              content={currentContent}
              isLoading={false}
            />
          </div>
        )}
      </div>

      {/* Content Info Footer */}
      {currentContent && (
        <div className="flex-none bg-card/95 backdrop-blur-sm px-3 py-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="secondary" className="text-xs">
                {currentContent.type}
              </Badge>
              <span className="text-sm font-medium truncate">
                {currentContent.title}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {currentContent.courseTitle}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

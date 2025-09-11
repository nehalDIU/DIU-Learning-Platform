"use client"

import * as React from "react"
import { useState, useCallback, memo, useMemo, useRef, useEffect } from "react"
import {
  ChevronDown,
  ChevronRight,
  Star,
  BookOpen,
  User,
  Calendar,
  Clock,
  GraduationCap,
  Loader2,
  MoreVertical,
  Play,
  FileText,
  Users
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface CourseStats {
  totalTopics: number
  totalVideos: number
  totalSlides: number
  totalStudyTools: number
  completedItems?: number
  enrolledStudents?: number
}

interface CourseCardProps {
  course: {
    id: string
    title: string
    course_code: string
    teacher_name: string
    teacher_email?: string
    description?: string
    credits?: number
    is_highlighted: boolean
    created_at: string
    updated_at: string
    semester?: {
      id: string
      title: string
      section: string
      is_active: boolean
    }
  }
  stats?: CourseStats
  progress?: number
  variant?: "default" | "compact" | "detailed"
  showActions?: boolean
  onContentSelect?: (content: any) => void
  onCourseSelect?: (courseId: string) => void
  onEdit?: (courseId: string) => void
  onDelete?: (courseId: string) => void
  selectedContentId?: string
  className?: string
}

export const EnhancedCourseCard = memo(({
  course,
  stats,
  progress,
  variant = "default",
  showActions = false,
  onContentSelect,
  onCourseSelect,
  onEdit,
  onDelete,
  selectedContentId,
  className
}: CourseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [courseData, setCourseData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  // Memoize expensive calculations
  const cardClasses = useMemo(() => cn(
    "group relative overflow-hidden transition-all duration-200 ease-out will-change-transform",
    "hover:shadow-lg hover:-translate-y-1",
    course.is_highlighted
      ? "border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10"
      : "border-l-4 border-l-transparent hover:border-l-primary/20",
    "cursor-pointer",
    className
  ), [course.is_highlighted, className])

  // Optimized data fetching with caching
  const fetchCourseData = useCallback(async () => {
    if (courseData || isLoading || variant === "compact") return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/courses/${course.id}/topics`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCourseData(data)
    } catch (error) {
      console.error("Failed to fetch course data:", error)
      setCourseData([]) // Set empty array to prevent refetching
    } finally {
      setIsLoading(false)
    }
  }, [course.id, courseData, isLoading, variant])

  // Optimized toggle handler
  const handleToggle = useCallback(() => {
    if (variant === "compact") {
      onCourseSelect?.(course.id)
      return
    }

    setIsExpanded(prev => {
      const newExpanded = !prev
      if (newExpanded && !courseData && !isLoading) {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          fetchCourseData()
        })
      }
      return newExpanded
    })
  }, [variant, onCourseSelect, course.id, courseData, isLoading, fetchCourseData])

  // Handle smooth height transitions
  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        const height = contentRef.current.scrollHeight
        setContentHeight(height)
      } else {
        setContentHeight(0)
      }
    }
  }, [isExpanded, courseData])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const cardVariants = {
    default: "p-6",
    compact: "p-4",
    detailed: "p-6"
  }

  const titleVariants = {
    default: "text-lg font-semibold",
    compact: "text-base font-medium",
    detailed: "text-xl font-bold"
  }

  return (
    <Card className={cardClasses}>
      {/* Gradient overlay for highlighted courses */}
      {course.is_highlighted && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none" />
      )}

      <CardHeader className={cn("relative", cardVariants[variant])}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0" onClick={handleToggle}>
            {/* Course Icon/Avatar */}
            <div className={cn(
              "rounded-lg flex items-center justify-center shrink-0",
              course.is_highlighted 
                ? "bg-blue-600 dark:bg-blue-500" 
                : "bg-primary",
              variant === "compact" ? "w-10 h-10" : "w-12 h-12"
            )}>
              <GraduationCap className={cn(
                "text-white",
                variant === "compact" ? "h-5 w-5" : "h-6 w-6"
              )} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Course Title and Status */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className={cn(
                  titleVariants[variant],
                  "text-foreground leading-tight tracking-tight truncate"
                )}>
                  {course.title}
                </h3>
                {course.is_highlighted && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                )}
              </div>

              {/* Course Code and Semester */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <Badge
                  variant={course.is_highlighted ? "default" : "secondary"}
                  className="text-xs font-medium"
                >
                  {course.course_code}
                </Badge>
                {course.semester && (
                  <span className="text-sm text-muted-foreground">
                    {course.semester.title} • {course.semester.section}
                  </span>
                )}
                {course.credits && (
                  <span className="text-sm text-muted-foreground">
                    {course.credits} credits
                  </span>
                )}
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${course.teacher_name}`} />
                  <AvatarFallback className="text-xs bg-muted">
                    {getInitials(course.teacher_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {course.teacher_name}
                  </p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>

              {/* Progress Bar (if progress provided) */}
              {progress !== undefined && variant !== "compact" && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Progress</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Course Stats */}
              {stats && variant !== "compact" && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{stats.totalTopics}</p>
                      <p className="text-xs text-muted-foreground">Topics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Play className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{stats.totalVideos}</p>
                      <p className="text-xs text-muted-foreground">Videos</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Indicator */}
              {variant !== "compact" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span>{isExpanded ? "Hide" : "Show"} content</span>
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
                </div>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(course.id)}>
                  Edit Course
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(course.id)} className="text-destructive">
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {/* Optimized Expanded Content with smooth height transition */}
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{
          height: isExpanded ? `${contentHeight}px` : '0px',
          opacity: isExpanded ? 1 : 0
        }}
      >
        <CardContent className="pt-0 pb-6 px-6" ref={contentRef}>
          {isLoading ? (
            <div className="space-y-2 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          ) : courseData && courseData.length > 0 ? (
            <div className="space-y-2 py-2">
              {courseData.map((topic: any, index: number) => (
                <div
                  key={topic.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors duration-150 cursor-pointer will-change-transform"
                  onClick={() => onContentSelect?.(topic)}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isExpanded ? 'fadeInUp 0.3s ease-out forwards' : 'none'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{topic.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.slides?.length || 0} slides • {topic.videos?.length || 0} videos
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : courseData && courseData.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground text-sm">
              No content available
            </div>
          ) : null}
        </CardContent>
      </div>
    </Card>
  )
})

EnhancedCourseCard.displayName = "EnhancedCourseCard"

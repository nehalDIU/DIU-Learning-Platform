"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
  Video,
  Download,
  ExternalLink,
  Clock,
  User,
  GraduationCap,
  Play,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Topic {
  id: string
  title: string
  description?: string
  order_index: number
  slides: Array<{
    id: string
    title: string
    google_drive_url: string
    order_index: number
  }>
  videos: Array<{
    id: string
    title: string
    youtube_url: string
    order_index: number
  }>
}

interface StudyResource {
  id: string
  title: string
  type: string
  content_url: string
  exam_type?: string
  is_downloadable: boolean
  created_at: string
}

interface Course {
  id: string
  title: string
  course_code: string
  teacher_name: string
  description?: string
  credits?: number
  enrollment?: {
    progress_percentage: number
    enrollment_date: string
    last_accessed?: string
  }
}

interface EnrolledCourseDetailProps {
  course: Course
  isExpanded: boolean
  onToggle: () => void
  className?: string
}

export function EnrolledCourseDetail({
  course,
  isExpanded,
  onToggle,
  className
}: EnrolledCourseDetailProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [studyResources, setStudyResources] = useState<StudyResource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  // Memoize expensive calculations
  const cardClasses = useMemo(() => cn(
    "group transition-all duration-200 hover:shadow-md border-0 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50",
    "shadow-sm hover:shadow-lg will-change-transform",
    className
  ), [className])

  const totalContent = useMemo(() => {
    return topics.reduce((total, topic) =>
      total + (topic.slides?.length || 0) + (topic.videos?.length || 0), 0
    )
  }, [topics])

  // Optimized data fetching
  const fetchCourseContent = useCallback(async () => {
    if (!isExpanded || topics.length > 0 || loading) return

    setLoading(true)
    setError(null)

    try {
      // Fetch topics and study resources in parallel
      // Use demo API for sample courses, real API for others
      const isDemo = course.id.startsWith('sample-')
      const apiPrefix = isDemo ? '/api/demo' : '/api'

      const [topicsResponse, studyResourcesResponse] = await Promise.all([
        fetch(`${apiPrefix}/courses/${course.id}/topics`),
        fetch(`${apiPrefix}/courses/${course.id}/study-tools`)
      ])

      if (!topicsResponse.ok || !studyResourcesResponse.ok) {
        throw new Error('Failed to fetch course content')
      }

      const [topicsData, studyResourcesData] = await Promise.all([
        topicsResponse.json(),
        studyResourcesResponse.json()
      ])

      setTopics(topicsData || [])
      setStudyResources(studyResourcesData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course content')
      setTopics([]) // Prevent refetching
      setStudyResources([])
    } finally {
      setLoading(false)
    }
  }, [isExpanded, topics.length, loading, course.id])

  // Optimized useEffect with proper dependencies
  useEffect(() => {
    if (isExpanded) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        fetchCourseContent()
      })
    }
  }, [isExpanded, fetchCourseContent])

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
  }, [isExpanded, topics, studyResources, loading])

  const handleContentClick = useCallback((url: string, title: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-4 px-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Course Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>

            {/* Course Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
                  {course.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary border-primary/20">
                    {course.course_code}
                  </Badge>
                  {course.credits && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {course.credits} Credits
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">{course.teacher_name}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="default"
              className="text-xs font-medium px-3 py-1 bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
            >
              ✓ Enrolled
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-9 w-9 p-0 rounded-lg hover:bg-primary/10 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Section */}
        {course.enrollment && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">Course Progress</span>
              <span className="font-bold text-primary">{course.enrollment.progress_percentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${course.enrollment.progress_percentage || 0}%` }}
              />
            </div>
            {course.enrollment.last_accessed && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Last accessed: {new Date(course.enrollment.last_accessed).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      {/* Optimized Expanded Content with smooth height transition */}
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{
          height: isExpanded ? `${contentHeight}px` : '0px',
          opacity: isExpanded ? 1 : 0
        }}
      >
        <CardContent className="pt-0 px-4 sm:px-6 pb-6" ref={contentRef}>
          {loading ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50 my-4">
              <AlertDescription className="text-red-800 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {/* Course Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{topics.length}</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Topics</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">{totalContent}</p>
                      <p className="text-xs text-green-700 dark:text-green-300">Content Items</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{studyResources.length}</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">Study Resources</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Topics Section */}
              {topics.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-base text-slate-900 dark:text-slate-100">Course Topics</h4>
                    <Badge variant="secondary" className="ml-auto text-xs">{topics.length}</Badge>
                  </div>

                  <div className="space-y-3">
                    {topics.map((topic, index) => (
                      <div key={topic.id} className="group border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800/50 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">{topic.title}</h5>
                              {topic.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{topic.description}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            Topic {topic.order_index}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {/* Slides */}
                          {topic.slides.map((slide) => (
                            <Button
                              key={slide.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleContentClick(slide.google_drive_url, slide.title)}
                              className="w-full justify-start text-left h-auto p-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg group/item"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                    {slide.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Presentation Slides</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              </div>
                            </Button>
                          ))}

                          {/* Videos */}
                          {topic.videos.map((video) => (
                            <Button
                              key={video.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleContentClick(video.youtube_url, video.title)}
                              className="w-full justify-start text-left h-auto p-3 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg group/item"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                                  <Play className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                    {video.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Video Lecture</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Resources Section */}
              {studyResources.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-base text-slate-900 dark:text-slate-100">Study Resources</h4>
                    <Badge variant="secondary" className="ml-auto text-xs">{studyResources.length}</Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {studyResources.map((resource) => (
                      <Button
                        key={resource.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleContentClick(resource.content_url, resource.title)}
                        className="w-full justify-start text-left h-auto p-4 hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700 hover:border-primary/50 group"
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                            {resource.is_downloadable ? (
                              <Download className="h-5 w-5 text-primary" />
                            ) : (
                              <ExternalLink className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate mb-1">
                              {resource.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800">
                                {resource.type}
                              </Badge>
                              {resource.exam_type && (
                                <Badge variant="outline" className="text-xs">
                                  {resource.exam_type}
                                </Badge>
                              )}
                              {resource.is_downloadable && (
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  Downloadable
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Added {new Date(resource.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {topics.length === 0 && studyResources.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">No Content Available</h3>
                  <p className="text-sm text-muted-foreground">Course content will appear here once it's added by the instructor.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

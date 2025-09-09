"use client"

import React, { useState, useEffect } from "react"
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
  GraduationCap
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

  const fetchCourseContent = async () => {
    if (!isExpanded || topics.length > 0) return

    setLoading(true)
    setError(null)

    try {
      // Fetch topics and study resources in parallel
      const [topicsResponse, studyResourcesResponse] = await Promise.all([
        fetch(`/api/courses/${course.id}/topics`),
        fetch(`/api/courses/${course.id}/study-tools`)
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isExpanded) {
      fetchCourseContent()
    }
  }, [isExpanded, course.id])

  const totalContent = topics.reduce((acc, topic) => 
    acc + topic.slides.length + topic.videos.length, 0
  )

  const handleContentClick = (url: string, title: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {course.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {course.course_code}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {course.teacher_name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Enrolled
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {course.enrollment && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{course.enrollment.progress_percentage || 0}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.enrollment.progress_percentage || 0}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {/* Course Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{topics.length} Topics</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{totalContent} Items</span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>{studyResources.length} Study Resources</span>
                </div>
              </div>

              {/* Topics Section */}
              {topics.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Topics
                  </h4>
                  <div className="space-y-2">
                    {topics.map((topic) => (
                      <div key={topic.id} className="border rounded-lg p-3 bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{topic.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            #{topic.order_index}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          {/* Slides */}
                          {topic.slides.map((slide) => (
                            <Button
                              key={slide.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleContentClick(slide.google_drive_url, slide.title)}
                              className="w-full justify-start text-left h-auto p-2"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <FileText className="h-3 w-3 text-blue-600" />
                                <span className="text-xs truncate flex-1">
                                  {slide.title}
                                </span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
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
                              className="w-full justify-start text-left h-auto p-2"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <Video className="h-3 w-3 text-red-600" />
                                <span className="text-xs truncate flex-1">
                                  {video.title}
                                </span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
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
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Study Resources
                  </h4>
                  <div className="grid gap-2">
                    {studyResources.map((resource) => (
                      <Button
                        key={resource.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleContentClick(resource.content_url, resource.title)}
                        className="w-full justify-start text-left h-auto p-3"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            {resource.is_downloadable ? (
                              <Download className="h-4 w-4 text-primary" />
                            ) : (
                              <ExternalLink className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{resource.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {resource.type}
                              </Badge>
                              {resource.exam_type && (
                                <Badge variant="outline" className="text-xs">
                                  {resource.exam_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {topics.length === 0 && studyResources.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No content available yet</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  BookOpen, 
  Play, 
  FileText, 
  Eye, 
  Lock,
  ChevronRight,
  Clock,
  Users,
  Star,
  Heart
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Course {
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

interface Topic {
  id: string
  title: string
  description?: string
  order_index: number
  slides: Array<{
    id: string
    title: string
    google_drive_url: string
  }>
  videos: Array<{
    id: string
    title: string
    youtube_url: string
  }>
}

interface StudyTool {
  id: string
  title: string
  type: string
  content_url?: string
  description?: string
}

interface CourseContentPreviewProps {
  course: Course
  isEnrolled: boolean
  onEnroll: (courseId: string) => void
  onContentSelect: (content: any) => void
  className?: string
}

export function CourseContentPreview({
  course,
  isEnrolled,
  onEnroll,
  onContentSelect,
  className
}: CourseContentPreviewProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [studyTools, setStudyTools] = useState<StudyTool[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const fetchCourseContent = async () => {
    if (loading || topics.length > 0) return

    setLoading(true)
    try {
      // Fetch topics with slides and videos
      const topicsResponse = await fetch(`/api/courses/${course.id}/topics`)
      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json()
        setTopics(topicsData)
      }

      // Fetch study tools
      const studyToolsResponse = await fetch(`/api/courses/${course.id}/study-tools`)
      if (studyToolsResponse.ok) {
        const studyToolsData = await studyToolsResponse.json()
        setStudyTools(studyToolsData)
      }
    } catch (error) {
      console.error('Failed to fetch course content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewClick = () => {
    if (!expanded) {
      setExpanded(true)
      fetchCourseContent()
    } else {
      setExpanded(false)
    }
  }

  const handleContentClick = (content: any) => {
    if (isEnrolled) {
      onContentSelect(content)
    } else {
      // Show enrollment prompt or preview limited content
      onEnroll(course.id)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'slide':
        return <FileText className="h-4 w-4" />
      case 'video':
        return <Play className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const totalContent = topics.reduce((acc, topic) => 
    acc + topic.slides.length + topic.videos.length, 0
  ) + studyTools.length

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {course.title}
              </CardTitle>
              {course.is_highlighted && (
                <Star className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {course.course_code}
              </Badge>
              {course.credits && (
                <Badge variant="outline" className="text-xs">
                  {course.credits} Credits
                </Badge>
              )}
            </div>

            <CardDescription className="text-sm">
              {course.teacher_name}
            </CardDescription>
          </div>

          <div className="flex flex-col items-end gap-2">
            {isEnrolled && (
              <Badge variant="default" className="text-xs">
                <Heart className="h-3 w-3 mr-1" />
                Enrolled
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewClick}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              {expanded ? 'Hide' : 'Preview'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="space-y-4">
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
                {course.semester && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.semester.section}</span>
                  </div>
                )}
              </div>

              {/* Content Preview */}
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {/* Topics */}
                  {topics.slice(0, 3).map((topic, index) => (
                    <div key={topic.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {topic.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          Topic {index + 1}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        {/* Preview slides */}
                        {topic.slides.slice(0, 2).map((slide) => (
                          <Button
                            key={slide.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContentClick({
                              type: 'slide',
                              title: slide.title,
                              url: slide.google_drive_url,
                              id: slide.id,
                              topicTitle: topic.title,
                              courseTitle: course.title,
                              courseId: course.id
                            })}
                            className="w-full justify-start text-left h-auto p-2"
                            disabled={!isEnrolled}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <FileText className="h-3 w-3 text-blue-600" />
                              <span className="text-xs truncate flex-1">
                                {slide.title}
                              </span>
                              {!isEnrolled && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </Button>
                        ))}

                        {/* Preview videos */}
                        {topic.videos.slice(0, 2).map((video) => (
                          <Button
                            key={video.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContentClick({
                              type: 'video',
                              title: video.title,
                              url: video.youtube_url,
                              id: video.id,
                              topicTitle: topic.title,
                              courseTitle: course.title,
                              courseId: course.id
                            })}
                            className="w-full justify-start text-left h-auto p-2"
                            disabled={!isEnrolled}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Play className="h-3 w-3 text-red-600" />
                              <span className="text-xs truncate flex-1">
                                {video.title}
                              </span>
                              {!isEnrolled && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Study Tools Preview */}
                  {studyTools.length > 0 && (
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Study Resources</h4>
                      <div className="space-y-1">
                        {studyTools.slice(0, 3).map((tool) => (
                          <Button
                            key={tool.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContentClick({
                              type: 'study-tool',
                              title: tool.title,
                              url: tool.content_url || '#',
                              id: tool.id,
                              courseTitle: course.title,
                              courseId: course.id
                            })}
                            className="w-full justify-start text-left h-auto p-2"
                            disabled={!isEnrolled}
                          >
                            <div className="flex items-center gap-2 w-full">
                              {getContentIcon(tool.type)}
                              <span className="text-xs truncate flex-1">
                                {tool.title}
                              </span>
                              {!isEnrolled && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show more indicator */}
                  {topics.length > 3 && (
                    <div className="text-center py-2">
                      <span className="text-xs text-muted-foreground">
                        +{topics.length - 3} more topics
                      </span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Action */}
              {!isEnrolled && (
                <div className="pt-3 border-t">
                  <Button
                    onClick={() => onEnroll(course.id)}
                    className="w-full"
                    size="sm"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Enroll to Access Full Content
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

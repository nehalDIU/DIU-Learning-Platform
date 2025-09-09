"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useCourseEnrollmentContext } from "@/contexts/CourseEnrollmentContext"
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  Video,
  Download,
  GraduationCap,
  Loader2,
  Heart,
  User
} from "lucide-react"

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
  description?: string
}

interface CourseData {
  topics: Topic[]
  studyResources: StudyResource[]
  isLoading: boolean
}

interface EnrolledCourseSidebarProps {
  onContentSelect: (content: any) => void
  selectedContentId?: string
}

export function EnrolledCourseSidebar({ onContentSelect, selectedContentId }: EnrolledCourseSidebarProps) {
  const { enrolledCourses, loading: enrollmentLoading } = useCourseEnrollmentContext()
  const isMobile = useIsMobile()
  
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [expandedStudyTools, setExpandedStudyTools] = useState<Set<string>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [expandedTopicItems, setExpandedTopicItems] = useState<Set<string>>(new Set())
  const [courseData, setCourseData] = useState<{ [courseId: string]: CourseData }>({})

  const fetchCourseData = useCallback(async (courseId: string) => {
    if (courseData[courseId]) return

    setCourseData(prev => ({
      ...prev,
      [courseId]: { topics: [], studyResources: [], isLoading: true }
    }))

    try {
      const [topicsResponse, studyResourcesResponse] = await Promise.all([
        fetch(`/api/courses/${courseId}/topics`),
        fetch(`/api/courses/${courseId}/study-tools`)
      ])

      if (!topicsResponse.ok || !studyResourcesResponse.ok) {
        throw new Error('Failed to fetch course content')
      }

      const [topicsData, studyResourcesData] = await Promise.all([
        topicsResponse.json(),
        studyResourcesResponse.json()
      ])

      setCourseData(prev => ({
        ...prev,
        [courseId]: {
          topics: topicsData || [],
          studyResources: studyResourcesData || [],
          isLoading: false
        }
      }))
    } catch (error) {
      console.error('Error fetching course data:', error)
      setCourseData(prev => ({
        ...prev,
        [courseId]: { topics: [], studyResources: [], isLoading: false }
      }))
    }
  }, [courseData])

  const toggleCourse = useCallback((courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
        setTimeout(() => fetchCourseData(courseId), 0)
      }
      return newSet
    })
  }, [fetchCourseData])

  const toggleStudyTools = useCallback((courseId: string) => {
    setExpandedStudyTools(prev => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }, [])

  const toggleTopics = useCallback((courseId: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }, [])

  const toggleTopicItem = useCallback((topicId: string) => {
    setExpandedTopicItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(topicId)) {
        newSet.delete(topicId)
      } else {
        newSet.add(topicId)
      }
      return newSet
    })
  }, [])

  const handleContentClick = useCallback((
    type: string,
    title: string,
    url: string,
    id: string,
    topicTitle?: string,
    courseTitle?: string,
    description?: string
  ) => {
    const content = {
      type,
      title,
      url,
      id,
      topicTitle,
      courseTitle,
      description
    }
    onContentSelect(content)
  }, [onContentSelect])

  const getStudyToolIcon = (type: string) => {
    switch (type) {
      case 'previous_questions':
        return <FileText className="h-3 w-3 text-orange-600" />
      case 'exam_note':
        return <BookOpen className="h-3 w-3 text-blue-600" />
      case 'syllabus':
        return <GraduationCap className="h-3 w-3 text-green-600" />
      default:
        return <FileText className="h-3 w-3 text-gray-600" />
    }
  }

  const getStudyToolLabel = (type: string) => {
    switch (type) {
      case 'previous_questions':
        return 'Previous Questions'
      case 'exam_note':
        return 'Exam Notes'
      case 'syllabus':
        return 'Syllabus'
      default:
        return 'Study Material'
    }
  }

  if (enrollmentLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">No enrolled courses</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/courses'}
          className="text-xs"
        >
          <BookOpen className="h-3 w-3 mr-1" />
          Browse Courses
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className={`${isMobile ? 'p-3 space-y-2' : 'p-4 space-y-2'}`}>
          {enrolledCourses.map((course) => (
            <EnrolledCourseItem
              key={course.id}
              course={course}
              courseData={courseData[course.id]}
              expandedCourses={expandedCourses}
              expandedStudyTools={expandedStudyTools}
              expandedTopics={expandedTopics}
              expandedTopicItems={expandedTopicItems}
              onToggleCourse={toggleCourse}
              onToggleStudyTools={toggleStudyTools}
              onToggleTopics={toggleTopics}
              onToggleTopicItem={toggleTopicItem}
              onContentClick={handleContentClick}
              getStudyToolIcon={getStudyToolIcon}
              getStudyToolLabel={getStudyToolLabel}
              selectedContentId={selectedContentId}
              isMobile={isMobile}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// Memoized EnrolledCourseItem component
const EnrolledCourseItem = React.memo(({
  course,
  courseData,
  expandedCourses,
  expandedStudyTools,
  expandedTopics,
  expandedTopicItems,
  onToggleCourse,
  onToggleStudyTools,
  onToggleTopics,
  onToggleTopicItem,
  onContentClick,
  getStudyToolIcon,
  getStudyToolLabel,
  selectedContentId,
  isMobile = false
}: {
  course: any
  courseData?: CourseData
  expandedCourses: Set<string>
  expandedStudyTools: Set<string>
  expandedTopics: Set<string>
  expandedTopicItems: Set<string>
  onToggleCourse: (id: string) => void
  onToggleStudyTools: (id: string) => void
  onToggleTopics: (id: string) => void
  onToggleTopicItem: (id: string) => void
  onContentClick: (type: string, title: string, url: string, id: string, topicTitle?: string, courseTitle?: string, description?: string) => void
  getStudyToolIcon: (type: string) => React.ReactNode
  getStudyToolLabel: (type: string) => string
  selectedContentId?: string
  isMobile?: boolean
}) => {
  return (
    <div className="space-y-2">
      {/* Course Header - Compact Design */}
      <div className={`bg-card/50 hover:bg-card border border-border/30 hover:border-border/60 rounded-lg transition-all duration-200 overflow-hidden ${isMobile ? 'mobile-course-item' : ''}`}>
        <Button
          variant="ghost"
          className={`w-full justify-start text-left p-0 h-auto hover:bg-transparent ${isMobile ? 'touch-optimized-button' : ''}`}
          onClick={() => onToggleCourse(course.id)}
        >
          <div className={`flex items-center gap-3 w-full min-w-0 ${isMobile ? 'p-3' : 'p-4'}`}>
            {/* Chevron Icon */}
            <div className="flex-shrink-0">
              {expandedCourses.has(course.id) ? (
                <ChevronDown className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} text-muted-foreground`} />
              ) : (
                <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} text-muted-foreground`} />
              )}
            </div>

            {/* Course Content - Compact Layout */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="space-y-1">
                <h4 className="font-medium text-sm text-foreground leading-tight truncate">
                  {course.title}
                </h4>
                <div className="text-xs text-muted-foreground">
                  ({course.course_code})
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {course.teacher_name}
                </div>
              </div>
            </div>

            {/* Enrolled Badge */}
            <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200 hover:bg-green-100 flex-shrink-0">
              <Heart className="h-3 w-3 mr-1" />
              Enrolled
            </Badge>
          </div>
        </Button>
      </div>

      {/* Course Content */}
      {expandedCourses.has(course.id) && courseData && !courseData.isLoading && (
        <div className="ml-6 space-y-3 mt-4">
          {/* Study Resources Section */}
          {courseData.studyResources.length > 0 && (
            <div>
              <Button
                variant="ghost"
                className="w-full justify-start text-left p-3 h-auto hover:bg-accent/50 rounded-lg border border-border/20"
                onClick={() => onToggleStudyTools(course.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedStudyTools.has(course.id) ? (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground flex-1">
                    Study Resources
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {courseData.studyResources.length}
                  </Badge>
                </div>
              </Button>

              {expandedStudyTools.has(course.id) && (
                <div className="ml-8 space-y-2 mt-2">
                  {courseData.studyResources.map((resource) => {
                    const isSelected = selectedContentId === resource.id
                    return (
                      <Button
                        key={resource.id}
                        variant="ghost"
                        className={`w-full justify-start text-left px-2 py-1.5 h-auto rounded transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => {
                          if (resource.type === "syllabus") {
                            onContentClick("syllabus", resource.title, `#syllabus-${resource.id}`, resource.id, undefined, course.title, resource.description)
                          } else if (resource.content_url) {
                            onContentClick("study-tool", resource.title, resource.content_url, resource.id, undefined, course.title)
                          }
                        }}
                        disabled={resource.type !== "syllabus" && !resource.content_url}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {getStudyToolIcon(resource.type)}
                          <span className={`text-xs truncate flex-1 ${
                            isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}>
                            {resource.title}
                          </span>
                          {resource.is_downloadable && (
                            <Download className="h-3 w-3 text-muted-foreground" />
                          )}
                          {isSelected && (
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Topics Section */}
          {courseData.topics.length > 0 && (
            <div>
              <Button
                variant="ghost"
                className="w-full justify-start text-left p-3 h-auto hover:bg-accent/50 rounded-md"
                onClick={() => onToggleTopics(course.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedTopics.has(course.id) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground flex-1">
                    Topics
                  </span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {courseData.topics.length}
                  </span>
                </div>
              </Button>

              {expandedTopics.has(course.id) && (
                <div className="ml-4 space-y-1 mt-2">
                  {courseData.topics.map((topic, index) => (
                    <div key={topic.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left p-3 h-auto rounded-md hover:bg-accent/50"
                        onClick={() => onToggleTopicItem(topic.id)}
                      >
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {expandedTopicItems.has(topic.id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="text-sm text-foreground truncate">
                              {topic.title}
                            </span>
                          </div>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full flex-shrink-0">
                            #{index}
                          </span>
                        </div>
                      </Button>

                      {expandedTopicItems.has(topic.id) && (
                        <div className="ml-4 space-y-1">
                          {/* Slides */}
                          {topic.slides.map((slide) => {
                            const isSelected = selectedContentId === slide.id
                            return (
                              <Button
                                key={slide.id}
                                variant="ghost"
                                className={`w-full justify-start text-left px-2 py-1 h-auto rounded transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-accent/30"
                                }`}
                                onClick={() => onContentClick("slide", slide.title, slide.google_drive_url, slide.id, topic.title, course.title)}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <FileText className="h-3 w-3 text-blue-600" />
                                  <span className={`text-xs truncate flex-1 ${
                                    isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                                  }`}>
                                    {slide.title}
                                  </span>
                                  {isSelected && (
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                                  )}
                                </div>
                              </Button>
                            )
                          })}

                          {/* Videos */}
                          {topic.videos.map((video) => {
                            const isSelected = selectedContentId === video.id
                            return (
                              <Button
                                key={video.id}
                                variant="ghost"
                                className={`w-full justify-start text-left px-2 py-1 h-auto rounded transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-accent/30"
                                }`}
                                onClick={() => onContentClick("video", video.title, video.youtube_url, video.id, topic.title, course.title)}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <Video className="h-3 w-3 text-red-600" />
                                  <span className={`text-xs truncate flex-1 ${
                                    isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                                  }`}>
                                    {video.title}
                                  </span>
                                  {isSelected && (
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                                  )}
                                </div>
                              </Button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

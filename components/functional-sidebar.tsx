"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  ChevronDown, ChevronRight, FileText, Play, BookOpen, Users, Loader2, AlertCircle,
  GraduationCap, ClipboardList, BarChart3, PenTool, FlaskConical, Library, Star, Share2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"
import { ProfessionalTopicTitle } from "@/components/ui/professional-topic-title"
import { useIsMobile } from "@/components/ui/use-mobile"
import { ShareButton } from "@/components/share-button"
import { generateShareUrl } from "@/lib/share-utils"
import { useSectionContext } from "@/contexts/SectionContext"
import React from "react"

type Semester = Database["public"]["Tables"]["semesters"]["Row"]
type Course = Database["public"]["Tables"]["courses"]["Row"]
type Topic = Database["public"]["Tables"]["topics"]["Row"]
type Slide = Database["public"]["Tables"]["slides"]["Row"]
type Video = Database["public"]["Tables"]["videos"]["Row"]
type StudyTool = Database["public"]["Tables"]["study_tools"]["Row"]

// Smart text truncation utility for professional display
const smartTruncate = (text: string, maxLength: number = 45): string => {
  if (text.length <= maxLength) return text

  // Try to find a good breaking point (space, dash, colon, period)
  const breakPoints = [' ', '-', ':', '.', ',']
  let bestBreak = -1

  // Look for break points in the latter half of the allowed length
  for (let i = Math.floor(maxLength * 0.6); i < maxLength; i++) {
    if (breakPoints.includes(text[i])) {
      bestBreak = i
    }
  }

  // If we found a good break point, use it
  if (bestBreak > 0) {
    return text.substring(0, bestBreak) + '...'
  }

  // Otherwise, truncate at maxLength and add ellipsis
  return text.substring(0, maxLength - 3) + '...'
}

// Professional topic title formatter
const formatTopicTitle = (index: number, title: string, maxLength: number = 42): string => {
  const prefix = `${index + 1}. `
  const availableLength = maxLength - prefix.length

  if (title.length <= availableLength) {
    return `${prefix}${title}`
  }

  return `${prefix}${smartTruncate(title, availableLength)}`
}

interface ContentItem {
  type: "slide" | "video" | "document" | "syllabus" | "study-tool"
  title: string
  url: string
  id: string
  topicTitle?: string
  courseTitle?: string
  description?: string
  courseCode?: string
  teacherName?: string
  semesterInfo?: {
    id: string
    title: string
    section: string
    is_active: boolean
  }
}

interface FunctionalSidebarProps {
  onContentSelect: (content: ContentItem) => void
  selectedContentId?: string
}

// Cache for storing fetched data
const dataCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to get cached data or fetch new data
const getCachedData = async (key: string, fetchFn: () => Promise<any>): Promise<any> => {
  const cached = dataCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const data = await fetchFn()
  dataCache.set(key, { data, timestamp: Date.now() })
  return data
}

export function FunctionalSidebar({ onContentSelect, selectedContentId }: FunctionalSidebarProps) {
  const [semesters, setSemesters] = useState([])
  const [selectedSemester, setSelectedSemester] = useState("")
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get section context for filtering
  const { selectedSection, isAuthenticated, selectedBatch: contextBatch, batchSemesters, isBatchLoading } = useSectionContext()

  // Expansion states
  const [expandedCourses, setExpandedCourses] = useState(new Set())
  const [expandedStudyTools, setExpandedStudyTools] = useState(new Set())
  const [expandedTopics, setExpandedTopics] = useState(new Set())
  const [expandedTopicItems, setExpandedTopicItems] = useState(new Set())

  // Course data cache with loading states
  const [courseData, setCourseData] = useState({})

  // Mobile-specific state and functionality
  const isMobile = useIsMobile()
  const [touchStartY, setTouchStartY] = useState(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [compactMode, setCompactMode] = useState(false)

  // Fetch and filter semesters based on context
  useEffect(() => {
    fetchSemesters()
  }, [isAuthenticated, selectedSection, contextBatch])

  // Fetch courses when semester changes
  useEffect(() => {
    if (selectedSemester) {
      fetchCourses(selectedSemester)
    }
  }, [selectedSemester])

  // Auto-expand sidebar sections when content is selected from shareable URL
  useEffect(() => {
    if (!selectedContentId || !courses.length) return

    console.log("🔍 Auto-expanding sidebar for selected content:", selectedContentId)

    // Find the course and topic that contains the selected content
    let foundCourse = null
    let foundTopic = null
    let contentType = null

    for (const course of courses) {
      const courseDataForCourse = courseData[course.id]
      if (!courseDataForCourse) continue

      // Check study tools
      const studyTool = courseDataForCourse.studyTools?.find(tool => tool.id === selectedContentId)
      if (studyTool) {
        foundCourse = course
        contentType = 'study-tool'
        break
      }

      // Check topics for videos and slides
      for (const topic of courseDataForCourse.topics || []) {
        const topicVideos = courseDataForCourse.videos[topic.id] || []
        const topicSlides = courseDataForCourse.slides[topic.id] || []

        const video = topicVideos.find(v => v.id === selectedContentId)
        const slide = topicSlides.find(s => s.id === selectedContentId)

        if (video || slide) {
          foundCourse = course
          foundTopic = topic
          contentType = video ? 'video' : 'slide'
          break
        }
      }

      if (foundCourse) break
    }

    if (foundCourse) {
      console.log("✅ Found content in course:", foundCourse.title, "topic:", foundTopic?.title, "type:", contentType)

      // Auto-expand the course
      setExpandedCourses(prev => new Set([...prev, foundCourse.id]))

      if (contentType === 'study-tool') {
        // Expand study tools section
        setExpandedStudyTools(prev => new Set([...prev, foundCourse.id]))
      } else if (foundTopic) {
        // Expand topics section and the specific topic
        setExpandedTopics(prev => new Set([...prev, foundCourse.id]))
        setExpandedTopicItems(prev => new Set([...prev, foundTopic.id]))
      }

      // Scroll to the selected item after a short delay to ensure DOM is updated
      setTimeout(() => {
        const selectedElement = document.querySelector(`[data-content-id="${selectedContentId}"]`)
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          console.log("📍 Scrolled to selected content item")
        }
      }, 500)
    } else {
      console.log("❌ Could not find content in sidebar:", selectedContentId)
    }
  }, [selectedContentId, courses, courseData])



  const fetchSemesters = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getCachedData("semesters", async () => {
        const { data, error } = await supabase.from("semesters").select("*").order("created_at", { ascending: false })
        if (error) throw error
        return data || []
      })

      // Filter semesters based on batch selection and user authentication
      let filteredData = data

      // First, filter by batch if a batch is selected
      if (contextBatch) {
        filteredData = data.filter(semester => {
          if (!semester.section) return false

          // Extract batch number from section format (e.g., "63_G" -> "63")
          const [semesterBatch] = semester.section.split('_')
          return semesterBatch === contextBatch
        })
      }

      // Then, apply additional section filtering if user is authenticated and has a specific section
      if (isAuthenticated && selectedSection) {
        filteredData = filteredData.filter(semester =>
          semester.section === selectedSection.section ||
          semester.id === selectedSection.id
        )
      }

      setSemesters(filteredData)

      // Auto-select the user's section if available, otherwise first active semester
      if (filteredData && filteredData.length > 0) {
        let semesterToSelect

        if (isAuthenticated && selectedSection) {
          // Try to find the exact section match first
          semesterToSelect = filteredData.find(semester => semester.id === selectedSection.id)
          if (!semesterToSelect) {
            // Fallback to section string match
            semesterToSelect = filteredData.find(semester => semester.section === selectedSection.section)
          }
        }

        // If no section-specific match, use first active or first semester
        if (!semesterToSelect) {
          const activeSemester = filteredData.find(semester => semester.is_active === true)
          semesterToSelect = activeSemester || filteredData[0]
        }

        setSelectedSemester(semesterToSelect.id)
      }
    } catch (err) {
      console.error("Error fetching semesters:", err)
      setError("Failed to load semesters")
    } finally {
      setIsLoading(false)
    }
  }



  const fetchCourses = async (semesterId: string) => {
    try {
      setError(null)

      const data = await getCachedData(`courses-${semesterId}`, async () => {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("semester_id", semesterId)
          .order("is_highlighted", { ascending: false }) // Highlighted courses first
          .order("created_at", { ascending: true })
        if (error) throw error
        return data || []
      })

      setCourses(data)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError("Failed to load courses")
    }
  }

  const fetchCourseData = async (courseId: string) => {
    if (courseData[courseId] && !courseData[courseId].isLoading) return

    // Set loading state
    setCourseData((prev) => ({
      ...prev,
      [courseId]: {
        topics: [],
        studyTools: [],
        slides: {},
        videos: {},
        isLoading: true,
      },
    }))

    try {
      // Use optimized single query to fetch all course data
      const data = await getCachedData(`course-data-${courseId}`, async () => {
        // Fetch all data in parallel
        const [topicsResult, studyToolsResult] = await Promise.all([
          supabase
            .from("topics")
            .select(`
              *,
              slides(*),
              videos(*)
            `)
            .eq("course_id", courseId)
            .order("order_index", { ascending: true }),
          supabase.from("study_tools").select("*").eq("course_id", courseId),
        ])

        if (topicsResult.error) throw topicsResult.error
        if (studyToolsResult.error) throw studyToolsResult.error

        // Organize slides and videos by topic
        const slides = {}
        const videos = {}

        topicsResult.data?.forEach((topic) => {
          slides[topic.id] = (topic.slides || []).sort((a, b) => a.order_index - b.order_index)
          videos[topic.id] = (topic.videos || []).sort((a, b) => a.order_index - b.order_index)
        })

        return {
          topics: topicsResult.data || [],
          studyTools: studyToolsResult.data || [],
          slides,
          videos,
        }
      })

      setCourseData((prev) => ({
        ...prev,
        [courseId]: {
          ...data,
          isLoading: false,
        },
      }))
    } catch (err) {
      console.error("Error fetching course data:", err)
      setError("Failed to load course content")
      setCourseData((prev) => ({
        ...prev,
        [courseId]: {
          topics: [],
          studyTools: [],
          slides: {},
          videos: {},
          isLoading: false,
        },
      }))
    }
  }

  // Optimized toggle functions with accordion behavior
  // Accordion: Only one course can be expanded at a time
  const toggleCourse = useCallback((courseId: string) => {
    setExpandedCourses((prev) => {
      const newSet = new Set()
      // If the clicked course is already expanded, close it (empty set)
      // If it's not expanded, open only this course (set with only this course)
      if (!prev.has(courseId)) {
        newSet.add(courseId)
        // Only fetch data when expanding
        setTimeout(() => fetchCourseData(courseId), 0)
      }
      return newSet
    })

    // When switching courses, close all study tools and topics sections
    setExpandedStudyTools(new Set())
    setExpandedTopics(new Set())
    setExpandedTopicItems(new Set())
  }, [])

  const toggleStudyTools = useCallback((courseId: string) => {
    setExpandedStudyTools((prev) => {
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
    setExpandedTopics((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }, [])

  // Accordion: Only one topic can be expanded at a time
  const toggleTopicItem = useCallback((topicId: string) => {
    setExpandedTopicItems((prev) => {
      const newSet = new Set()
      // If the clicked topic is already expanded, close it (empty set)
      // If it's not expanded, open only this topic (set with only this topic)
      if (!prev.has(topicId)) {
        newSet.add(topicId)
      }
      return newSet
    })
  }, [])

  // Content selection handlers
  const handleContentClick = useCallback(
    (
      type: "slide" | "video" | "document" | "syllabus" | "study-tool",
      title: string,
      url: string,
      id: string,
      topicTitle?: string,
      courseTitle?: string,
      description?: string,
    ) => {
      onContentSelect({
        type,
        title,
        url,
        id,
        topicTitle,
        courseTitle,
        description,
      })
    },
    [onContentSelect],
  )

  // Memoized utility functions
  const getStudyToolIcon = useCallback((type: string) => {
    switch (type) {
      case "previous_questions":
        return <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      case "exam_note":
      case "exam_notes":
        return <BookOpen className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
      case "syllabus":
        return <GraduationCap className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
      case "mark_distribution":
        return <BarChart3 className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
      case "assignment":
        return <PenTool className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
      case "lab_manual":
        return <FlaskConical className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
      case "reference_book":
        return <Library className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
      default:
        return <FileText className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
    }
  }, [])

  const getStudyToolLabel = useCallback((type: string) => {
    switch (type) {
      case "previous_questions":
        return "Previous Questions"
      case "exam_note":
      case "exam_notes":
        return "Exam Notes"
      case "syllabus":
        return "Syllabus"
      case "mark_distribution":
        return "Mark Distribution"
      case "assignment":
        return "Assignment"
      case "lab_manual":
        return "Lab Manual"
      case "reference_book":
        return "Reference Book"
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }, [])

  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    return courses
  }, [courses])

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full flex flex-col bg-background ${isMobile ? 'mobile-scroll-container' : ''}`}>
      {/* Header - Clean & Simple */}
      <div className={`${isMobile ? 'px-3 py-3 bg-background border-b border-border/30' : 'p-4 border-b border-border'}`}>
        {/* Mobile: Clean & Simple header */}
        {isMobile ? (
          <div className="space-y-3">
            {/* Section Indicator - Minimal */}
            {isAuthenticated && selectedSection && (
              <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    Section {selectedSection.section}
                  </span>
                </div>
              </div>
            )}

            {/* Clean Semester Selection */}
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="h-11 bg-card border-border/50 text-foreground rounded-lg">
                <SelectValue placeholder="Select Semester">
                  {selectedSemester && (() => {
                    const selectedSem = semesters.find(s => s.id === selectedSemester)
                    return selectedSem ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-medium truncate">
                          {selectedSem.title}
                        </span>
                        {(selectedSem.is_active ?? true) && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    ) : null
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50 rounded-lg">
                {semesters.map((semester) => (
                  <SelectItem
                    key={semester.id}
                    value={semester.id}
                    className="text-foreground hover:bg-accent/50 py-3 px-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">
                        {semester.title}
                      </span>
                      {(semester.is_active ?? true) && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          /* Desktop Header */
          <div>
            {/* Section Indicator for Desktop */}
            {isAuthenticated && selectedSection && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">
                    Your Section: {selectedSection.section}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Showing content for {selectedSection.title}
                </p>
              </div>
            )}

            {/* Desktop Semester Selection */}
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="bg-card border-border text-foreground h-11">
                <SelectValue placeholder="Choose your semester">
                  {selectedSemester && (() => {
                    const selectedSem = semesters.find(s => s.id === selectedSemester)
                    return selectedSem ? (
                      <div className="flex items-center gap-2">
                        <span>{selectedSem.title} {selectedSem.section && `(${selectedSem.section})`}</span>
                        {(selectedSem.is_active ?? true) && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    ) : null
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {semesters.map((semester) => (
                  <SelectItem
                    key={semester.id}
                    value={semester.id}
                    className="text-foreground hover:bg-accent"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {semester.title} {semester.section && `(${semester.section})`}
                      </span>
                      {(semester.is_active ?? true) && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4">
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Course List */}
      <ScrollArea className={`flex-1 ${isMobile ? 'mobile-scroll-container' : ''}`}>
        <div
          className={`${isMobile ? 'px-3 py-2 space-y-1.5' : 'p-4 space-y-3'}`}
          onTouchStart={(e) => {
            if (isMobile) {
              setTouchStartY(e.touches[0].clientY)
              setIsScrolling(false)
            }
          }}
          onTouchMove={(e) => {
            if (isMobile && touchStartY !== null) {
              const deltaY = Math.abs(e.touches[0].clientY - touchStartY)
              if (deltaY > 10) {
                setIsScrolling(true)
              }
            }
          }}
          onTouchEnd={() => {
            if (isMobile) {
              setTouchStartY(null)
              setTimeout(() => setIsScrolling(false), 100)
            }
          }}
        >
          {filteredCourses.length === 0 ? (
            <div className={`text-center ${isMobile ? 'py-6' : 'py-8 sm:py-12'}`}>
              <BookOpen className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10 sm:h-12 sm:w-12'} text-muted-foreground mx-auto mb-4`} />
              <p className={`${isMobile ? 'text-sm' : 'text-sm sm:text-base'} text-muted-foreground`}>
                No courses available
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">Check your semester selection</p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <CourseItem
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
                compactMode={compactMode}
                isScrolling={isScrolling}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// Memoized CourseItem component to prevent unnecessary re-renders
const CourseItem = React.memo(
  ({
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
    isMobile = false,
    compactMode = false,
    isScrolling = false,
  }: {
    course: Course
    courseData?: any
    expandedCourses: Set<string>
    expandedStudyTools: Set<string>
    expandedTopics: Set<string>
    expandedTopicItems: Set<string>
    onToggleCourse: (id: string) => void
    onToggleStudyTools: (id: string) => void
    onToggleTopics: (id: string) => void
    onToggleTopicItem: (id: string) => void
    onContentClick: (
      type: any,
      title: string,
      url: string,
      id: string,
      topicTitle?: string,
      courseTitle?: string,
      description?: string,
    ) => void
    getStudyToolIcon: (type: string) => React.ReactNode
    getStudyToolLabel: (type: string) => string
    selectedContentId?: string
    isMobile?: boolean
    compactMode?: boolean
    isScrolling?: boolean
  }) => {
    return (
      <div className={`${isMobile ? 'space-y-1' : 'space-y-2'}`}>
        {/* Course Header - Clean & Simple */}
        <div className={`bg-card border border-border/30 rounded-lg overflow-hidden ${isMobile ? 'active:bg-accent/30' : ''}`}>
          <Button
            variant="ghost"
            className={`w-full justify-start text-left p-0 h-auto hover:bg-transparent`}
            onClick={() => !isScrolling && onToggleCourse(course.id)}
          >
            <div className={`flex items-center gap-2 w-full min-w-0 ${isMobile ? 'p-2' : 'p-4'}`}>
              {/* Chevron Icon - Simple */}
              <div className="flex-shrink-0">
                {expandedCourses.has(course.id) ? (
                  <ChevronDown className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
                ) : (
                  <ChevronRight className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
                )}
              </div>

              {/* Course Content - Clean Layout */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <h4 className="font-semibold text-sm text-foreground truncate leading-tight">
                  {course.title}
                </h4>
                <div className="text-xs text-muted-foreground truncate mt-0.5 leading-tight">
                  {course.course_code} • {course.teacher_name}
                </div>
              </div>

              {/* Highlighted Indicator */}
              {course.is_highlighted && (
                <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
              )}
            </div>
          </Button>
        </div>

        {/* Course Content */}
        {expandedCourses.has(course.id) && courseData && !courseData.isLoading && (
          <div className={`${isMobile ? 'ml-2 space-y-0.5' : 'ml-4 space-y-2'}`}>
            {/* Study Tools Section */}
            {courseData.studyTools.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left ${isMobile ? 'p-1.5' : 'p-3'} h-auto hover:bg-accent/50 rounded-lg`}
                  onClick={() => onToggleStudyTools(course.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedStudyTools.has(course.id) ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span className={`${isMobile ? 'text-sm' : 'text-sm'} text-foreground flex-1 font-semibold leading-tight`}>
                      Study Resources
                    </span>
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                      {courseData.studyTools.length}
                    </span>
                  </div>
                </Button>

                {expandedStudyTools.has(course.id) && (
                  <div className={`${isMobile ? 'ml-2.5 mt-0.5 space-y-0.5' : 'ml-4 space-y-1'}`}>
                    {courseData.studyTools.map((tool: StudyTool) => {
                      const isSelected = selectedContentId === tool.id
                      return (
                        <Button
                          key={tool.id}
                          variant="ghost"
                          data-content-id={tool.id}
                          className={`w-full justify-start text-left ${isMobile ? 'p-1.5' : 'p-2'} h-auto rounded-lg ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent/30"
                          }`}
                          onClick={() => {
                            if (tool.type === "syllabus") {
                              onContentClick("syllabus", tool.title, `#syllabus-${tool.id}`, tool.id, undefined, course.title, tool.description)
                            } else if (tool.content_url) {
                              onContentClick("study-tool", tool.title, tool.content_url, tool.id, undefined, course.title)
                            }
                          }}
                          disabled={tool.type !== "syllabus" && !tool.content_url}
                        >
                          <div className="flex items-center gap-2 w-full">
                            {getStudyToolIcon(tool.type)}
                            <span className={`text-sm truncate flex-1 leading-tight ${
                              isSelected ? "text-foreground font-semibold" : "text-muted-foreground font-medium"
                            }`}>
                              {tool.title}
                            </span>
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
              <div className="min-w-0">
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left ${isMobile ? 'p-1.5' : 'p-3'} h-auto hover:bg-accent/50 rounded-lg`}
                  onClick={() => !isScrolling && onToggleTopics(course.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedTopics.has(course.id) ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className={`${isMobile ? 'text-sm' : 'text-sm'} text-foreground flex-1 font-semibold leading-tight`}>Topics</span>
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                      {courseData.topics.length}
                    </span>
                  </div>
                </Button>

                {expandedTopics.has(course.id) && (
                  <div className={`${isMobile ? 'ml-2.5 space-y-0.5 mt-0.5' : 'ml-4 space-y-1'} min-w-0`}>
                    {courseData.topics.map((topic: Topic, index: number) => {
                      const topicSlides = courseData.slides[topic.id] || []
                      const topicVideos = courseData.videos[topic.id] || []

                      return (
                        <div key={topic.id} className={isMobile ? 'mobile-topic-item' : ''}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start text-left ${isMobile ? 'p-1.5 hover:bg-transparent' : 'p-3 hover:bg-accent/50 rounded-md'} h-auto min-w-0`}
                            onClick={() => !isScrolling && onToggleTopicItem(topic.id)}
                          >
                            <div className="flex items-center w-full min-w-0">
                              <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} flex-1 min-w-0`}>
                                {expandedTopicItems.has(topic.id) ? (
                                  <ChevronDown className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground flex-shrink-0`} />
                                ) : (
                                  <ChevronRight className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground flex-shrink-0`} />
                                )}
                                <span className={`${isMobile ? 'text-sm' : 'text-sm'} text-foreground font-semibold truncate leading-tight`}>
                                  {topic.title}
                                </span>
                              </div>
                            </div>
                          </Button>

                          {expandedTopicItems.has(topic.id) && (
                            <div className={`${isMobile ? 'ml-3 space-y-0.5 mt-0.5' : 'ml-6 space-y-1 mt-2'}`}>
                              {/* Videos */}
                              {topicVideos.map((video: Video) => {
                                const isSelected = selectedContentId === video.id
                                return (
                                  <Button
                                    key={video.id}
                                    variant="ghost"
                                    data-content-id={video.id}
                                    className={`w-full justify-start text-left ${isMobile ? 'p-1.5' : 'p-2'} h-auto rounded-lg ${
                                      isSelected
                                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                        : "hover:bg-accent/30 text-muted-foreground"
                                    }`}
                                    onClick={() =>
                                      !isScrolling && onContentClick(
                                        "video",
                                        video.title,
                                        video.youtube_url,
                                        video.id,
                                        topic.title,
                                        course.title,
                                      )
                                    }
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <Play className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? "text-red-500" : "text-red-400"}`} />
                                      <span className={`text-sm truncate flex-1 leading-tight ${
                                        isSelected ? "font-semibold" : "font-medium"
                                      }`}>
                                        {video.title}
                                      </span>
                                    </div>
                                  </Button>
                                )
                              })}

                              {/* Slides */}
                              {topicSlides.map((slide: Slide) => {
                                const isSelected = selectedContentId === slide.id
                                return (
                                  <Button
                                    key={slide.id}
                                    variant="ghost"
                                    data-content-id={slide.id}
                                    className={`w-full justify-start text-left ${isMobile ? 'p-1.5' : 'p-2'} h-auto rounded-lg ${
                                      isSelected
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                        : "hover:bg-accent/30 text-muted-foreground"
                                    }`}
                                    onClick={() =>
                                      !isScrolling && onContentClick(
                                        "slide",
                                        slide.title,
                                        slide.google_drive_url,
                                        slide.id,
                                        topic.title,
                                        course.title,
                                      )
                                    }
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <FileText className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? "text-blue-500" : "text-blue-400"}`} />
                                      <span className={`text-sm truncate flex-1 leading-tight ${
                                        isSelected ? "font-semibold" : "font-medium"
                                      }`}>
                                        {slide.title}
                                      </span>
                                    </div>
                                  </Button>
                                )
                              })}

                              {topicSlides.length === 0 && topicVideos.length === 0 && (
                                <div className="text-sm text-muted-foreground py-4 text-center">
                                  No content available for this topic
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Empty state for course with no content */}
            {courseData.topics.length === 0 && courseData.studyTools.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">No content available for this course</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
)

CourseItem.displayName = "CourseItem"

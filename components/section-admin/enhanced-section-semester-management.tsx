"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Calendar,
  BookOpen,
  FileText,
  ClipboardList,
  Loader2,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Power,
  PowerOff,
  Save,
  X,
  GraduationCap,
  Play,
  Link,
  Upload,
  Star,
  Users,
  TrendingUp,
  AlertTriangle
} from "lucide-react"

// Enhanced interfaces for section admin semester management
interface ExamDetails {
  date?: string
  time?: string
  duration?: number // in minutes
  location?: string
  instructions?: string
  total_marks?: number
  pass_marks?: number
}

interface SemesterData {
  id?: string
  title: string
  description: string
  section: string
  has_midterm: boolean
  has_final: boolean
  midterm_details?: ExamDetails
  final_details?: ExamDetails
  start_date?: string
  end_date?: string
  default_credits?: number
  is_active?: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
  courses_count?: number
  topics_count?: number
  materials_count?: number
  study_resources_count?: number
  students_count?: number
}

interface CourseData {
  id?: string
  title: string
  course_code: string
  teacher_name: string
  teacher_email?: string
  credits?: number
  description?: string
  semester_id?: string
  is_active?: boolean
  created_by?: string
  topics: TopicData[]
  study_resources: StudyResourceData[]
}

interface TopicData {
  id?: string
  title: string
  description?: string
  course_id?: string
  order_index?: number
  estimated_duration_minutes?: number
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
  is_published?: boolean
  slides: SlideData[]
  videos: VideoData[]
}

interface SlideData {
  id?: string
  title: string
  description?: string
  google_drive_url: string
  topic_id?: string
  order_index?: number
  file_size_mb?: number
  slide_count?: number
  is_downloadable?: boolean
}

interface VideoData {
  id?: string
  title: string
  description?: string
  youtube_url: string
  topic_id?: string
  order_index?: number
  duration_minutes?: number
  video_quality?: '720p' | '1080p' | '4K'
  has_subtitles?: boolean
  language?: string
  is_published?: boolean
}

interface StudyResourceData {
  id?: string
  title: string
  description?: string
  type: 'exam_note' | 'previous_questions' | 'syllabus' | 'mark_distribution' | 'assignment' | 'lab_manual' | 'reference_book'
  content_url?: string
  course_id?: string
  exam_type?: string
  file_size_mb?: number
  file_format?: string
  academic_year?: string
  is_downloadable?: boolean
}

interface SemesterSummary extends SemesterData {
  courses_count: number
  topics_count: number
  materials_count: number
  study_resources_count: number
  students_count?: number
}

// Helper interface for form data
interface SemesterFormData {
  title: string
  description: string
  section: string
  semester_type: 'Fall' | 'Spring' | 'Summer'
  year: number
  has_midterm: boolean
  has_final: boolean
  midterm_details?: ExamDetails
  final_details?: ExamDetails
  start_date?: string
  end_date?: string
  default_credits?: number
  is_active?: boolean
}

interface AllInOneData {
  semester: SemesterFormData
  courses: CourseData[]
}

type SortField = 'title' | 'section' | 'created_at' | 'updated_at' | 'courses_count' | 'year'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'list' | 'create' | 'edit'

export function EnhancedSectionSemesterManagement() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [semesters, setSemesters] = useState<SemesterSummary[]>([])
  const [filteredSemesters, setFilteredSemesters] = useState<SemesterSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>('updated_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterSection, setFilterSection] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterYear, setFilterYear] = useState<string>("all")
  const [filterSemesterType, setFilterSemesterType] = useState<string>("all")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingSemester, setEditingSemester] = useState<string | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [expandedTopic, setExpandedTopic] = useState<{ courseIndex: number; topicIndex: number } | null>(null)
  const [expandedStudyResource, setExpandedStudyResource] = useState<{ courseIndex: number; resourceIndex: number } | null>(null)

  // Form data for create/edit
  const [formData, setFormData] = useState<AllInOneData>({
    semester: {
      title: "",
      description: "",
      section: "",
      semester_type: "Fall",
      year: new Date().getFullYear(),
      has_midterm: true,
      has_final: true,
      midterm_details: {
        date: "",
        time: "",
        duration: 120,
        location: "",
        instructions: "",
        total_marks: 100,
        pass_marks: 40
      },
      final_details: {
        date: "",
        time: "",
        duration: 180,
        location: "",
        instructions: "",
        total_marks: 100,
        pass_marks: 40
      },
      start_date: "",
      end_date: "",
      default_credits: 3,
      is_active: true
    },
    courses: []
  })

  // Load semesters data
  const loadSemesters = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/section-admin/semesters')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 401) {
          setAuthError('Authentication required. Please log in as a section admin.')
          return
        } else if (response.status === 403) {
          setAuthError('Access denied. You need section admin permissions.')
          return
        }

        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      const semesters = data.semesters || data || []
      console.log('Semesters to set:', semesters)

      // Transform the data to match the expected interface
      const transformedSemesters = semesters.map((semester: any) => {
        const yearMatch = semester.title?.match(/\d{4}/)
        return {
          ...semester,
          semester_type: semester.title?.includes('Fall') ? 'Fall' :
                        semester.title?.includes('Spring') ? 'Spring' :
                        semester.title?.includes('Summer') ? 'Summer' : 'Fall',
          year: yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear(),
          exam_type: semester.has_midterm && semester.has_final ? 'Both' :
                     semester.has_midterm ? 'Midterm' :
                     semester.has_final ? 'Final' : 'None'
        }
      })

      console.log('Transformed semesters:', transformedSemesters)
      setSemesters(transformedSemesters)

      if (!transformedSemesters || transformedSemesters.length === 0) {
        toast.info('No semesters found. Create your first semester!')
      }
    } catch (error) {
      console.error('Error loading semesters:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to load semesters: ${errorMessage}`)

      // Don't set mock data - let the error be visible
      setSemesters([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Helper function to extract semester type and year from title
  const parseSemesterTitle = (title: string) => {
    const match = title.match(/^(Fall|Spring|Summer)\s+(\d{4})/)
    return {
      type: match ? match[1] as 'Fall' | 'Spring' | 'Summer' : 'Fall',
      year: match ? parseInt(match[2]) : new Date().getFullYear(),
      displayTitle: match ? title.replace(match[0], '').replace(/^\s*-\s*/, '') : title
    }
  }

  // Delete semester function
  const handleDeleteSemester = async (semesterId: string) => {
    if (!semesterId) return

    setIsDeleting(semesterId)
    try {
      const response = await fetch(`/api/section-admin/semesters/${semesterId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      // Remove the semester from the local state
      setSemesters(prev => prev.filter(s => s.id !== semesterId))
      toast.success('Semester deleted successfully!')

    } catch (error) {
      console.error('Error deleting semester:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to delete semester: ${errorMessage}`)
    } finally {
      setIsDeleting(null)
    }
  }

  // Edit semester function
  const handleEditSemester = async (semesterId: string) => {
    if (!semesterId) return

    try {
      // Fetch the semester details
      const response = await fetch(`/api/section-admin/semesters/${semesterId}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Handle authentication errors specifically
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in to edit semesters.')
        }

        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const semesterData = await response.json()
      console.log('📊 Semester data from API:', semesterData)

      // Transform the courses data to match the form structure
      const transformedCourses = (semesterData.courses || []).map((course: any) => ({
        title: course.title || '',
        course_code: course.course_code || course.code || '',
        teacher_name: course.teacher_name || '',
        teacher_email: course.teacher_email || '',
        credits: course.credits || 3,
        description: course.description || '',
        is_active: course.is_active !== false,
        topics: (course.topics || []).map((topic: any) => ({
          title: topic.title || '',
          description: topic.description || '',
          slides: (topic.slides || []).map((slide: any) => ({
            title: slide.title || '',
            google_drive_url: slide.google_drive_url || slide.url || '',
            description: slide.description || ''
          })),
          videos: (topic.videos || []).map((video: any) => ({
            title: video.title || '',
            youtube_url: video.youtube_url || video.url || '',
            description: video.description || ''
          }))
        })),
        study_resources: (course.study_tools || course.study_resources || []).map((resource: any) => ({
          title: resource.title || '',
          type: resource.type || 'exam_note',
          content_url: resource.content_url || '',
          exam_type: resource.exam_type || 'both',
          description: resource.description || ''
        }))
      }))

      console.log('🔄 Transformed courses:', transformedCourses)

      // Validate the transformed data
      if (!Array.isArray(transformedCourses)) {
        console.error('❌ Transformed courses is not an array:', transformedCourses)
        throw new Error('Invalid course data structure')
      }

      // Transform the data to match the form structure
      const transformedData = {
        semester: {
          title: semesterData.title?.replace(/^(Fall|Spring|Summer)\s+\d{4}\s*-?\s*/, '') || '',
          description: semesterData.description || '',
          section: semesterData.section || '',
          semester_type: semesterData.title?.includes('Fall') ? 'Fall' :
                        semesterData.title?.includes('Spring') ? 'Spring' :
                        semesterData.title?.includes('Summer') ? 'Summer' : 'Fall',
          year: semesterData.title?.match(/\d{4}/)?.[0] ? parseInt(semesterData.title.match(/\d{4}/)[0]) : new Date().getFullYear(),
          has_midterm: semesterData.has_midterm || false,
          has_final: semesterData.has_final || false,
          midterm_details: semesterData.midterm_details || {
            date: '',
            time: '',
            duration: 120,
            location: '',
            instructions: '',
            total_marks: 100,
            pass_marks: 40
          },
          final_details: semesterData.final_details || {
            date: '',
            time: '',
            duration: 180,
            location: '',
            instructions: '',
            total_marks: 100,
            pass_marks: 40
          },
          start_date: semesterData.start_date || '',
          end_date: semesterData.end_date || '',
          default_credits: semesterData.default_credits || 3,
          is_active: semesterData.is_active !== false
        },
        courses: transformedCourses
      }

      setFormData(transformedData)
      setEditingSemester(semesterId)
      setViewMode('create') // Reuse the create form for editing

    } catch (error) {
      console.error('Error loading semester for edit:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Show specific message for authentication errors
      if (errorMessage.includes('Authentication required')) {
        toast.error('Please log in to edit semesters', {
          action: {
            label: 'Go to Login',
            onClick: () => window.location.href = '/login'
          }
        })
      } else {
        toast.error(`Failed to load semester: ${errorMessage}`)
      }
    }
  }

  // Filter and sort semesters
  useEffect(() => {
    let filtered = semesters.filter(semester => {
      const matchesSearch = semester.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           semester.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (semester.description || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSection = filterSection === "all" || semester.section === filterSection

      const parsed = parseSemesterTitle(semester.title)
      const matchesYear = filterYear === "all" || parsed.year.toString() === filterYear
      const matchesSemesterType = filterSemesterType === "all" || parsed.type === filterSemesterType

      const isActive = semester.is_active ?? true
      const matchesStatus = filterStatus === "all" ||
                           (filterStatus === "active" && isActive) ||
                           (filterStatus === "inactive" && !isActive)

      return matchesSearch && matchesSection && matchesYear && matchesSemesterType && matchesStatus
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (aValue === undefined) aValue = ''
      if (bValue === undefined) bValue = ''

      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredSemesters(filtered)
  }, [semesters, searchTerm, sortField, sortOrder, filterSection, filterStatus, filterYear, filterSemesterType])

  // Get unique values for filters
  const uniqueSections = Array.from(new Set(semesters.map(s => s.section))).sort()
  const uniqueYears = Array.from(new Set(semesters.map(s => parseSemesterTitle(s.title).year))).sort((a, b) => b - a)

  // Load data on mount
  useEffect(() => {
    loadSemesters()
  }, [loadSemesters])

  // Handle URL parameters for direct navigation to create mode
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'create') {
      setViewMode('create')
    }
  }, [searchParams])

  // Handle form submission
  const handleSubmit = async () => {
    console.log('handleSubmit called')
    console.log('Current form data:', formData)
    console.log('Editing semester:', editingSemester)
    setIsCreating(true)
    try {
      // Transform form data to match database schema
      const transformedData = {
        semester: {
          title: `${formData.semester.semester_type} ${formData.semester.year}${formData.semester.title ? ` - ${formData.semester.title}` : ''}`,
          description: formData.semester.description,
          section: formData.semester.section,
          has_midterm: formData.semester.has_midterm,
          has_final: formData.semester.has_final,
          midterm_details: formData.semester.has_midterm ? formData.semester.midterm_details : null,
          final_details: formData.semester.has_final ? formData.semester.final_details : null,
          start_date: formData.semester.start_date || null,
          end_date: formData.semester.end_date || null,
          default_credits: formData.semester.default_credits || 3,
          is_active: formData.semester.is_active
        },
        courses: formData.courses
      }

      const isEditing = !!editingSemester
      const url = isEditing
        ? `/api/section-admin/semesters/${editingSemester}`
        : '/api/section-admin/semesters'
      const method = isEditing ? 'PUT' : 'POST'

      console.log('Sending data to API:', transformedData)

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`Semester ${isEditing ? 'updated' : 'created'} successfully:`, result)

        // Reset form
        setFormData({
          semester: {
            title: "",
            description: "",
            section: "",
            semester_type: "Fall",
            year: new Date().getFullYear(),
            has_midterm: true,
            has_final: true,
            midterm_details: {
              date: "",
              time: "",
              duration: 120,
              location: "",
              instructions: "",
              total_marks: 100,
              pass_marks: 40
            },
            final_details: {
              date: "",
              time: "",
              duration: 180,
              location: "",
              instructions: "",
              total_marks: 100,
              pass_marks: 40
            },
            start_date: "",
            end_date: "",
            default_credits: 3,
            is_active: true
          },
          courses: []
        })

        // Reload semesters
        await loadSemesters()

        // Reset editing state
        setEditingSemester(null)

        // Switch to list view
        setViewMode('list')

        // Show success message
        toast.success(`Semester ${isEditing ? 'updated' : 'created'} successfully!`)
      } else {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` }
        }

        console.error('Failed to create semester:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          errorData: errorData,
          transformedData: transformedData
        })

        if (response.status === 401) {
          toast.error('Authentication required. Please log in as a section admin.')
        } else if (response.status === 403) {
          toast.error('Access denied. You need section admin permissions.')
        } else {
          const errorMessage = errorData?.error || errorText || `HTTP ${response.status}: ${response.statusText}`
          toast.error(`Failed to create semester: ${errorMessage}`)
        }
      }
    } catch (error) {
      console.error('Error creating semester:', error)
      toast.error('Error creating semester. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  // Helper functions for managing courses, topics, videos, slides, and study resources
  const addCourse = () => {
    const newCourse: CourseData = {
      title: "",
      course_code: "",
      teacher_name: "",
      teacher_email: "",
      description: "",
      credits: formData.semester.default_credits || 3,
      is_active: true,
      topics: [],
      study_resources: []
    }
    setFormData(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse]
    }))
  }

  const removeCourse = (courseIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.filter((_, index) => index !== courseIndex)
    }))
  }

  const updateCourse = (courseIndex: number, field: keyof CourseData, value: any) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, index) =>
        index === courseIndex ? { ...course, [field]: value } : course
      )
    }))
  }

  const addTopic = (courseIndex: number) => {
    const newTopic: TopicData = {
      title: "",
      description: "",
      order_index: formData.courses[courseIndex].topics.length,
      difficulty_level: "beginner",
      is_published: true,
      slides: [],
      videos: []
    }
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, index) =>
        index === courseIndex
          ? { ...course, topics: [...course.topics, newTopic] }
          : course
      )
    }))
  }

  const removeTopic = (courseIndex: number, topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, index) =>
        index === courseIndex
          ? { ...course, topics: course.topics.filter((_, tIndex) => tIndex !== topicIndex) }
          : course
      )
    }))
  }

  const updateTopic = (courseIndex: number, topicIndex: number, field: keyof TopicData, value: any) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, cIndex) =>
        cIndex === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, tIndex) =>
                tIndex === topicIndex ? { ...topic, [field]: value } : topic
              )
            }
          : course
      )
    }))
  }

  const addVideo = (courseIndex: number, topicIndex: number) => {
    const newVideo: VideoData = {
      title: "",
      description: "",
      youtube_url: "",
      order_index: formData.courses[courseIndex].topics[topicIndex].videos.length,
      video_quality: "1080p",
      has_subtitles: false,
      language: "en",
      is_published: true
    }
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, cIndex) =>
        cIndex === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, tIndex) =>
                tIndex === topicIndex
                  ? { ...topic, videos: [...topic.videos, newVideo] }
                  : topic
              )
            }
          : course
      )
    }))
  }

  const removeVideo = (courseIndex: number, topicIndex: number, videoIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, cIndex) =>
        cIndex === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, tIndex) =>
                tIndex === topicIndex
                  ? { ...topic, videos: topic.videos.filter((_, vIndex) => vIndex !== videoIndex) }
                  : topic
              )
            }
          : course
      )
    }))
  }

  const updateVideo = (courseIndex: number, topicIndex: number, videoIndex: number, field: keyof VideoData, value: any) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, cIndex) =>
        cIndex === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, tIndex) =>
                tIndex === topicIndex
                  ? {
                      ...topic,
                      videos: topic.videos.map((video, vIndex) =>
                        vIndex === videoIndex ? { ...video, [field]: value } : video
                      )
                    }
                  : topic
              )
            }
          : course
      )
    }))
  }

  const addSlide = (courseIndex: number, topicIndex: number) => {
    const newSlide: SlideData = {
      title: "",
      description: "",
      google_drive_url: "",
      order_index: formData.courses[courseIndex].topics[topicIndex].slides.length,
      is_downloadable: true
    }
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, cIndex) =>
        cIndex === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, tIndex) =>
                tIndex === topicIndex
                  ? { ...topic, slides: [...topic.slides, newSlide] }
                  : topic
              )
            }
          : course
      )
    }))
  }

  const removeSlide = (courseIndex: number, topicIndex: number, slideIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, cIndex) =>
        cIndex === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, tIndex) =>
                tIndex === topicIndex
                  ? { ...topic, slides: topic.slides.filter((_, sIndex) => sIndex !== slideIndex) }
                  : topic
              )
            }
          : course
      )
    }))
  }

  const updateSlide = (courseIndex: number, topicIndex: number, slideIndex: number, field: keyof SlideData, value: any) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, cIndex) =>
        cIndex === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, tIndex) =>
                tIndex === topicIndex
                  ? {
                      ...topic,
                      slides: topic.slides.map((slide, sIndex) =>
                        sIndex === slideIndex ? { ...slide, [field]: value } : slide
                      )
                    }
                  : topic
              )
            }
          : course
      )
    }))
  }

  const addStudyResource = (courseIndex: number) => {
    const newStudyResource: StudyResourceData = {
      title: "",
      description: "",
      type: "exam_note",
      content_url: "",
      exam_type: "both",
      is_downloadable: true
    }
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, index) =>
        index === courseIndex
          ? { ...course, study_resources: [...course.study_resources, newStudyResource] }
          : course
      )
    }))
  }

  const removeStudyResource = (courseIndex: number, resourceIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, index) =>
        index === courseIndex
          ? { ...course, study_resources: course.study_resources.filter((_, rIndex) => rIndex !== resourceIndex) }
          : course
      )
    }))
  }

  const updateStudyResource = (courseIndex: number, resourceIndex: number, field: keyof StudyResourceData, value: any) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, cIndex) =>
        cIndex === courseIndex
          ? {
              ...course,
              study_resources: course.study_resources.map((resource, rIndex) =>
                rIndex === resourceIndex ? { ...resource, [field]: value } : resource
              )
            }
          : course
      )
    }))
  }

  // Show authentication error if present
  if (authError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">{authError}</p>
            <Button
              onClick={() => router.push('/admin-login')}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading && viewMode === 'list') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading semester data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid grid-cols-2 w-auto bg-muted/50">
              <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-background px-6">
                <Calendar className="h-4 w-4" />
                All Semesters
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-background px-6">
                <Plus className="h-4 w-4" />
                Create New
              </TabsTrigger>
            </TabsList>

            {viewMode === 'list' && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setViewMode('create')}
                  size="sm"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Semester
                </Button>
                <Button variant="outline" onClick={loadSemesters} size="sm" disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            )}
          </div>

          {/* List View */}
          <TabsContent value="list" className="space-y-6 mt-0">
            {/* Quick Stats */}
            {semesters.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total Semesters</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{semesters.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total Courses</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{semesters.reduce((acc, s) => acc + (s.courses_count || 0), 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total Topics</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{semesters.reduce((acc, s) => acc + (s.topics_count || 0), 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total Students</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{semesters.reduce((acc, s) => acc + (s.students_count || 0), 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Search and Filters */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search semesters by title, section, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Select value={filterSection} onValueChange={setFilterSection}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {uniqueSections.map(section => (
                          <SelectItem key={section} value={section}>{section}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterSemesterType} onValueChange={setFilterSemesterType}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Semesters List */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Academic Semesters</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      {filteredSemesters.length > 0
                        ? `Showing ${filteredSemesters.length} of ${semesters.length} semesters`
                        : "No semesters match your criteria"
                      }
                    </CardDescription>
                  </div>
                  {filteredSemesters.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Sort by:</span>
                      <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="updated_at">Last Updated</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                          <SelectItem value="section">Section</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="h-8 w-8 p-0"
                      >
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {filteredSemesters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {semesters.length === 0 ? "No semesters yet" : "No matching semesters"}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {semesters.length === 0
                        ? "Get started by creating your first semester. You can add courses, topics, and study materials to organize your academic content."
                        : "Try adjusting your search terms or filters to find the semesters you're looking for."
                      }
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button onClick={() => setViewMode('create')} className="h-10 px-6">
                        <Plus className="h-4 w-4 mr-2" />
                        {semesters.length === 0 ? "Create First Semester" : "Create New Semester"}
                      </Button>
                      {semesters.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("")
                            setFilterSection("all")
                            setFilterSemesterType("all")
                            setFilterStatus("all")
                            setFilterYear("all")
                          }}
                          className="h-10 px-6"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSemesters.map((semester) => {
                      const parsed = parseSemesterTitle(semester.title)
                      return (
                        <Card key={semester.id} className="border border-border/50 hover:border-border transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">{parsed.displayTitle || semester.title}</h3>
                                    <Badge variant="secondary" className="text-xs">
                                      {parsed.type} {parsed.year}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {semester.section}
                                    </Badge>
                                  </div>
                                <div className="flex items-center gap-2">
                                  {(semester.is_active ?? true) ? (
                                    <Badge variant="default" className="text-xs bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {semester.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {semester.description}
                                </p>
                              )}

                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">{semester.courses_count}</span>
                                  <span className="text-muted-foreground">courses</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium">{semester.topics_count}</span>
                                  <span className="text-muted-foreground">topics</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ClipboardList className="h-4 w-4 text-orange-500" />
                                  <span className="font-medium">{semester.study_resources_count}</span>
                                  <span className="text-muted-foreground">resources</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">{semester.students_count || 0}</span>
                                  <span className="text-muted-foreground">students</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Updated {new Date(semester.updated_at!).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</span>
                                {semester.has_midterm && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Midterm</span>
                                  </div>
                                )}
                                {semester.has_final && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Final</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {/* handleView(semester.id!) */}}
                                className="h-9 px-3"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSemester(semester.id!)}
                                className="h-9 px-3"
                                title="Edit Semester"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {/* handleDuplicate(semester.id!) */}}
                                className="h-9 px-3"
                                title="Duplicate Semester"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 px-3 text-destructive hover:text-destructive"
                                    title="Delete Semester"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Semester</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{semester.title}"? This action cannot be undone and will permanently remove all associated courses, topics, and study materials.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSemester(semester.id!)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      disabled={isDeleting === semester.id}
                                    >
                                      {isDeleting === semester.id ? 'Deleting...' : 'Delete'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create View */}
          <TabsContent value="create" className="space-y-6 mt-0">
            {/* Progress Indicator */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
                <span className="text-sm font-medium">Semester Details</span>
              </div>
              <div className="flex-1 h-px bg-border"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted border-2 border-border rounded-full flex items-center justify-center text-sm font-medium text-muted-foreground">2</div>
                <span className="text-sm text-muted-foreground">Add Courses</span>
              </div>
              <div className="flex-1 h-px bg-border"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted border-2 border-border rounded-full flex items-center justify-center text-sm font-medium text-muted-foreground">3</div>
                <span className="text-sm text-muted-foreground">Review & Create</span>
              </div>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {editingSemester ? <Edit3 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      {editingSemester ? 'Edit Semester' : 'Create New Semester'}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      {editingSemester
                        ? 'Modify semester details, courses, topics, and study materials'
                        : 'Set up a new academic semester with courses, topics, and study materials'
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Step 1: Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-semester-title" className="text-sm font-medium flex items-center gap-1">
                          Semester Title
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="create-semester-title"
                          placeholder="e.g., Fall 2025"
                          value={formData.semester.title}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            semester: { ...prev.semester, title: e.target.value }
                          }))}
                          className="h-11"
                        />
                        <p className="text-xs text-muted-foreground">
                          Choose a clear, descriptive title for this semester
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="create-semester-section" className="text-sm font-medium flex items-center gap-1">
                          Section
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="create-semester-section"
                          placeholder="e.g., CS-A, EEE-B, BBA-C"
                          value={formData.semester.section}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            semester: { ...prev.semester, section: e.target.value }
                          }))}
                          className="h-11"
                        />
                        <p className="text-xs text-muted-foreground">
                          Specify the department and section code
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            Semester Type
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.semester.semester_type}
                            onValueChange={(value: 'Fall' | 'Spring' | 'Summer') =>
                              setFormData(prev => ({
                                ...prev,
                                semester: { ...prev.semester, semester_type: value }
                              }))
                            }
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Fall">🍂 Fall Semester</SelectItem>
                              <SelectItem value="Spring">🌸 Spring Semester</SelectItem>
                              <SelectItem value="Summer">☀️ Summer Semester</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            Academic Year
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="2020"
                            max="2030"
                            value={formData.semester.year}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              semester: { ...prev.semester, year: parseInt(e.target.value) || new Date().getFullYear() }
                            }))}
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-semester-description" className="text-sm font-medium">
                          Description
                        </Label>
                        <Textarea
                          id="create-semester-description"
                          placeholder="Provide a brief description of this semester, including any special notes or objectives..."
                          value={formData.semester.description}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            semester: { ...prev.semester, description: e.target.value }
                          }))}
                          rows={3}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional: Add context about this semester's focus or special characteristics
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="space-y-1">
                          <Label htmlFor="semester-active" className="text-sm font-medium">
                            Semester Status
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Active semesters are visible to students and can be enrolled in
                          </p>
                        </div>
                        <Switch
                          id="semester-active"
                          checked={formData.semester.is_active}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            semester: { ...prev.semester, is_active: checked }
                          }))}
                        />
                      </div>

                      {/* Exam Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                          <h4 className="text-sm font-semibold">Exam Configuration</h4>
                        </div>

                        {/* Midterm Configuration */}
                        <div className="space-y-4 p-4 border border-border/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label htmlFor="has-midterm" className="text-sm font-medium">
                                Midterm Exam
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Enable midterm examination for this semester
                              </p>
                            </div>
                            <Switch
                              id="has-midterm"
                              checked={formData.semester.has_midterm}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                semester: { ...prev.semester, has_midterm: checked }
                              }))}
                            />
                          </div>


                        </div>

                        {/* Final Configuration */}
                        <div className="space-y-4 p-4 border border-border/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label htmlFor="has-final" className="text-sm font-medium">
                                Final Exam
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Enable final examination for this semester
                              </p>
                            </div>
                            <Switch
                              id="has-final"
                              checked={formData.semester.has_final}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                semester: { ...prev.semester, has_final: checked }
                              }))}
                            />
                          </div>


                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Course Management */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <h3 className="text-lg font-semibold">Course Setup</h3>
                    <div className="flex-1"></div>
                    <Button
                      onClick={addCourse}
                      size="sm"
                      variant="outline"
                      className="h-9"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </div>

                  {formData.courses.length === 0 ? (
                    <Card className="border-dashed border-muted-foreground/25 bg-muted/20">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                          <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                          Start building your semester by adding courses. Each course can contain topics, videos, files, and study resources.
                        </p>
                        <Button onClick={addCourse} className="h-10 px-6">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Course
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {formData.courses.map((course, courseIndex) => (
                        <Card key={courseIndex} className="border border-border/50 shadow-sm">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-medium">
                                  {courseIndex + 1}
                                </div>
                                <div>
                                  <CardTitle className="text-lg font-semibold">
                                    {course.title || `Course ${courseIndex + 1}`}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    {course.course_code || "No course code"} • {course.teacher_name || "No teacher assigned"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCourse(courseIndex)}
                                className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                                title="Remove course"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Course Basic Info */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-1">
                                    Course Name
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    placeholder="e.g., Data Structures and Algorithms"
                                    value={course.title}
                                    onChange={(e) => updateCourse(courseIndex, 'title', e.target.value)}
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-1">
                                    Course Code
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    placeholder="e.g., CSE-201"
                                    value={course.course_code}
                                    onChange={(e) => updateCourse(courseIndex, 'course_code', e.target.value)}
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-1">
                                    Instructor Name
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    placeholder="e.g., Dr. John Smith"
                                    value={course.teacher_name}
                                    onChange={(e) => updateCourse(courseIndex, 'teacher_name', e.target.value)}
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Instructor Email</Label>
                                  <Input
                                    type="email"
                                    placeholder="e.g., john.smith@diu.edu.bd"
                                    value={course.teacher_email || ''}
                                    onChange={(e) => updateCourse(courseIndex, 'teacher_email', e.target.value)}
                                    className="h-10"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Course Description</Label>
                                <Textarea
                                  placeholder="Provide a comprehensive description of the course objectives, content, and learning outcomes..."
                                  value={course.description || ''}
                                  onChange={(e) => updateCourse(courseIndex, 'description', e.target.value)}
                                  rows={3}
                                  className="resize-none"
                                />
                              </div>
                            </div>

                            {/* Topics Section */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-muted-foreground">Topics</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addTopic(courseIndex)}
                                  className="h-7 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Topic
                                </Button>
                              </div>

                              {course.topics.length === 0 ? (
                                <div className="text-center py-3 text-muted-foreground bg-muted/20 rounded border-dashed border border-muted-foreground/25">
                                  <p className="text-xs">No topics added</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {course.topics.map((topic, topicIndex) => (
                                    <Card key={topicIndex} className="border border-border/50 shadow-sm">
                                      <CardContent className="p-3">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center">
                                              <span className="text-xs font-medium">{topicIndex + 1}</span>
                                            </div>
                                            <h4 className="text-xs font-medium">Topic {topicIndex + 1}</h4>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTopic(courseIndex, topicIndex)}
                                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>

                                        <div className="space-y-2 mb-3">
                                          <Label className="text-xs text-muted-foreground">Topic Name *</Label>
                                          <Input
                                            placeholder="e.g., Arrays and Linked Lists"
                                            value={topic.title}
                                            onChange={(e) => updateTopic(courseIndex, topicIndex, 'title', e.target.value)}
                                            className="h-8 text-sm"
                                          />
                                        </div>

                                        {/* Videos Section */}
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label className="text-xs text-muted-foreground">Videos</Label>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => addVideo(courseIndex, topicIndex)}
                                              className="h-6 text-xs"
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add
                                            </Button>
                                          </div>

                                          {topic.videos.length === 0 ? (
                                            <div className="text-xs text-muted-foreground text-center py-2 bg-muted/20 rounded border-dashed border border-muted-foreground/25">
                                              No videos added
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              {topic.videos.map((video, videoIndex) => (
                                                <div key={videoIndex} className="border border-border/50 rounded p-2 bg-background shadow-sm">
                                                  <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-xs">🎬</span>
                                                      <span className="text-xs font-medium">Video {videoIndex + 1}</span>
                                                    </div>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => removeVideo(courseIndex, topicIndex, videoIndex)}
                                                      className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                                                    >
                                                      <X className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <div className="space-y-1">
                                                      <Label className="text-xs text-muted-foreground">Title</Label>
                                                      <Input
                                                        placeholder="Video title"
                                                        value={video.title}
                                                        onChange={(e) => updateVideo(courseIndex, topicIndex, videoIndex, 'title', e.target.value)}
                                                        className="h-7 text-xs"
                                                      />
                                                    </div>
                                                    <div className="space-y-1">
                                                      <Label className="text-xs text-muted-foreground">YouTube URL</Label>
                                                      <Input
                                                        placeholder="https://youtube.com/watch?v=..."
                                                        value={video.youtube_url}
                                                        onChange={(e) => updateVideo(courseIndex, topicIndex, videoIndex, 'youtube_url', e.target.value)}
                                                        className="h-7 text-xs"
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        {/* Files Section */}
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label className="text-xs text-muted-foreground">Files</Label>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => addSlide(courseIndex, topicIndex)}
                                              className="h-6 text-xs"
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add
                                            </Button>
                                          </div>

                                          {topic.slides.length === 0 ? (
                                            <div className="text-xs text-muted-foreground text-center py-2 bg-muted/20 rounded border-dashed border border-muted-foreground/25">
                                              No files added
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              {topic.slides.map((slide, slideIndex) => (
                                                <div key={slideIndex} className="border border-border/50 rounded p-2 bg-background shadow-sm">
                                                  <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-xs">📄</span>
                                                      <span className="text-xs font-medium">File {slideIndex + 1}</span>
                                                    </div>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => removeSlide(courseIndex, topicIndex, slideIndex)}
                                                      className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                                                    >
                                                      <X className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <div className="space-y-1">
                                                      <Label className="text-xs text-muted-foreground">Title</Label>
                                                      <Input
                                                        placeholder="File title"
                                                        value={slide.title}
                                                        onChange={(e) => updateSlide(courseIndex, topicIndex, slideIndex, 'title', e.target.value)}
                                                        className="h-7 text-xs"
                                                      />
                                                    </div>
                                                    <div className="space-y-1">
                                                      <Label className="text-xs text-muted-foreground">Google Drive URL</Label>
                                                      <Input
                                                        placeholder="https://drive.google.com/file/d/..."
                                                        value={slide.google_drive_url}
                                                        onChange={(e) => updateSlide(courseIndex, topicIndex, slideIndex, 'google_drive_url', e.target.value)}
                                                        className="h-7 text-xs"
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>

                            {/* Study Resources Section */}
                            <div className="space-y-3 mt-4 pt-3 border-t border-border/50">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-muted-foreground">Study Resources</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addStudyResource(courseIndex)}
                                  className="h-7 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Resource
                                </Button>
                              </div>

                              {course.study_resources.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded border-dashed border border-muted-foreground/25">
                                  <p className="text-xs">No study resources added</p>
                                  <p className="text-xs mt-1 opacity-75">Add notes, questions, or syllabus</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {course.study_resources.map((resource, resourceIndex) => (
                                    <Card key={resourceIndex} className="border border-border/50 shadow-sm">
                                      <CardContent className="p-3">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center">
                                              <span className="text-xs">
                                                {resource.type === 'note' ? '📝' : resource.type === 'previous_question' ? '❓' : '📋'}
                                              </span>
                                            </div>
                                            <h4 className="text-xs font-medium">
                                              {resource.type === 'note' ? 'Note' : resource.type === 'previous_question' ? 'Question' : 'Syllabus'} {resourceIndex + 1}
                                            </h4>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeStudyResource(courseIndex, resourceIndex)}
                                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>

                                        <div className="grid gap-2 md:grid-cols-2 mb-3">
                                          <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Title *</Label>
                                            <Input
                                              placeholder="e.g., Chapter 1 Notes"
                                              value={resource.title}
                                              onChange={(e) => updateStudyResource(courseIndex, resourceIndex, 'title', e.target.value)}
                                              className="h-8 text-sm"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Type *</Label>
                                            <Select
                                              value={resource.type || 'exam_note'}
                                              onValueChange={(value) => updateStudyResource(courseIndex, resourceIndex, 'type', value)}
                                            >
                                              <SelectTrigger className="h-8 text-sm">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="exam_note">Exam Note</SelectItem>
                                                <SelectItem value="previous_questions">Previous Questions</SelectItem>
                                                <SelectItem value="syllabus">Syllabus</SelectItem>
                                                <SelectItem value="mark_distribution">Mark Distribution</SelectItem>
                                                <SelectItem value="assignment">Assignment</SelectItem>
                                                <SelectItem value="lab_manual">Lab Manual</SelectItem>
                                                <SelectItem value="reference_book">Reference Book</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>

                                        <div className="space-y-3">
                                          <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Content Type</Label>
                                            <div className="flex gap-2">
                                              <Button
                                                type="button"
                                                variant={(resource.content_url && resource.content_url.trim() !== '' && resource.content_url !== 'text') ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                  updateStudyResource(courseIndex, resourceIndex, 'content_url', 'file')
                                                  // Don't clear description when switching to file mode
                                                }}
                                                className="flex-1 h-8 text-xs"
                                              >
                                                📁 File
                                              </Button>
                                              <Button
                                                type="button"
                                                variant={(!resource.content_url || resource.content_url.trim() === '' || resource.content_url === 'text') ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                  updateStudyResource(courseIndex, resourceIndex, 'content_url', 'text')
                                                  // Keep existing description when switching to text mode
                                                }}
                                                className="flex-1 h-8 text-xs"
                                              >
                                                📝 Text
                                              </Button>
                                            </div>
                                          </div>

                                          {(resource.content_url && resource.content_url.trim() !== '' && resource.content_url !== 'text' && resource.content_url !== 'file') ? (
                                            <div className="space-y-1">
                                              <Label className="text-xs text-muted-foreground">Google Drive URL</Label>
                                              <Input
                                                placeholder="https://drive.google.com/file/d/..."
                                                value={resource.content_url}
                                                onChange={(e) => updateStudyResource(courseIndex, resourceIndex, 'content_url', e.target.value)}
                                                className="h-8 text-sm"
                                              />
                                            </div>
                                          ) : resource.content_url === 'file' ? (
                                            <div className="space-y-1">
                                              <Label className="text-xs text-muted-foreground">File URL</Label>
                                              <Input
                                                placeholder="https://drive.google.com/file/d/... or other file URL"
                                                value=""
                                                onChange={(e) => updateStudyResource(courseIndex, resourceIndex, 'content_url', e.target.value)}
                                                className="h-8 text-sm"
                                              />
                                            </div>
                                          ) : (
                                            <div className="space-y-1">
                                              <Label className="text-xs text-muted-foreground">Content</Label>
                                              <Textarea
                                                placeholder={
                                                  resource.type === 'syllabus'
                                                    ? "Enter syllabus content..."
                                                    : resource.type === 'exam_note'
                                                    ? "Enter exam notes..."
                                                    : resource.type === 'previous_questions'
                                                    ? "Enter previous questions..."
                                                    : "Enter content..."
                                                }
                                                value={resource.description || ''}
                                                onChange={(e) => updateStudyResource(courseIndex, resourceIndex, 'description', e.target.value)}
                                                rows={4}
                                                className="resize-none text-sm"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 3: Review & Create */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <h3 className="text-lg font-semibold">Review & Create</h3>
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/30 rounded-lg p-6 space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-4">Semester Summary</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Title:</span> {formData.semester.title || "Not specified"}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Section:</span> {formData.semester.section || "Not specified"}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Type:</span> {formData.semester.semester_type} {formData.semester.year}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Courses:</span> {formData.courses.length}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Topics:</span> {formData.courses.reduce((acc, course) => acc + course.topics.length, 0)}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Status:</span> {formData.semester.is_active ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Exam Summary */}
                    {(formData.semester.has_midterm || formData.semester.has_final) && (
                      <div className="border-t border-border/50 pt-4">
                        <h4 className="text-sm font-medium mb-4">Exam Configuration</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          {formData.semester.has_midterm && (
                            <div className="space-y-2 p-3 bg-background/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Midterm Exam</span>
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                {formData.semester.midterm_details?.date && (
                                  <p>Date: {new Date(formData.semester.midterm_details.date).toLocaleDateString()}</p>
                                )}
                                {formData.semester.midterm_details?.time && (
                                  <p>Time: {formData.semester.midterm_details.time}</p>
                                )}
                                {formData.semester.midterm_details?.duration && (
                                  <p>Duration: {formData.semester.midterm_details.duration} minutes</p>
                                )}
                                {formData.semester.midterm_details?.location && (
                                  <p>Location: {formData.semester.midterm_details.location}</p>
                                )}
                                {formData.semester.midterm_details?.total_marks && (
                                  <p>Total Marks: {formData.semester.midterm_details.total_marks}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {formData.semester.has_final && (
                            <div className="space-y-2 p-3 bg-background/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Final Exam</span>
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                {formData.semester.final_details?.date && (
                                  <p>Date: {new Date(formData.semester.final_details.date).toLocaleDateString()}</p>
                                )}
                                {formData.semester.final_details?.time && (
                                  <p>Time: {formData.semester.final_details.time}</p>
                                )}
                                {formData.semester.final_details?.duration && (
                                  <p>Duration: {formData.semester.final_details.duration} minutes</p>
                                )}
                                {formData.semester.final_details?.location && (
                                  <p>Location: {formData.semester.final_details.location}</p>
                                )}
                                {formData.semester.final_details?.total_marks && (
                                  <p>Total Marks: {formData.semester.final_details.total_marks}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setViewMode('list')
                        setEditingSemester(null)
                        // Reset form data
                        setFormData({
                          semester: {
                            title: "",
                            description: "",
                            section: "",
                            semester_type: "Fall",
                            year: new Date().getFullYear(),
                            has_midterm: true,
                            has_final: true,
                            midterm_details: {
                              date: "",
                              time: "",
                              duration: 120,
                              location: "",
                              instructions: "",
                              total_marks: 100,
                              pass_marks: 40
                            },
                            final_details: {
                              date: "",
                              time: "",
                              duration: 180,
                              location: "",
                              instructions: "",
                              total_marks: 100,
                              pass_marks: 40
                            },
                            start_date: "",
                            end_date: "",
                            default_credits: 3,
                            is_active: true
                          },
                          courses: []
                        })
                      }}
                      className="h-11 px-6"
                      disabled={isCreating}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-muted-foreground">
                        {formData.semester.title && formData.semester.section ?
                          "Ready to create semester" :
                          "Please fill in required fields"
                        }
                      </p>
                      <Button
                        onClick={() => {
                          console.log('Button clicked!')
                          console.log('Form validation:', {
                            hasTitle: !!formData.semester.title,
                            hasSection: !!formData.semester.section,
                            isCreating: isCreating
                          })
                          handleSubmit()
                        }}
                        disabled={isCreating || !formData.semester.title || !formData.semester.section}
                        className="h-11 px-8"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {editingSemester ? 'Update Semester' : 'Create Semester'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit View */}
          <TabsContent value="edit" className="space-y-4 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Semester
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Modify semester details and courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Edit functionality will be implemented here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

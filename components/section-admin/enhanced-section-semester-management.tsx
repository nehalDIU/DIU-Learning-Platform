"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
  TrendingUp
} from "lucide-react"

// Enhanced interfaces for section admin semester management
interface SemesterData {
  id?: string
  title: string
  description: string
  section: string
  semester_type: 'Fall' | 'Spring' | 'Summer'
  year: number
  has_midterm: boolean
  has_final: boolean
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
  type: 'note' | 'previous_question' | 'syllabus'
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

interface AllInOneData {
  semester: SemesterData
  courses: CourseData[]
}

type SortField = 'title' | 'section' | 'created_at' | 'updated_at' | 'courses_count' | 'year'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'list' | 'create' | 'edit'

export function EnhancedSectionSemesterManagement() {
  const router = useRouter()

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [semesters, setSemesters] = useState<SemesterSummary[]>([])
  const [filteredSemesters, setFilteredSemesters] = useState<SemesterSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
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
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setSemesters(data || [])

      if (!data || data.length === 0) {
        toast.info('No semesters found. Create your first semester!')
      }
    } catch (error) {
      console.error('Error loading semesters:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to load semesters: ${errorMessage}`)
      
      // Set mock data for development
      setSemesters([
        {
          id: '1',
          title: 'Fall 2024',
          description: 'Fall semester 2024 for Computer Science',
          section: 'CS-A',
          semester_type: 'Fall',
          year: 2024,
          exam_type: 'Both',
          has_midterm: true,
          has_final: true,
          is_active: true,
          courses_count: 6,
          topics_count: 24,
          materials_count: 48,
          study_resources_count: 12,
          students_count: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Spring 2024',
          description: 'Spring semester 2024 for Computer Science',
          section: 'CS-A',
          semester_type: 'Spring',
          year: 2024,
          exam_type: 'Both',
          has_midterm: true,
          has_final: true,
          is_active: false,
          courses_count: 5,
          topics_count: 20,
          materials_count: 40,
          study_resources_count: 10,
          students_count: 42,
          created_at: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter and sort semesters
  useEffect(() => {
    let filtered = semesters.filter(semester => {
      const matchesSearch = semester.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           semester.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           semester.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSection = filterSection === "all" || semester.section === filterSection
      const matchesYear = filterYear === "all" || semester.year.toString() === filterYear
      const matchesSemesterType = filterSemesterType === "all" || semester.semester_type === filterSemesterType
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
  const uniqueYears = Array.from(new Set(semesters.map(s => s.year))).sort((a, b) => b - a)

  // Load data on mount
  useEffect(() => {
    loadSemesters()
  }, [loadSemesters])

  // Handle form submission
  const handleSubmit = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/section-admin/semesters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Semester created successfully:', result)

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
            start_date: "",
            end_date: "",
            default_credits: 3,
            is_active: true
          },
          courses: []
        })

        // Reload semesters
        await loadSemesters()

        // Switch to list view
        setActiveTab('list')

        // Show success message
        toast.success('Semester created successfully!')
      } else {
        const error = await response.json()
        console.error('Failed to create semester:', error)
        toast.error(`Failed to create semester: ${error.error || 'Unknown error'}`)
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
      type: "note",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-8 w-8" />
                Enhanced Semester Management
              </h1>
              <p className="text-blue-100">
                Create, edit, and manage semester structures with comprehensive tools for section administrators
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                {filteredSemesters.length} of {semesters.length} semesters
              </Badge>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>{semesters.reduce((acc, s) => acc + (s.students_count || 0), 0)} students</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Semester List
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2" disabled={!editingSemester}>
            <Edit3 className="h-4 w-4" />
            Edit Semester
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search semesters..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Section</Label>
                  <Select value={filterSection} onValueChange={setFilterSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {uniqueSections.map(section => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Year</Label>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {uniqueYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Semester</Label>
                  <Select value={filterSemesterType} onValueChange={setFilterSemesterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Fall">Fall</SelectItem>
                      <SelectItem value="Spring">Spring</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Actions</Label>
                  <div className="flex gap-2">
                    <Button onClick={() => setViewMode('create')} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create
                    </Button>
                    <Button variant="outline" onClick={loadSemesters} size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Semesters Table */}
          <Card>
            <CardHeader>
              <CardTitle>Semester Management</CardTitle>
              <CardDescription>
                All semesters with comprehensive management options for section administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSemesters.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No semesters found</h3>
                  <p className="text-muted-foreground mb-4">
                    {semesters.length === 0
                      ? "Create your first semester to get started"
                      : "Try adjusting your search or filter criteria"
                    }
                  </p>
                  <Button onClick={() => setViewMode('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Semester
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Semester Details</TableHead>
                        <TableHead>Type & Year</TableHead>
                        <TableHead>Content Summary</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Exams</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSemesters.map((semester) => (
                        <TableRow key={semester.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <div className="font-medium">{semester.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {semester.description || "No description"}
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {semester.section}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="secondary">
                                {semester.semester_type} {semester.year}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <BookOpen className="h-3 w-3" />
                                {semester.courses_count} Courses
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <FileText className="h-3 w-3" />
                                {semester.topics_count} Topics
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <ClipboardList className="h-3 w-3" />
                                {semester.study_resources_count} Resources
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span className="text-sm font-medium">
                                {semester.students_count || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(semester.is_active ?? true) ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {semester.has_midterm && (
                                <Badge variant="secondary" className="text-xs">Midterm</Badge>
                              )}
                              {semester.has_final && (
                                <Badge variant="secondary" className="text-xs">Final</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(semester.updated_at!).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {/* handleView(semester.id!) */}}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {/* handleEdit(semester.id!) */}}
                                title="Edit Semester"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {/* handleDuplicate(semester.id!) */}}
                                title="Duplicate Semester"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create View */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Semester
                </div>
              </CardTitle>
              <CardDescription>
                Create a new semester with courses, topics, and study resources for your section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Semester Basic Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-semester-title" className="text-sm font-medium">
                      Semester Title *
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-semester-section" className="text-sm font-medium">
                      Section *
                    </Label>
                    <Input
                      id="create-semester-section"
                      placeholder="e.g., CS-A"
                      value={formData.semester.section}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, section: e.target.value }
                      }))}
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Semester Type *</Label>
                      <Select
                        value={formData.semester.semester_type}
                        onValueChange={(value: 'Fall' | 'Spring' | 'Summer') =>
                          setFormData(prev => ({
                            ...prev,
                            semester: { ...prev.semester, semester_type: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fall">Fall</SelectItem>
                          <SelectItem value="Spring">Spring</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Year *</Label>
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
                      placeholder="Describe this semester..."
                      value={formData.semester.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, description: e.target.value }
                      }))}
                      rows={3}
                    />
                  </div>



                  <div className="flex items-center space-x-2">
                    <Switch
                      id="semester-active"
                      checked={formData.semester.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, is_active: checked }
                      }))}
                    />
                    <Label htmlFor="semester-active" className="text-sm">
                      Active Semester
                    </Label>
                  </div>
                </div>
              </div>

              {/* Course Management Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Courses</h3>
                  <Button
                    onClick={addCourse}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>

                {formData.courses.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No courses added yet</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Add courses to this semester to organize your academic content
                      </p>
                      <Button onClick={addCourse}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Course
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {formData.courses.map((course, courseIndex) => (
                      <Card key={courseIndex} className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-transparent">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                              </div>
                              <CardTitle className="text-lg text-blue-900">Course {courseIndex + 1}</CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCourse(courseIndex)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Course Basic Info */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Course Name *</Label>
                              <Input
                                placeholder="e.g., Data Structures"
                                value={course.title}
                                onChange={(e) => updateCourse(courseIndex, 'title', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Course Code *</Label>
                              <Input
                                placeholder="e.g., CSE-201"
                                value={course.course_code}
                                onChange={(e) => updateCourse(courseIndex, 'course_code', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Teacher Name *</Label>
                              <Input
                                placeholder="e.g., Dr. John Smith"
                                value={course.teacher_name}
                                onChange={(e) => updateCourse(courseIndex, 'teacher_name', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Teacher Email</Label>
                              <Input
                                type="email"
                                placeholder="e.g., john.smith@diu.edu.bd"
                                value={course.teacher_email || ''}
                                onChange={(e) => updateCourse(courseIndex, 'teacher_email', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Course Description</Label>
                            <Textarea
                              placeholder="Brief description of the course..."
                              value={course.description || ''}
                              onChange={(e) => updateCourse(courseIndex, 'description', e.target.value)}
                              rows={2}
                            />
                          </div>

                          {/* Topics Section */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Topics</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addTopic(courseIndex)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Topic
                              </Button>
                            </div>

                            {course.topics.length === 0 ? (
                              <div className="text-center py-4 text-muted-foreground">
                                No topics added yet
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {course.topics.map((topic, topicIndex) => (
                                  <Card key={topicIndex} className="bg-gradient-to-r from-green-50 to-transparent border-l-2 border-l-green-400">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-green-700">{topicIndex + 1}</span>
                                          </div>
                                          <h4 className="font-medium text-green-900">Topic {topicIndex + 1}</h4>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeTopic(courseIndex, topicIndex)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <div className="space-y-2 mb-4">
                                        <Label className="text-sm font-medium">Topic Name *</Label>
                                        <Input
                                          placeholder="e.g., Arrays and Linked Lists"
                                          value={topic.title}
                                          onChange={(e) => updateTopic(courseIndex, topicIndex, 'title', e.target.value)}
                                          className="h-10"
                                        />
                                      </div>

                                      {/* Videos Section */}
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                                          <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                              <span className="text-xs">🎥</span>
                                            </div>
                                            <Label className="text-sm font-medium text-red-800">Videos</Label>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addVideo(courseIndex, topicIndex)}
                                            className="border-red-200 text-red-700 hover:bg-red-100"
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Video
                                          </Button>
                                        </div>

                                        {topic.videos.length === 0 ? (
                                          <div className="text-xs text-muted-foreground text-center py-2">
                                            No videos added yet
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            {topic.videos.map((video, videoIndex) => (
                                              <div key={videoIndex} className="border border-red-200 rounded-lg p-3 bg-white shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-lg">🎬</span>
                                                    <span className="text-sm font-medium text-red-800">Video {videoIndex + 1}</span>
                                                  </div>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeVideo(courseIndex, topicIndex, videoIndex)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                  >
                                                    <X className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                                <div className="space-y-3">
                                                  <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Video Title</Label>
                                                    <Input
                                                      placeholder="e.g., Introduction to Arrays"
                                                      value={video.title}
                                                      onChange={(e) => updateVideo(courseIndex, topicIndex, videoIndex, 'title', e.target.value)}
                                                      className="h-9"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">YouTube URL</Label>
                                                    <Input
                                                      placeholder="https://youtube.com/watch?v=..."
                                                      value={video.youtube_url}
                                                      onChange={(e) => updateVideo(courseIndex, topicIndex, videoIndex, 'youtube_url', e.target.value)}
                                                      className="h-9"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Files Section */}
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                                          <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                              <span className="text-xs">📁</span>
                                            </div>
                                            <Label className="text-sm font-medium text-purple-800">Files</Label>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addSlide(courseIndex, topicIndex)}
                                            className="border-purple-200 text-purple-700 hover:bg-purple-100"
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add File
                                          </Button>
                                        </div>

                                        {topic.slides.length === 0 ? (
                                          <div className="text-xs text-muted-foreground text-center py-2">
                                            No files added yet
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            {topic.slides.map((slide, slideIndex) => (
                                              <div key={slideIndex} className="border border-purple-200 rounded-lg p-3 bg-white shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-lg">📄</span>
                                                    <span className="text-sm font-medium text-purple-800">File {slideIndex + 1}</span>
                                                  </div>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSlide(courseIndex, topicIndex, slideIndex)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                  >
                                                    <X className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                                <div className="space-y-3">
                                                  <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">File Title</Label>
                                                    <Input
                                                      placeholder="e.g., Chapter 1 Slides"
                                                      value={slide.title}
                                                      onChange={(e) => updateSlide(courseIndex, topicIndex, slideIndex, 'title', e.target.value)}
                                                      className="h-9"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Google Drive URL</Label>
                                                    <Input
                                                      placeholder="https://drive.google.com/file/d/..."
                                                      value={slide.google_drive_url}
                                                      onChange={(e) => updateSlide(courseIndex, topicIndex, slideIndex, 'google_drive_url', e.target.value)}
                                                      className="h-9"
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
                          <div className="space-y-4 mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm">📚</span>
                                </div>
                                <Label className="text-sm font-medium text-orange-800">Study Resources</Label>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addStudyResource(courseIndex)}
                                className="border-orange-200 text-orange-700 hover:bg-orange-100"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Resource
                              </Button>
                            </div>

                            {course.study_resources.length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground bg-gray-50 rounded-lg">
                                <span className="text-2xl mb-2 block">📖</span>
                                <p>No study resources added yet</p>
                                <p className="text-xs mt-1">Add notes, previous questions, or syllabus content</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {course.study_resources.map((resource, resourceIndex) => (
                                  <Card key={resourceIndex} className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-l-orange-400 shadow-sm">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm">
                                              {resource.type === 'note' ? '📝' : resource.type === 'previous_question' ? '❓' : '📋'}
                                            </span>
                                          </div>
                                          <h4 className="font-medium text-orange-900">
                                            {resource.type === 'note' ? 'Note' : resource.type === 'previous_question' ? 'Previous Question' : 'Syllabus'} {resourceIndex + 1}
                                          </h4>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeStudyResource(courseIndex, resourceIndex)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <div className="grid gap-3 md:grid-cols-2 mb-3">
                                        <div className="space-y-2">
                                          <Label className="text-sm">Resource Title *</Label>
                                          <Input
                                            placeholder="e.g., Chapter 1 Notes"
                                            value={resource.title}
                                            onChange={(e) => updateStudyResource(courseIndex, resourceIndex, 'title', e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm">Category *</Label>
                                          <Select
                                            value={resource.type || 'note'}
                                            onValueChange={(value) => updateStudyResource(courseIndex, resourceIndex, 'type', value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="note">Note</SelectItem>
                                              <SelectItem value="previous_question">Previous Question</SelectItem>
                                              <SelectItem value="syllabus">Syllabus</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Content Type</Label>
                                          <div className="flex gap-2">
                                            <Button
                                              type="button"
                                              variant={(resource.content_url && resource.content_url.trim() !== '') ? "default" : "outline"}
                                              size="sm"
                                              onClick={() => {
                                                updateStudyResource(courseIndex, resourceIndex, 'content_url', 'file')
                                                updateStudyResource(courseIndex, resourceIndex, 'description', '')
                                              }}
                                              className="flex-1"
                                            >
                                              📁 File (Google Drive)
                                            </Button>
                                            <Button
                                              type="button"
                                              variant={(!resource.content_url || resource.content_url.trim() === '') && resource.description ? "default" : "outline"}
                                              size="sm"
                                              onClick={() => {
                                                updateStudyResource(courseIndex, resourceIndex, 'content_url', '')
                                                updateStudyResource(courseIndex, resourceIndex, 'description', 'text')
                                              }}
                                              className="flex-1"
                                            >
                                              📝 Text Content
                                            </Button>
                                          </div>
                                        </div>

                                        {(resource.content_url && resource.content_url.trim() !== '' && resource.content_url !== 'text') ? (
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Google Drive File URL</Label>
                                            <Input
                                              placeholder="https://drive.google.com/file/d/..."
                                              value={resource.content_url === 'file' ? '' : resource.content_url}
                                              onChange={(e) => updateStudyResource(courseIndex, resourceIndex, 'content_url', e.target.value)}
                                              className="h-10"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                              Paste the Google Drive sharing link for your file
                                            </p>
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Text Content</Label>
                                            <Textarea
                                              placeholder={
                                                resource.type === 'syllabus'
                                                  ? "Enter syllabus content, course outline, learning objectives..."
                                                  : resource.type === 'note'
                                                  ? "Enter notes, explanations, key points..."
                                                  : "Enter previous questions, sample problems, practice exercises..."
                                              }
                                              value={resource.description === 'text' ? '' : resource.description || ''}
                                              onChange={(e) => updateStudyResource(courseIndex, resourceIndex, 'description', e.target.value)}
                                              rows={6}
                                              className="resize-none"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                              {resource.type === 'syllabus' && "Add course syllabus, topics, and learning outcomes"}
                                              {resource.type === 'note' && "Add detailed notes and explanations"}
                                              {resource.type === 'previous_question' && "Add previous exam questions and solutions"}
                                            </p>
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

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('list')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingSemester ? 'Update Semester' : 'Create Semester'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit View */}
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Edit Semester
              </CardTitle>
              <CardDescription>
                Modify semester details and manage courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Edit functionality will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

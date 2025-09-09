"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { CourseEnrollmentProvider, useCourseEnrollmentContext } from "@/contexts/CourseEnrollmentContext"
import { useSectionContext } from "@/contexts/SectionContext"
import { ProfessionalCourseCard } from "@/components/ui/professional-course-card"
import { EnrolledCourseDetail } from "@/components/enrolled-course-detail"
import { useEnrolledCourseExpansion } from "@/hooks/useEnrolledCourseExpansion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Grid3X3,
  List,
  BookOpen,
  Heart,
  Users,
  Star,
  Loader2
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

function CoursesPageContent() {
  const {
    enrollInCourse,
    unenrollFromCourse,
    isEnrolledInCourse,
    enrollmentCount,
    loading: enrollmentLoading,
    refreshEnrolledCourses
  } = useCourseEnrollmentContext()

  const { isAuthenticated, studentUser } = useSectionContext()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("title")
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null)
  const { toggleCourse, isCourseExpanded } = useEnrolledCourseExpansion()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses/all')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    console.log('Courses page: handleEnroll called', { courseId })
    try {
      setEnrollmentError(null)
      console.log('Courses page: Attempting to enroll in course:', courseId)

      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log('User not authenticated:', { isAuthenticated, studentUser })
        setEnrollmentError('❌ Please create an account first. Go to the main page and enter your email and batch information.')
        setTimeout(() => setEnrollmentError(null), 8000)
        return
      }

      // Check if already enrolled
      if (isEnrolledInCourse(courseId)) {
        setEnrollmentError('You are already enrolled in this course')
        setTimeout(() => setEnrollmentError(null), 3000)
        return
      }

      const result = await enrollInCourse(courseId)
      console.log('Courses page: Enrollment successful:', result)

      // Show success message
      setEnrollmentError(`✅ Successfully enrolled in course!`)
      setTimeout(() => setEnrollmentError(null), 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in course'
      console.error('Courses page: Failed to enroll in course:', error)
      setEnrollmentError(`❌ ${errorMessage}`)
      // Show error for 5 seconds
      setTimeout(() => setEnrollmentError(null), 5000)
    }
  }

  const handleUnenroll = async (courseId: string) => {
    try {
      setEnrollmentError(null)
      await unenrollFromCourse(courseId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unenroll from course'
      console.error('Failed to unenroll from course:', error)
      setEnrollmentError(errorMessage)
      // Show error for 5 seconds
      setTimeout(() => setEnrollmentError(null), 5000)
    }
  }

  const handleViewDetails = (courseId: string) => {
    console.log('View course details:', courseId)
  }

  const semesters = useMemo(() => {
    const semesterSet = new Set<string>()
    courses.forEach(course => {
      if (course.semester) {
        semesterSet.add(`${course.semester.title} - ${course.semester.section}`)
      }
    })
    return Array.from(semesterSet)
  }, [courses])

  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSemester = selectedSemester === "all" ||
                             (course.semester && `${course.semester.title} - ${course.semester.section}` === selectedSemester)

      return matchesSearch && matchesSemester
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "course_code":
          return a.course_code.localeCompare(b.course_code)
        case "teacher":
          return a.teacher_name.localeCompare(b.teacher_name)
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [courses, searchQuery, selectedSemester, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8" role="main">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Course Catalog
          </h1>
          <p className="text-muted-foreground">
            Discover and enroll in courses to enhance your learning journey.
          </p>
        </header>

        {/* Authentication Status */}
        {!isAuthenticated && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Account Required:</strong> To enroll in courses, please create an account first.
              Go to the <a href="/" className="underline font-medium">main page</a> and enter your email and batch information.
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-xs">
                  Debug: isAuthenticated={String(isAuthenticated)}, studentUser={studentUser ? 'exists' : 'null'}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Show user info when authenticated */}
        {isAuthenticated && studentUser && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              <strong>Welcome, {studentUser.fullName || studentUser.email}!</strong>
              {studentUser.batch && ` (Batch: ${studentUser.batch})`}
              {studentUser.section && ` (Section: ${studentUser.section})`}
              - You can now enroll in courses.
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-xs">
                  Debug: userId={studentUser.userId}, enrollmentLoading={enrollmentLoading}
                  {enrollmentCount === 0 && (
                    <Button
                      onClick={() => window.location.reload()}
                      size="sm"
                      variant="outline"
                      className="ml-2"
                    >
                      Reload Page
                    </Button>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Error/Success Alert */}
        {enrollmentError && (
          <Alert className={`mb-6 ${enrollmentError.includes('Successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={enrollmentError.includes('Successfully') ? 'text-green-800' : 'text-red-800'}>
              {enrollmentError}
            </AlertDescription>
          </Alert>
        )}



        {/* Stats Cards */}
        <section className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-xs text-muted-foreground">Total Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{enrollmentCount}</p>
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{semesters.length}</p>
                  <p className="text-xs text-muted-foreground">Semesters</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{courses.filter(c => c.is_highlighted).length}</p>
                  <p className="text-xs text-muted-foreground">Featured</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Filters and Controls */}
        <section className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses, codes, or instructors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {semesters.map((semester) => (
                        <SelectItem key={semester} value={semester}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="course_code">Course Code</SelectItem>
                      <SelectItem value="teacher">Instructor</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Course Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Courses ({filteredCourses.length})</TabsTrigger>
            <TabsTrigger value="enrolled">Enrolled ({enrollmentCount})</TabsTrigger>
            <TabsTrigger value="featured">Featured ({courses.filter(c => c.is_highlighted).length})</TabsTrigger>
          </TabsList>

          {/* All Courses */}
          <TabsContent value="all" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading courses...</span>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className={cn(
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-4"
              )}>
                {filteredCourses.map((course) => (
                  <ProfessionalCourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={isEnrolledInCourse(course.id)}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                    onViewDetails={handleViewDetails}
                    variant={viewMode === "list" ? "compact" : "default"}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Enrolled Courses */}
          <TabsContent value="enrolled" className="space-y-6">
            {enrollmentCount === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No enrolled courses</h3>
                <p className="text-muted-foreground">Start by enrolling in some courses from the "All Courses" tab</p>
                <Button
                  onClick={refreshEnrolledCourses}
                  variant="outline"
                  className="mt-4"
                  disabled={enrollmentLoading}
                >
                  {enrollmentLoading ? "Refreshing..." : "Refresh Enrollments"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses
                  .filter(course => isEnrolledInCourse(course.id))
                  .map((course) => (
                    <EnrolledCourseDetail
                      key={course.id}
                      course={course}
                      isExpanded={isCourseExpanded(course.id)}
                      onToggle={() => toggleCourse(course.id)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Featured Courses */}
          <TabsContent value="featured" className="space-y-6">
            {courses.filter(c => c.is_highlighted).length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No featured courses</h3>
                <p className="text-muted-foreground">Featured courses will appear here when available</p>
              </div>
            ) : (
              <div className={cn(
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-4"
              )}>
                {courses
                  .filter(course => course.is_highlighted)
                  .map((course) => (
                    <ProfessionalCourseCard
                      key={course.id}
                      course={course}
                      isEnrolled={isEnrolledInCourse(course.id)}
                      onEnroll={handleEnroll}
                      onUnenroll={handleUnenroll}
                      onViewDetails={handleViewDetails}
                      variant={viewMode === "list" ? "compact" : "detailed"}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function CoursesPage() {
  return (
    <CourseEnrollmentProvider>
      <CoursesPageContent />
    </CourseEnrollmentProvider>
  )
}

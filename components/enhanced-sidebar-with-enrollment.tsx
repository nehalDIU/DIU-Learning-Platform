"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FunctionalSidebar } from "@/components/functional-sidebar"
import { ProfessionalCourseCard } from "@/components/ui/professional-course-card"
import { useCourseEnrollmentContext } from "@/contexts/CourseEnrollmentContext"
import { 
  BookOpen, 
  Heart, 
  Calendar, 
  Star,
  ChevronRight,
  Loader2,
  GraduationCap
} from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"

interface EnhancedSidebarProps {
  onContentSelect: (content: any) => void
  selectedContentId?: string
}

export function EnhancedSidebarWithEnrollment({ onContentSelect, selectedContentId }: EnhancedSidebarProps) {
  const {
    enrolledCourses,
    enrollmentCount,
    loading: enrollmentLoading,
    isEnrolledInCourse,
    enrollInCourse,
    unenrollFromCourse
  } = useCourseEnrollmentContext()

  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState("semesters")

  const handleCourseSelect = (courseId: string) => {
    // Navigate to course content or open course details
    console.log('Selected course:', courseId)
  }

  const handleViewDetails = (courseId: string) => {
    // Open course details modal or navigate to course page
    console.log('View course details:', courseId)
  }

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollInCourse(courseId)
    } catch (error) {
      console.error('Failed to enroll:', error)
    }
  }

  const handleUnenroll = async (courseId: string) => {
    try {
      await unenrollFromCourse(courseId)
    } catch (error) {
      console.error('Failed to unenroll:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Tab Navigation */}
        <div className={`${isMobile ? 'px-3 py-2' : 'px-4 py-3'} border-b border-border bg-card/50`}>
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="semesters" className="text-xs sm:text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              Semesters
            </TabsTrigger>
            <TabsTrigger value="enrolled" className="text-xs sm:text-sm relative">
              <Heart className="h-4 w-4 mr-1" />
              Enrolled
              {enrollmentCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {enrollmentCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {/* Semesters Tab - Original Sidebar */}
          <TabsContent value="semesters" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <FunctionalSidebar
              onContentSelect={onContentSelect}
              selectedContentId={selectedContentId}
            />
          </TabsContent>

          {/* Enrolled Courses Tab */}
          <TabsContent value="enrolled" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className={`${isMobile ? 'px-3 py-2' : 'px-4 py-3'} border-b border-border/50`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">My Courses</h3>
                  <Badge variant="outline" className="text-xs">
                    {enrollmentCount} enrolled
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Access your enrolled course content
                </p>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1">
                <div className={`${isMobile ? 'p-2 space-y-2' : 'p-3 space-y-3'}`}>
                  {enrollmentLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading courses...</span>
                    </div>
                  ) : enrolledCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">No enrolled courses</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Visit the Courses page to enroll in courses
                      </p>
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
                  ) : (
                    <div className="space-y-2">
                      {enrolledCourses.map((course) => (
                        <ProfessionalCourseCard
                          key={course.id}
                          course={course}
                          isEnrolled={true}
                          onEnroll={handleEnroll}
                          onUnenroll={handleUnenroll}
                          onViewDetails={handleViewDetails}
                          variant="compact"
                          showProgress={true}
                          className="hover:bg-accent/30 transition-colors"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer Actions */}
              {enrolledCourses.length > 0 && (
                <div className={`${isMobile ? 'px-3 py-2' : 'px-4 py-3'} border-t border-border/50 bg-card/30`}>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => window.location.href = '/courses'}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Browse More
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        // Show progress summary or analytics
                        console.log('Show progress summary')
                      }}
                    >
                      <GraduationCap className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

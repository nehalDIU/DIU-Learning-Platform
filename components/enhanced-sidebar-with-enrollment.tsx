"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FunctionalSidebar } from "@/components/functional-sidebar"

import { EnrolledCourseSidebar } from "@/components/enrolled-course-sidebar"
import { useCourseEnrollmentContext } from "@/contexts/CourseEnrollmentContext"
import {
  BookOpen,
  Heart,
  Calendar
} from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"

interface EnhancedSidebarProps {
  onContentSelect: (content: any) => void
  selectedContentId?: string
}

export function EnhancedSidebarWithEnrollment({ onContentSelect, selectedContentId }: EnhancedSidebarProps) {
  const { enrollmentCount } = useCourseEnrollmentContext()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState("semesters")

  return (
    <div className="h-full flex flex-col bg-background sidebar-content-container">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Tab Navigation - Enhanced Mobile */}
        <div className={`${isMobile ? 'px-2 py-2' : 'px-4 py-3'} border-b border-border bg-card/50`}>
          <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-10 bg-muted/50' : 'bg-muted/50'}`}>
            <TabsTrigger
              value="semesters"
              className={`${isMobile ? 'text-xs px-2 py-1.5 touch-manipulation' : 'text-xs sm:text-sm'} transition-all duration-200`}
            >
              <Calendar className={`${isMobile ? 'h-3.5 w-3.5 mr-1' : 'h-4 w-4 mr-1'}`} />
              <span className={isMobile ? 'font-medium' : ''}>Semesters</span>
            </TabsTrigger>
            <TabsTrigger
              value="enrolled"
              className={`${isMobile ? 'text-xs px-2 py-1.5 touch-manipulation' : 'text-xs sm:text-sm'} relative transition-all duration-200`}
            >
              <Heart className={`${isMobile ? 'h-3.5 w-3.5 mr-1' : 'h-4 w-4 mr-1'}`} />
              <span className={isMobile ? 'font-medium' : ''}>Enrolled</span>
              {enrollmentCount > 0 && (
                <Badge
                  variant="secondary"
                  className={`ml-1 ${isMobile ? 'h-4 w-4 p-0 text-xs' : 'h-5 w-5 p-0 text-xs'} flex items-center justify-center`}
                >
                  {enrollmentCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {/* Semesters Tab - Original Sidebar */}
          <TabsContent value="semesters" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col sidebar-content-container">
            <FunctionalSidebar
              onContentSelect={onContentSelect}
              selectedContentId={selectedContentId}
            />
          </TabsContent>

          {/* Enrolled Courses Tab */}
          <TabsContent value="enrolled" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col sidebar-content-container">
            <EnrolledCourseSidebar
              onContentSelect={onContentSelect}
              selectedContentId={selectedContentId}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

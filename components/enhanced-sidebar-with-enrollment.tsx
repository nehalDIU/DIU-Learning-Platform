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

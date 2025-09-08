"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useCourseEnrollment } from '@/hooks/useCourseEnrollment'
import { useStudentUserId } from '@/contexts/SectionContext'

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
  enrollment?: {
    id: string
    status: string
    progress_percentage: number
    enrollment_date: string
    last_accessed?: string
    completion_date?: string
  }
}

interface CourseEnrollmentContextType {
  // State
  enrolledCourses: Course[]
  enrolledCourseIds: Set<string>
  loading: boolean
  error: string | null
  
  // Actions
  enrollInCourse: (courseId: string) => Promise<any>
  unenrollFromCourse: (courseId: string) => Promise<any>
  isEnrolledInCourse: (courseId: string) => boolean
  getEnrollmentDetails: (courseId: string) => any
  updateCourseProgress: (courseId: string, progressData: any) => Promise<void>
  refreshEnrolledCourses: () => Promise<void>
  
  // Computed values
  enrollmentCount: number
  hasEnrollments: boolean
}

const CourseEnrollmentContext = createContext<CourseEnrollmentContextType | undefined>(undefined)

interface CourseEnrollmentProviderProps {
  children: ReactNode
  userId?: string
}

export function CourseEnrollmentProvider({ children, userId }: CourseEnrollmentProviderProps) {
  // Use section-based user ID if available, otherwise fall back to provided userId
  const sectionUserId = useStudentUserId()
  const effectiveUserId = sectionUserId || userId

  const enrollmentData = useCourseEnrollment(effectiveUserId)

  return (
    <CourseEnrollmentContext.Provider value={enrollmentData}>
      {children}
    </CourseEnrollmentContext.Provider>
  )
}

export function useCourseEnrollmentContext() {
  const context = useContext(CourseEnrollmentContext)
  
  if (context === undefined) {
    throw new Error('useCourseEnrollmentContext must be used within a CourseEnrollmentProvider')
  }
  
  return context
}

// Higher-order component for easy integration
export function withCourseEnrollment<P extends object>(
  Component: React.ComponentType<P>,
  userId?: string
) {
  return function WrappedComponent(props: P) {
    return (
      <CourseEnrollmentProvider userId={userId}>
        <Component {...props} />
      </CourseEnrollmentProvider>
    )
  }
}

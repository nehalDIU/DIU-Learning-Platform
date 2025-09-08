"use client"

import { useState, useEffect, useCallback } from 'react'

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

interface EnrollmentState {
  enrolledCourses: Course[]
  enrolledCourseIds: Set<string>
  loading: boolean
  error: string | null
}

export function useCourseEnrollment(userId?: string) {
  const [state, setState] = useState<EnrollmentState>({
    enrolledCourses: [],
    enrolledCourseIds: new Set(),
    loading: true,
    error: null
  })

  // Fetch enrolled courses
  const fetchEnrolledCourses = useCallback(async () => {
    try {
      console.log('useCourseEnrollment: fetchEnrolledCourses called', { userId })
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Only fetch if we have a user ID
      if (!userId) {
        console.log('useCourseEnrollment: No user ID available, setting empty state')
        setState(prev => ({
          ...prev,
          enrolledCourses: [],
          enrolledCourseIds: new Set(),
          loading: false,
          error: null
        }))
        return
      }

      const params = new URLSearchParams()
      params.append('userId', userId)

      console.log('useCourseEnrollment: Fetching enrolled courses for user:', userId)
      const response = await fetch(`/api/courses/enrolled?${params}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('useCourseEnrollment: Failed to fetch enrolled courses', { status: response.status, errorData })

        // Don't throw error for 404 or empty results, just return empty array
        if (response.status === 404) {
          console.log('useCourseEnrollment: No enrollments found, setting empty state')
          setState(prev => ({
            ...prev,
            enrolledCourses: [],
            enrolledCourseIds: new Set(),
            loading: false,
            error: null
          }))
          return
        }

        throw new Error(errorData.error || `Failed to fetch enrolled courses (${response.status})`)
      }

      const enrolledCourses = await response.json()
      const enrolledCourseIds = new Set(enrolledCourses.map((course: Course) => course.id))

      console.log('useCourseEnrollment: Enrolled courses fetched successfully', {
        count: enrolledCourses.length,
        courseIds: Array.from(enrolledCourseIds)
      })

      setState(prev => ({
        ...prev,
        enrolledCourses,
        enrolledCourseIds,
        loading: false,
        error: null
      }))
    } catch (error) {
      console.error('useCourseEnrollment: Error fetching enrolled courses:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load enrolled courses'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        // Keep existing data if this is a refresh
        enrolledCourses: prev.enrolledCourses,
        enrolledCourseIds: prev.enrolledCourseIds
      }))
    }
  }, [userId])

  // Enroll in a course
  const enrollInCourse = useCallback(async (courseId: string) => {
    try {
      // Clear any previous errors
      setState(prev => ({ ...prev, error: null }))

      // Check if user is authenticated
      if (!userId) {
        throw new Error('You must be logged in to enroll in courses')
      }

      console.log('useCourseEnrollment: enrollInCourse called', { courseId, userId })

      // Check if already enrolled to prevent duplicate enrollments
      if (state.enrolledCourseIds.has(courseId)) {
        console.log('useCourseEnrollment: User already enrolled in course', courseId)
        throw new Error('You are already enrolled in this course')
      }

      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, userId })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.error || `Failed to enroll in course (${response.status})`
        console.error('Enrollment API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          courseId,
          userId
        })
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('useCourseEnrollment: Enrollment API success:', result)

      // Update local state optimistically
      setState(prev => ({
        ...prev,
        enrolledCourseIds: new Set([...prev.enrolledCourseIds, courseId]),
        error: null
      }))

      // Refresh enrolled courses to get complete data
      console.log('useCourseEnrollment: Refreshing enrolled courses after enrollment')
      await fetchEnrolledCourses()

      return result
    } catch (error) {
      console.error('Error enrolling in course:', error)

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in course'
      setState(prev => ({
        ...prev,
        error: errorMessage
      }))

      throw new Error(errorMessage)
    }
  }, [userId, fetchEnrolledCourses, state.enrolledCourseIds])

  // Unenroll from a course
  const unenrollFromCourse = useCallback(async (courseId: string) => {
    try {
      const response = await fetch('/api/courses/unenroll', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, userId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unenroll from course')
      }

      const result = await response.json()
      
      // Update local state optimistically
      setState(prev => {
        const newEnrolledCourseIds = new Set(prev.enrolledCourseIds)
        newEnrolledCourseIds.delete(courseId)

        return {
          ...prev,
          enrolledCourseIds: newEnrolledCourseIds,
          enrolledCourses: prev.enrolledCourses.filter(course => course.id !== courseId)
        }
      })

      // Refresh enrolled courses to get complete data
      console.log('useCourseEnrollment: Refreshing enrolled courses after unenrollment')
      await fetchEnrolledCourses()

      return result
    } catch (error) {
      console.error('Error unenrolling from course:', error)
      throw error
    }
  }, [userId])

  // Check if user is enrolled in a specific course
  const isEnrolledInCourse = useCallback((courseId: string) => {
    return state.enrolledCourseIds.has(courseId)
  }, [state.enrolledCourseIds])

  // Get enrollment details for a specific course
  const getEnrollmentDetails = useCallback((courseId: string) => {
    const course = state.enrolledCourses.find(c => c.id === courseId)
    return course?.enrollment || null
  }, [state.enrolledCourses])

  // Update progress for a course (for future use)
  const updateCourseProgress = useCallback(async (courseId: string, progressData: any) => {
    try {
      // This would be implemented when we add progress tracking
      console.log('Update progress for course:', courseId, progressData)
      
      // For now, just refresh the enrolled courses
      await fetchEnrolledCourses()
    } catch (error) {
      console.error('Error updating course progress:', error)
      throw error
    }
  }, [fetchEnrolledCourses])

  // Initialize by fetching enrolled courses
  useEffect(() => {
    fetchEnrolledCourses()
  }, [fetchEnrolledCourses])

  return {
    // State
    enrolledCourses: state.enrolledCourses,
    enrolledCourseIds: state.enrolledCourseIds,
    loading: state.loading,
    error: state.error,
    
    // Actions
    enrollInCourse,
    unenrollFromCourse,
    isEnrolledInCourse,
    getEnrollmentDetails,
    updateCourseProgress,
    refreshEnrolledCourses: fetchEnrolledCourses,
    
    // Computed values
    enrollmentCount: state.enrolledCourses.length,
    hasEnrollments: state.enrolledCourses.length > 0
  }
}

"use client"

import { useState, useCallback } from "react"

export function useEnrolledCourseExpansion() {
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())

  const toggleCourse = useCallback((courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }, [])

  const isCourseExpanded = useCallback((courseId: string) => {
    return expandedCourses.has(courseId)
  }, [expandedCourses])

  const expandCourse = useCallback((courseId: string) => {
    setExpandedCourses(prev => new Set(prev).add(courseId))
  }, [])

  const collapseCourse = useCallback((courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev)
      newSet.delete(courseId)
      return newSet
    })
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedCourses(new Set())
  }, [])

  const expandAll = useCallback((courseIds: string[]) => {
    setExpandedCourses(new Set(courseIds))
  }, [])

  return {
    expandedCourses,
    toggleCourse,
    isCourseExpanded,
    expandCourse,
    collapseCourse,
    collapseAll,
    expandAll
  }
}

"use client"

import React, { useState } from "react"
import { EnrolledCourseDetail } from "@/components/enrolled-course-detail"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

// Sample course data - using actual course IDs that might exist in the database
const sampleCourse = {
  id: "sample-course-1",
  title: "Data Mining and Machine Learning",
  course_code: "CSE325",
  teacher_name: "Samia Nawshin",
  description: "Advanced course covering data mining techniques, machine learning algorithms, and their practical applications.",
  credits: 3,
  enrollment: {
    progress_percentage: 65,
    enrollment_date: "2024-01-15",
    last_accessed: "2024-03-10"
  }
}

const sampleCourseWithoutProgress = {
  id: "sample-course-2",
  title: "Advanced Database Systems and Big Data Analytics",
  course_code: "CSE326",
  teacher_name: "Dr. Ahmed Rahman",
  description: "Comprehensive study of modern database systems, NoSQL databases, and big data processing frameworks.",
  credits: 4,
  enrollment: {
    progress_percentage: 0,
    enrollment_date: "2024-03-01",
    last_accessed: "2024-03-01"
  }
}

export default function ImprovedCoursePage() {
  const [expandedCourse1, setExpandedCourse1] = useState(false)
  const [expandedCourse2, setExpandedCourse2] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setExpandedCourse1(false)
    setExpandedCourse2(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Improved Course Component
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enhanced responsive design with better visual hierarchy, improved spacing, and professional styling
          </p>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Demo
          </Button>
        </div>

        {/* Course Examples */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Course with Progress
            </h2>
            <EnrolledCourseDetail
              key={`course1-${refreshKey}`}
              course={sampleCourse}
              isExpanded={expandedCourse1}
              onToggle={() => setExpandedCourse1(!expandedCourse1)}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              New Course (No Progress)
            </h2>
            <EnrolledCourseDetail
              key={`course2-${refreshKey}`}
              course={sampleCourseWithoutProgress}
              isExpanded={expandedCourse2}
              onToggle={() => setExpandedCourse2(!expandedCourse2)}
            />
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            ✨ Improvements Made
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Visual Enhancements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gradient backgrounds and borders</li>
                <li>• Better color-coded sections</li>
                <li>• Improved hover effects</li>
                <li>• Enhanced typography hierarchy</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Responsive Design</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Mobile-first approach</li>
                <li>• Flexible grid layouts</li>
                <li>• Optimized spacing</li>
                <li>• Better content organization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

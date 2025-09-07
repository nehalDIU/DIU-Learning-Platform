"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  BookOpen, 
  FileText, 
  Play, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

interface SectionStats {
  semesterCount: number
  activeSemesters: number
  courseCount: number
  topicCount: number
  slideCount: number
  videoCount: number
  studyToolCount: number
  totalStudents: number
  recentActivity: number
  completionRate: number
}

export function SectionAdminStats() {
  const [stats, setStats] = useState<SectionStats>({
    semesterCount: 0,
    activeSemesters: 0,
    courseCount: 0,
    topicCount: 0,
    slideCount: 0,
    videoCount: 0,
    studyToolCount: 0,
    totalStudents: 0,
    recentActivity: 0,
    completionRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/section-admin/stats')
        
        if (!response.ok) {
          throw new Error(`Failed to load statistics: ${response.status}`)
        }
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error loading section admin stats:', error)
        setError(error instanceof Error ? error.message : 'Failed to load statistics')
        
        // Set mock data for development
        setStats({
          semesterCount: 8,
          activeSemesters: 3,
          courseCount: 24,
          topicCount: 156,
          slideCount: 342,
          videoCount: 89,
          studyToolCount: 67,
          totalStudents: 450,
          recentActivity: 23,
          completionRate: 78,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const statsData = [
    {
      title: "Total Semesters",
      value: stats.semesterCount,
      icon: Calendar,
      description: `${stats.activeSemesters} active`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: stats.activeSemesters > 0 ? "up" : "neutral",
      trendValue: stats.activeSemesters
    },
    {
      title: "Total Courses",
      value: stats.courseCount,
      icon: BookOpen,
      description: "Across all semesters",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "up",
      trendValue: 12
    },
    {
      title: "Learning Topics",
      value: stats.topicCount,
      icon: FileText,
      description: "Content topics",
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up",
      trendValue: 8
    },
    {
      title: "Content Items",
      value: stats.slideCount + stats.videoCount + stats.studyToolCount,
      icon: Play,
      description: `${stats.slideCount} slides, ${stats.videoCount} videos`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "up",
      trendValue: 15
    },
    {
      title: "Students Enrolled",
      value: stats.totalStudents,
      icon: Users,
      description: "Active learners",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      trend: "up",
      trendValue: 23
    },
    {
      title: "Recent Activity",
      value: stats.recentActivity,
      icon: Activity,
      description: "Last 7 days",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "up",
      trendValue: 5
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: CheckCircle2,
      description: "Average completion",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      trend: stats.completionRate > 75 ? "up" : "down",
      trendValue: 3
    },
    {
      title: "Study Tools",
      value: stats.studyToolCount,
      icon: Clock,
      description: "Available resources",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      trend: "up",
      trendValue: 4
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Failed to load statistics</p>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Showing sample data for demonstration purposes.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              {stat.trend !== "neutral" && (
                <div className="flex items-center gap-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {stat.trendValue}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

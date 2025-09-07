"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Calendar, 
  BookOpen, 
  FileText, 
  Play, 
  Plus,
  Edit3,
  Trash2,
  Eye,
  Clock,
  User,
  Activity,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

interface ActivityItem {
  id: string
  type: 'semester_created' | 'course_added' | 'topic_updated' | 'content_uploaded' | 'semester_updated' | 'course_deleted'
  title: string
  description: string
  timestamp: string
  user: string
  metadata?: {
    semesterId?: string
    courseId?: string
    topicId?: string
    [key: string]: any
  }
}

export function RecentSectionActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // For now, we'll use mock data since the API might not be implemented yet
        // const response = await fetch('/api/section-admin/activity')
        // const data = await response.json()
        
        // Mock data for demonstration
        const mockActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'semester_created',
            title: 'Spring 2025 Semester Created',
            description: 'New semester with 6 courses and 45 topics',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            user: 'Dr. Sarah Ahmed',
            metadata: { semesterId: 'sem_123' }
          },
          {
            id: '2',
            type: 'course_added',
            title: 'Database Management Course Added',
            description: 'Added to Fall 2024 semester with 8 topics',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
            user: 'Prof. Mohammad Rahman',
            metadata: { courseId: 'course_456', semesterId: 'sem_124' }
          },
          {
            id: '3',
            type: 'topic_updated',
            title: 'SQL Fundamentals Topic Updated',
            description: 'Added 3 new video lectures and 2 study materials',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            user: 'Dr. Sarah Ahmed',
            metadata: { topicId: 'topic_789', courseId: 'course_456' }
          },
          {
            id: '4',
            type: 'content_uploaded',
            title: 'New Study Materials Uploaded',
            description: 'Previous question papers for Midterm exam',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            user: 'Prof. Mohammad Rahman',
            metadata: { courseId: 'course_456' }
          },
          {
            id: '5',
            type: 'semester_updated',
            title: 'Fall 2024 Semester Updated',
            description: 'Modified exam schedule and course credits',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            user: 'Dr. Sarah Ahmed',
            metadata: { semesterId: 'sem_124' }
          }
        ]
        
        setActivities(mockActivities)
      } catch (error) {
        console.error('Error loading activity:', error)
        setError(error instanceof Error ? error.message : 'Failed to load activity')
      } finally {
        setIsLoading(false)
      }
    }

    loadActivity()
  }, [])

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'semester_created':
      case 'semester_updated':
        return Calendar
      case 'course_added':
        return BookOpen
      case 'topic_updated':
        return FileText
      case 'content_uploaded':
        return Play
      case 'course_deleted':
        return Trash2
      default:
        return Activity
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'semester_created':
        return 'text-blue-600 bg-blue-50'
      case 'course_added':
        return 'text-green-600 bg-green-50'
      case 'topic_updated':
        return 'text-orange-600 bg-orange-50'
      case 'content_uploaded':
        return 'text-purple-600 bg-purple-50'
      case 'semester_updated':
        return 'text-indigo-600 bg-indigo-50'
      case 'course_deleted':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'semester_created':
        return { text: 'Created', variant: 'default' as const }
      case 'course_added':
        return { text: 'Added', variant: 'secondary' as const }
      case 'topic_updated':
        return { text: 'Updated', variant: 'outline' as const }
      case 'content_uploaded':
        return { text: 'Uploaded', variant: 'secondary' as const }
      case 'semester_updated':
        return { text: 'Modified', variant: 'outline' as const }
      case 'course_deleted':
        return { text: 'Deleted', variant: 'destructive' as const }
      default:
        return { text: 'Activity', variant: 'outline' as const }
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return time.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/SectionAdmin/activity">
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Failed to load activity</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              const colorClasses = getActivityColor(activity.type)
              const badge = getActivityBadge(activity.type)
              
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full ${colorClasses}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {activity.user}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.text}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link href="/SectionAdmin/activity">
                <Activity className="h-4 w-4 mr-2" />
                View All Activity
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

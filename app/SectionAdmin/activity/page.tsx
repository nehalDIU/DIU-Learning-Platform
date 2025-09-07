"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Activity, 
  Calendar, 
  BookOpen, 
  FileText, 
  Play,
  Plus,
  Edit3,
  Trash2,
  Eye,
  User,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"

interface ActivityItem {
  id: string
  type: 'semester_created' | 'course_added' | 'topic_updated' | 'content_uploaded' | 'semester_updated' | 'course_deleted' | 'student_enrolled'
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

export default function SectionAdminActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterUser, setFilterUser] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setIsLoading(true)
        
        // Mock data for demonstration
        const mockActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'semester_created',
            title: 'Spring 2025 Semester Created',
            description: 'New semester with 6 courses and 45 topics created successfully',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: 'Dr. Sarah Ahmed',
            metadata: { semesterId: 'sem_123' }
          },
          {
            id: '2',
            type: 'course_added',
            title: 'Database Management Course Added',
            description: 'Added to Fall 2024 semester with 8 topics and study materials',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            user: 'Prof. Mohammad Rahman',
            metadata: { courseId: 'course_456', semesterId: 'sem_124' }
          },
          {
            id: '3',
            type: 'topic_updated',
            title: 'SQL Fundamentals Topic Updated',
            description: 'Added 3 new video lectures and 2 study materials to improve learning experience',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Dr. Sarah Ahmed',
            metadata: { topicId: 'topic_789', courseId: 'course_456' }
          },
          {
            id: '4',
            type: 'content_uploaded',
            title: 'New Study Materials Uploaded',
            description: 'Previous question papers for Midterm exam uploaded for Database Management course',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Prof. Mohammad Rahman',
            metadata: { courseId: 'course_456' }
          },
          {
            id: '5',
            type: 'semester_updated',
            title: 'Fall 2024 Semester Updated',
            description: 'Modified exam schedule and updated course credits for better academic planning',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Dr. Sarah Ahmed',
            metadata: { semesterId: 'sem_124' }
          },
          {
            id: '6',
            type: 'student_enrolled',
            title: 'New Student Enrollments',
            description: '15 new students enrolled in Spring 2025 semester',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'System',
            metadata: { semesterId: 'sem_123', count: 15 }
          },
          {
            id: '7',
            type: 'course_deleted',
            title: 'Outdated Course Removed',
            description: 'Legacy Programming course removed from Fall 2023 semester',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Dr. Sarah Ahmed',
            metadata: { courseId: 'course_old', semesterId: 'sem_old' }
          }
        ]
        
        setActivities(mockActivities)
      } catch (error) {
        console.error('Error loading activity:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadActivity()
  }, [])

  // Filter activities
  useEffect(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.user.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === "all" || activity.type === filterType
      const matchesUser = filterUser === "all" || activity.user === filterUser
      
      let matchesDate = true
      if (filterDate !== "all") {
        const activityDate = new Date(activity.timestamp)
        const now = new Date()
        
        switch (filterDate) {
          case "today":
            matchesDate = activityDate.toDateString() === now.toDateString()
            break
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = activityDate >= weekAgo
            break
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesDate = activityDate >= monthAgo
            break
        }
      }

      return matchesSearch && matchesType && matchesUser && matchesDate
    })

    setFilteredActivities(filtered)
  }, [activities, searchTerm, filterType, filterUser, filterDate])

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
      case 'student_enrolled':
        return User
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
      case 'student_enrolled':
        return 'text-emerald-600 bg-emerald-50'
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
      case 'student_enrolled':
        return { text: 'Enrolled', variant: 'default' as const }
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

  const uniqueUsers = Array.from(new Set(activities.map(a => a.user))).sort()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Activity Log</h2>
          <p className="text-muted-foreground">Track all activities and changes in your section</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="semester_created">Semester Created</SelectItem>
                  <SelectItem value="course_added">Course Added</SelectItem>
                  <SelectItem value="topic_updated">Topic Updated</SelectItem>
                  <SelectItem value="content_uploaded">Content Uploaded</SelectItem>
                  <SelectItem value="semester_updated">Semester Updated</SelectItem>
                  <SelectItem value="course_deleted">Course Deleted</SelectItem>
                  <SelectItem value="student_enrolled">Student Enrolled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>User</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Results</Label>
              <div className="text-sm text-muted-foreground pt-2">
                {filteredActivities.length} of {activities.length} activities
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No activities found</h3>
            <p className="text-muted-foreground text-center">
              {activities.length === 0 
                ? "No activities recorded yet"
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const colorClasses = getActivityColor(activity.type)
            const badge = getActivityBadge(activity.type)
            
            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
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
                          <div className="flex items-center gap-4 mt-2">
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
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

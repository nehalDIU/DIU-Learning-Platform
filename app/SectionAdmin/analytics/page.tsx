"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar,
  FileText,
  Play,
  Download,
  RefreshCw,
  Eye,
  Clock,
  Target,
  Award
} from "lucide-react"

export default function SectionAdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>
          <p className="text-muted-foreground">Monitor performance and engagement metrics for your section</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82.5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1</span> points improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Student Engagement Trends
            </CardTitle>
            <CardDescription>
              Weekly engagement metrics across all courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">Chart visualization would be here</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Integration with charting library needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Performance
            </CardTitle>
            <CardDescription>
              Performance metrics by course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Database Management</p>
                  <p className="text-sm text-muted-foreground">CS-401</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">92%</p>
                  <p className="text-xs text-green-600">+5%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Web Development</p>
                  <p className="text-sm text-muted-foreground">CS-402</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">88%</p>
                  <p className="text-xs text-green-600">+3%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Data Structures</p>
                  <p className="text-sm text-muted-foreground">CS-403</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">85%</p>
                  <p className="text-xs text-red-600">-2%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Software Engineering</p>
                  <p className="text-sm text-muted-foreground">CS-404</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">90%</p>
                  <p className="text-xs text-green-600">+7%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Usage Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Content Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Video Lectures</span>
                <span className="font-medium">2,450</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Study Materials</span>
                <span className="font-medium">1,890</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Previous Questions</span>
                <span className="font-medium">3,120</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Slides</span>
                <span className="font-medium">1,650</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average per Student</span>
                <span className="font-medium">4.2h/week</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Peak Study Hours</span>
                <span className="font-medium">8-10 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Most Active Day</span>
                <span className="font-medium">Sunday</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Study Time</span>
                <span className="font-medium">1,890h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Downloads</span>
                <span className="font-medium">5,670</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bookmarks</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Shares</span>
                <span className="font-medium">890</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Comments</span>
                <span className="font-medium">456</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Summary</CardTitle>
          <CardDescription>
            Key activities and milestones from the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">New Semester</span>
              </div>
              <p className="text-sm text-blue-700">Spring 2025 created with 6 courses</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Course Updates</span>
              </div>
              <p className="text-sm text-green-700">3 courses updated with new content</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Student Growth</span>
              </div>
              <p className="text-sm text-purple-700">45 new students enrolled</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Play className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Content Added</span>
              </div>
              <p className="text-sm text-orange-700">12 new videos and 8 study materials</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

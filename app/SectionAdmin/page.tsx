"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SectionAdminStats } from "@/components/section-admin/section-admin-stats"
import { RecentSectionActivity } from "@/components/section-admin/recent-section-activity"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  GraduationCap, 
  Plus, 
  List, 
  BookOpen, 
  FileText, 
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Clock
} from "lucide-react"

export default function SectionAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-8 w-8" />
                Section Admin Dashboard
              </h1>
              <p className="text-blue-100">
                Manage your section's academic content and monitor performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Link href="/SectionAdmin/semester-management">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Semester
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Statistics */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <SectionAdminStats />
      </Suspense>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Semester Management */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Semester Management
            </CardTitle>
            <CardDescription>
              Create and manage semester structures with courses and content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/SectionAdmin/semester-management">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Semester
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/SectionAdmin/semesters">
                  <List className="h-4 w-4 mr-2" />
                  View All Semesters
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Course Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              Course Management
            </CardTitle>
            <CardDescription>
              Manage courses, topics, and study materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/SectionAdmin/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Courses
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/SectionAdmin/topics">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Topics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Analytics & Reports
            </CardTitle>
            <CardDescription>
              Monitor performance and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/SectionAdmin/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/SectionAdmin/reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ActivityLoadingSkeleton />}>
          <RecentSectionActivity />
        </Suspense>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Active Semesters</span>
                </div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Total Courses</span>
                </div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Students Enrolled</span>
                </div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ActivityLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

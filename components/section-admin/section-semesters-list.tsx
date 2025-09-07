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
  Calendar, 
  BookOpen, 
  FileText, 
  Users, 
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3
} from "lucide-react"
import Link from "next/link"

interface SemesterSummary {
  id: string
  title: string
  description: string
  section: string
  semester_type: 'Fall' | 'Spring' | 'Summer'
  year: number
  exam_type: 'Midterm' | 'Final' | 'Both'
  has_midterm: boolean
  has_final: boolean
  is_active: boolean
  courses_count: number
  topics_count: number
  materials_count: number
  study_resources_count: number
  students_count: number
  created_at: string
  updated_at: string
}

export function SectionSemestersList() {
  const [semesters, setSemesters] = useState<SemesterSummary[]>([])
  const [filteredSemesters, setFilteredSemesters] = useState<SemesterSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterYear, setFilterYear] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/section-admin/semesters')
        
        if (!response.ok) {
          throw new Error('Failed to load semesters')
        }
        
        const data = await response.json()
        setSemesters(data || [])
      } catch (error) {
        console.error('Error loading semesters:', error)
        // Mock data for development
        setSemesters([
          {
            id: '1',
            title: 'Fall 2024',
            description: 'Fall semester 2024 for Computer Science',
            section: 'CS-A',
            semester_type: 'Fall',
            year: 2024,
            exam_type: 'Both',
            has_midterm: true,
            has_final: true,
            is_active: true,
            courses_count: 6,
            topics_count: 24,
            materials_count: 48,
            study_resources_count: 12,
            students_count: 45,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Spring 2024',
            description: 'Spring semester 2024 for Computer Science',
            section: 'CS-A',
            semester_type: 'Spring',
            year: 2024,
            exam_type: 'Both',
            has_midterm: true,
            has_final: true,
            is_active: false,
            courses_count: 5,
            topics_count: 20,
            materials_count: 40,
            study_resources_count: 10,
            students_count: 42,
            created_at: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            title: 'Summer 2024',
            description: 'Summer semester 2024 for Computer Science',
            section: 'CS-A',
            semester_type: 'Summer',
            year: 2024,
            exam_type: 'Final',
            has_midterm: false,
            has_final: true,
            is_active: false,
            courses_count: 3,
            topics_count: 12,
            materials_count: 24,
            study_resources_count: 6,
            students_count: 28,
            created_at: new Date(Date.now() - 8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadSemesters()
  }, [])

  // Filter semesters
  useEffect(() => {
    let filtered = semesters.filter(semester => {
      const matchesSearch = semester.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           semester.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === "all" ||
                           (filterStatus === "active" && semester.is_active) ||
                           (filterStatus === "inactive" && !semester.is_active)
      
      const matchesYear = filterYear === "all" || semester.year.toString() === filterYear
      const matchesType = filterType === "all" || semester.semester_type === filterType

      return matchesSearch && matchesStatus && matchesYear && matchesType
    })

    setFilteredSemesters(filtered)
  }, [semesters, searchTerm, filterStatus, filterYear, filterType])

  const uniqueYears = Array.from(new Set(semesters.map(s => s.year))).sort((a, b) => b - a)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-24" />
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
                  placeholder="Search semesters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <Button asChild className="w-full">
                <Link href="/SectionAdmin/semester-management">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Semesters Grid */}
      {filteredSemesters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No semesters found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {semesters.length === 0 
                ? "Create your first semester to get started"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            <Button asChild>
              <Link href="/SectionAdmin/semester-management">
                <Plus className="h-4 w-4 mr-2" />
                Create First Semester
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSemesters.map((semester) => (
            <Card key={semester.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{semester.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {semester.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {semester.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {semester.semester_type} {semester.year}
                  </Badge>
                  <Badge variant="outline">
                    {semester.section}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-blue-600" />
                      <span>{semester.courses_count} Courses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-green-600" />
                      <span>{semester.topics_count} Topics</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-purple-600" />
                      <span>{semester.students_count} Students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-orange-600" />
                      <span>{semester.study_resources_count} Resources</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(semester.updated_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" title="View Details">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Edit Semester">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Duplicate">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  BookOpen, 
  User, 
  Calendar,
  Clock,
  GraduationCap,
  Star,
  Heart,
  HeartOff,
  ChevronRight,
  Loader2,
  Play,
  FileText,
  Award,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"

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

interface ProfessionalCourseCardProps {
  course: Course
  isEnrolled: boolean
  onEnroll: (courseId: string) => void
  onUnenroll: (courseId: string) => void
  onViewDetails: (courseId: string) => void
  variant?: "default" | "compact" | "detailed"
  showProgress?: boolean
  className?: string
}

export function ProfessionalCourseCard({
  course,
  isEnrolled,
  onEnroll,
  onUnenroll,
  onViewDetails,
  variant = "default",
  showProgress = true,
  className
}: ProfessionalCourseCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleEnrollment = async () => {
    console.log('Course card: handleEnrollment called', { courseId: course.id, isEnrolled })
    setIsLoading(true)
    try {
      if (isEnrolled) {
        console.log('Course card: Attempting to unenroll from course', course.id)
        await onUnenroll(course.id)
        console.log('Course card: Unenrollment successful')
      } else {
        console.log('Course card: Attempting to enroll in course', course.id)
        await onEnroll(course.id)
        console.log('Course card: Enrollment successful')
      }
    } catch (error) {
      console.error('Course card: Enrollment/Unenrollment failed', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTeacherInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (variant === "compact") {
    return (
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        "border-border/60 hover:border-primary/20 bg-card/50 backdrop-blur-sm",
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Course Icon */}
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            
            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                {course.is_highlighted && (
                  <Star className="h-3 w-3 text-yellow-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {course.course_code}
                </Badge>
                <span className="truncate">{course.teacher_name}</span>
              </div>
            </div>

            {/* Enrollment Status */}
            <div className="shrink-0">
              {isEnrolled ? (
                <Badge variant="default" className="text-xs">
                  <Heart className="h-3 w-3 mr-1" />
                  Enrolled
                </Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEnrollment}
                  disabled={isLoading}
                  className="h-8 px-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Heart className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar for Enrolled Courses */}
          {isEnrolled && showProgress && course.enrollment && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{course.enrollment.progress_percentage}%</span>
              </div>
              <Progress value={course.enrollment.progress_percentage} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      "border-border/60 hover:border-primary/20 bg-card/50 backdrop-blur-sm",
      "cursor-pointer",
      className
    )}>
      {/* Highlight indicator */}
      {course.is_highlighted && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-primary z-10">
          <Star className="absolute -top-8 -right-8 h-4 w-4 text-primary-foreground transform rotate-45" />
        </div>
      )}

      {/* Enrollment Status Indicator */}
      {isEnrolled && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="default" className="text-xs shadow-sm">
            <Heart className="h-3 w-3 mr-1" />
            Enrolled
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
              {course.title}
            </CardTitle>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {course.course_code}
              </Badge>
              {course.credits && (
                <Badge variant="outline" className="text-xs">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  {course.credits} Credits
                </Badge>
              )}
            </div>
          </div>

          {/* Teacher Avatar */}
          <Avatar className="h-10 w-10 border-2 border-border group-hover:border-primary/30 transition-colors">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${course.teacher_name}`} />
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {getTeacherInitials(course.teacher_name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Teacher Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4 shrink-0" />
          <span className="truncate">{course.teacher_name}</span>
        </div>

        {/* Semester Info */}
        {course.semester && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {course.semester.title} - Section {course.semester.section}
            </span>
          </div>
        )}

        {/* Description */}
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Progress Section for Enrolled Courses */}
        {isEnrolled && showProgress && course.enrollment && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">Progress</span>
              </div>
              <span className="font-semibold text-primary">
                {course.enrollment.progress_percentage}%
              </span>
            </div>
            <Progress value={course.enrollment.progress_percentage} className="h-2 mb-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Enrolled: {formatDate(course.enrollment.enrollment_date)}</span>
              {course.enrollment.last_accessed && (
                <span>Last accessed: {formatDate(course.enrollment.last_accessed)}</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant={isEnrolled ? "destructive" : "default"}
            size="sm"
            onClick={handleEnrollment}
            disabled={isLoading}
            className="flex-1 group-hover:scale-105 transition-transform"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEnrolled ? (
              <>
                <HeartOff className="h-4 w-4 mr-1" />
                Unenroll
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-1" />
                Enroll
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(course.id)}
            className="group-hover:scale-105 transition-transform"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Course Stats (for detailed variant) */}
        {variant === "detailed" && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Topics</div>
              <div className="text-sm font-semibold">12</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="text-sm font-semibold">8 weeks</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Level</div>
              <div className="text-sm font-semibold">Advanced</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

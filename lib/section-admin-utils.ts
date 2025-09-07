import { type AdminUser } from "@/contexts/auth-context"

/**
 * Utility functions for Section Admin dashboard
 */

export function isSectionAdmin(user: AdminUser | null): boolean {
  return user?.role === "section_admin" || user?.role === "super_admin"
}

export function canAccessSectionAdmin(user: AdminUser | null): boolean {
  if (!user || !user.is_active) return false
  return isSectionAdmin(user)
}

export function getSectionFromUser(user: AdminUser | null): string | null {
  return user?.department || null
}

export function formatUserRole(role: string): string {
  return role.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "super_admin":
      return "bg-red-100 text-red-800"
    case "section_admin":
      return "bg-blue-100 text-blue-800"
    case "admin":
      return "bg-green-100 text-green-800"
    case "moderator":
      return "bg-yellow-100 text-yellow-800"
    case "content_creator":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function canManageSection(user: AdminUser | null, section: string): boolean {
  if (!user || !user.is_active) return false
  
  // Super admins can manage any section
  if (user.role === "super_admin") return true
  
  // Section admins can only manage their assigned section
  if (user.role === "section_admin") {
    return user.department === section
  }
  
  return false
}

export function getAvailableSections(user: AdminUser | null): string[] {
  if (!user || !user.is_active) return []
  
  // Super admins can see all sections (this would come from API in real app)
  if (user.role === "super_admin") {
    return ["CS-A", "CS-B", "EEE-A", "EEE-B", "BBA-A", "BBA-B"]
  }
  
  // Section admins can only see their section
  if (user.role === "section_admin" && user.department) {
    return [user.department]
  }
  
  return []
}

export function validateSemesterData(semester: any): string[] {
  const errors: string[] = []
  
  if (!semester.title?.trim()) {
    errors.push("Semester title is required")
  }
  
  if (!semester.section?.trim()) {
    errors.push("Section is required")
  }
  
  if (!semester.semester_type) {
    errors.push("Semester type is required")
  }
  
  if (!semester.year || semester.year < 2020 || semester.year > 2030) {
    errors.push("Valid year is required (2020-2030)")
  }
  
  if (!semester.exam_type) {
    errors.push("Exam type is required")
  }
  
  if (semester.start_date && semester.end_date) {
    const startDate = new Date(semester.start_date)
    const endDate = new Date(semester.end_date)
    if (startDate >= endDate) {
      errors.push("Start date must be before end date")
    }
  }
  
  return errors
}

export function validateCourseData(course: any): string[] {
  const errors: string[] = []
  
  if (!course.title?.trim()) {
    errors.push("Course title is required")
  }
  
  if (!course.course_code?.trim()) {
    errors.push("Course code is required")
  }
  
  if (!course.teacher_name?.trim()) {
    errors.push("Teacher name is required")
  }
  
  if (course.teacher_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(course.teacher_email)) {
    errors.push("Invalid email format")
  }
  
  if (course.credits && (course.credits < 0 || course.credits > 10)) {
    errors.push("Credits must be between 0 and 10")
  }
  
  return errors
}

export function validateTopicData(topic: any): string[] {
  const errors: string[] = []
  
  if (!topic.title?.trim()) {
    errors.push("Topic title is required")
  }
  
  // Validate files
  if (topic.files) {
    topic.files.forEach((file: any, index: number) => {
      if (file.title && !file.url) {
        errors.push(`File ${index + 1}: URL is required when title is provided`)
      }
      if (file.url && !isValidUrl(file.url)) {
        errors.push(`File ${index + 1}: Invalid URL format`)
      }
    })
  }
  
  // Validate videos
  if (topic.videos) {
    topic.videos.forEach((video: any, index: number) => {
      if (video.title && !video.url) {
        errors.push(`Video ${index + 1}: URL is required when title is provided`)
      }
      if (video.url && !isValidUrl(video.url)) {
        errors.push(`Video ${index + 1}: Invalid URL format`)
      }
    })
  }
  
  return errors
}

export function validateStudyResourceData(resource: any): string[] {
  const errors: string[] = []
  
  if (!resource.title?.trim()) {
    errors.push("Study resource title is required")
  }
  
  if (!resource.category) {
    errors.push("Category is required")
  }
  
  if (!resource.content_type) {
    errors.push("Content type is required")
  }
  
  if (resource.content_type === "File" && !resource.content_url) {
    errors.push("File URL is required for file content type")
  }
  
  if (resource.content_type === "Text" && !resource.text_content?.trim()) {
    errors.push("Text content is required for text content type")
  }
  
  if (resource.content_url && !isValidUrl(resource.content_url)) {
    errors.push("Invalid URL format")
  }
  
  return errors
}

export function isValidUrl(url: string): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isGoogleUrl(url: string): boolean {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    const googleDomainPattern = /^(drive|docs|sheets|forms|sites|calendar|meet|classroom|photos|maps|translate|scholar|books|news|mail|youtube|blogger|plus|hangouts|keep|jamboard|earth|chrome|play|store|pay|ads|analytics|search|trends|alerts|groups|contacts|voice|duo|allo|spaces|currents|my|accounts|support|developers|cloud|firebase|colab|datastudio|optimize|tagmanager|marketingplatform|admob|adsense|doubleclick|googleadservices|googlesyndication|googletagmanager|googleusercontent|gstatic|googleapis|appspot|firebaseapp|web\.app|page\.link|goo\.gl|g\.co)\.google\.com$/
    return googleDomainPattern.test(urlObj.hostname) || urlObj.hostname === 'google.com'
  } catch {
    return false
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

export function generateSemesterTitle(type: string, year: number): string {
  return `${type} ${year}`
}

export function getSemesterStatus(semester: any): {
  status: 'active' | 'inactive' | 'upcoming' | 'completed'
  label: string
  color: string
} {
  const now = new Date()
  const startDate = semester.start_date ? new Date(semester.start_date) : null
  const endDate = semester.end_date ? new Date(semester.end_date) : null
  
  if (!semester.is_active) {
    return {
      status: 'inactive',
      label: 'Inactive',
      color: 'bg-gray-100 text-gray-800'
    }
  }
  
  if (startDate && endDate) {
    if (now < startDate) {
      return {
        status: 'upcoming',
        label: 'Upcoming',
        color: 'bg-blue-100 text-blue-800'
      }
    } else if (now > endDate) {
      return {
        status: 'completed',
        label: 'Completed',
        color: 'bg-purple-100 text-purple-800'
      }
    }
  }
  
  return {
    status: 'active',
    label: 'Active',
    color: 'bg-green-100 text-green-800'
  }
}

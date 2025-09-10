"use client"

import { lazy, Suspense, memo } from "react"
import { Loader2 } from "lucide-react"

// Lazy load the heavy ContentViewer component
const ContentViewer = lazy(() => 
  import("./content-viewer").then(module => ({ default: module.ContentViewer }))
)

interface ContentItem {
  type: "slide" | "video" | "document" | "syllabus" | "study-tool"
  title: string
  url: string
  id: string
  topicTitle?: string
  courseTitle?: string
  description?: string
  courseCode?: string
  teacherName?: string
  tabId?: string
  semesterInfo?: {
    id: string
    title: string
    section: string
    is_active: boolean
  }
}

interface FileTabState {
  scrollPosition?: number
  videoCurrentTime?: number
  videoDuration?: number
  videoPlaybackRate?: number
  isVideoPlaying?: boolean
  lastAccessTime?: number
  viewportState?: any
}

interface LazyContentViewerProps {
  content: ContentItem
  isLoading?: boolean
  savedState?: FileTabState
  onStateChange?: (state: Partial<FileTabState>) => void
}

// Loading skeleton component
const ContentViewerSkeleton = memo(() => (
  <div className="h-full bg-white dark:bg-[#35374B] rounded-lg overflow-hidden shadow-lg animate-pulse">
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading content viewer...</p>
      </div>
    </div>
  </div>
))

ContentViewerSkeleton.displayName = "ContentViewerSkeleton"

export const LazyContentViewer = memo(function LazyContentViewer({
  content,
  isLoading = false,
  savedState,
  onStateChange
}: LazyContentViewerProps) {
  return (
    <Suspense fallback={<ContentViewerSkeleton />}>
      <ContentViewer
        content={content}
        isLoading={isLoading}
        savedState={savedState}
        onStateChange={onStateChange}
      />
    </Suspense>
  )
})

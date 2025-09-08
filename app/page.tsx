"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Download, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FunctionalSidebar } from "@/components/functional-sidebar"
import { EnhancedSidebarWithEnrollment } from "@/components/enhanced-sidebar-with-enrollment"
import { CourseEnrollmentProvider } from "@/contexts/CourseEnrollmentContext"
import { SectionProvider, useSectionContext } from "@/contexts/SectionContext"
import { LazyContentViewer } from "@/components/lazy-content-viewer"
import { MultiCourseContentManager } from "@/components/multi-course-content-manager"
import { SectionSelectionModal } from "@/components/section-selection-modal"
import { Header } from "@/components/header"
import { useOptimizedContent } from "@/hooks/use-optimized-content"
import { performanceMonitor, measureAsync } from "@/lib/performance"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useIsMobile } from "@/components/ui/use-mobile"

import { trackContentEvent, trackDownloadEvent, trackError } from "@/lib/analytics"
import { generateSimpleShareUrl, parseSimpleShareUrl, updateUrlWithoutNavigation } from "@/lib/simple-share-utils"

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
  semesterInfo?: {
    id: string
    title: string
    section: string
    is_active: boolean
  }
}

function HomePageContent() {
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [mounted, setMounted] = useState(false)
  const [useMultiCourse, setUseMultiCourse] = useState(true) // Toggle for multi-course mode
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const { isAuthenticated, isLoading: sectionLoading, selectedSection, userId } = useSectionContext()

  const router = useRouter()

  // Fallback loading state for compatibility
  const [fallbackLoading, setFallbackLoading] = useState(false)

  // Use optimized content loading
  const {
    content: optimizedContent,
    isLoading: optimizedLoading,
    loadContent,
    clearContent,
    cacheStats
  } = useOptimizedContent({
    cacheStrategy: 'normal',
    enablePrefetch: true,
    preloadNext: true
  })

  // Use optimized loading or fallback
  const isLoading = optimizedLoading || fallbackLoading

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load content if URL contains shareable route
  useEffect(() => {
    const loadContentFromUrl = async () => {
      if (!mounted) return

      // Skip if content is already selected (to avoid conflicts)
      if (selectedContent) return

      // Check for share_path parameter (from middleware rewrite)
      const urlParams = new URLSearchParams(window.location.search)
      const sharePath = urlParams.get('share_path')

      console.log("URL Params:", urlParams.toString())
      console.log("Share path from params:", sharePath)
      console.log("Window location:", window.location.href)
      console.log("Window pathname:", window.location.pathname)

      let urlToCheck = window.location.href
      if (sharePath) {
        // Use the original shareable path
        urlToCheck = `${window.location.origin}${sharePath}`
        console.log("Using share path:", urlToCheck)
      }

      console.log("Final URL to check:", urlToCheck)

      const parsedUrl = parseSimpleShareUrl(urlToCheck)
      console.log("Parsed URL:", parsedUrl)

      if (parsedUrl) {
        try {
          setFallbackLoading(true)
          // Use optimized content loading
          await loadContent(parsedUrl.type, parsedUrl.id)

          // Fetch content data from API (using simplified endpoints)
          let apiEndpoint
          if (parsedUrl.type === 'slide') {
            apiEndpoint = `/api/slides-simple/${parsedUrl.id}`
          } else if (parsedUrl.type === 'video') {
            apiEndpoint = `/api/videos-simple/${parsedUrl.id}`
          } else if (parsedUrl.type === 'study-tool') {
            apiEndpoint = `/api/study-tools-simple/${parsedUrl.id}`
          } else {
            // Fallback to regular API
            apiEndpoint = `/api/${parsedUrl.type === 'study-tool' ? 'study-tools' : `${parsedUrl.type}s`}/${parsedUrl.id}`
          }
          console.log("API Endpoint:", apiEndpoint)

          const response = await fetch(apiEndpoint)
          console.log("API Response status:", response.status)
          console.log("API Response headers:", Object.fromEntries(response.headers.entries()))

          if (response.ok) {
            const contentData = await response.json()
            console.log("Content Data:", contentData)

            if (!contentData || !contentData.id) {
              console.error("Invalid content data received:", contentData)
              throw new Error("Invalid content data received from API")
            }

            // Convert API response to ContentItem format
            const content: ContentItem = {
              id: contentData.id,
              type: parsedUrl.type === 'study-tool' ?
                    (contentData.studyToolType === 'syllabus' ? 'syllabus' : 'study-tool') :
                    parsedUrl.type as "slide" | "video",
              title: contentData.title,
              url: contentData.url,
              topicTitle: parsedUrl.type === 'study-tool' ? undefined : contentData.topic?.title,
              courseTitle: parsedUrl.type === 'study-tool' ?
                    contentData.course?.title :
                    (contentData.topic?.course?.title || contentData.course?.title),
              description: contentData.description,
            }

            console.log("Setting content:", content)
            setSelectedContent(content)

            // Update the browser URL to show the shareable URL (without query params)
            const shareUrl = generateSimpleShareUrl(parsedUrl.type, parsedUrl.id)
            updateUrlWithoutNavigation(shareUrl)

            toast({
              title: "Content Loaded",
              description: `Now viewing: ${content.title}`,
            })
          } else {
            console.error("API Error:", response.status, response.statusText)
            const errorData = await response.text()
            console.error("Error details:", errorData)

            if (response.status === 404) {
              console.log("Content not found, redirecting to browse page")
              toast({
                title: "Content Not Found",
                description: "The requested content could not be found. Redirecting to browse available content...",
                variant: "destructive",
              })

              // Redirect to appropriate browse page based on content type
              setTimeout(() => {
                if (parsedUrl.type === 'slide') {
                  window.location.href = '/browse-slides'
                } else if (parsedUrl.type === 'video') {
                  window.location.href = '/browse-videos'
                } else {
                  window.location.href = '/test-api'
                }
              }, 2000)
            } else {
              toast({
                title: "Error Loading Content",
                description: `Failed to load content: ${response.status}`,
                variant: "destructive",
              })
            }
          }
        } catch (error) {
          console.error("Error loading content from URL:", error)
          toast({
            title: "Error",
            description: "Failed to load content from URL",
            variant: "destructive",
          })
        } finally {
          setFallbackLoading(false)
        }
      } else {
        console.log("No shareable URL detected")
      }
    }

    // Add a small delay to ensure everything is mounted
    const timer = setTimeout(loadContentFromUrl, 100)
    return () => clearTimeout(timer)
  }, [mounted, selectedContent, toast, loadContent, setFallbackLoading])

  // Initialize with highlighted course syllabus if available (only if no shareable URL)
  useEffect(() => {
    const initializeHighlightedSyllabus = async () => {
      // Skip if content is already selected (from shareable URL)
      if (selectedContent) {
        console.log("Skipping default content load - content already selected")
        return
      }

      // Check if we're processing a shareable URL
      const urlParams = new URLSearchParams(window.location.search)
      const sharePath = urlParams.get('share_path')
      const currentUrl = window.location.href
      const hasShareableUrl = sharePath ||
        /\/(video|slide|study-tool)\/[a-f0-9-]{36}/i.test(currentUrl)

      if (hasShareableUrl) {
        console.log("Skipping default content load - shareable URL detected")
        return
      }

      try {
        setFallbackLoading(true)

        // First try to load highlighted course syllabus
        const highlightedResponse = await fetch("/api/content/highlighted-syllabus")
        if (highlightedResponse.ok) {
          const highlightedContent = await highlightedResponse.json()
          if (highlightedContent && highlightedContent.type === "syllabus") {
            setSelectedContent(highlightedContent)
            toast({
              title: "✨ Featured Course Loaded",
              description: `Showing syllabus for ${highlightedContent.courseTitle}`,
              duration: 4000,
            })
            return
          }
        } else if (highlightedResponse.status === 404) {
          console.log("No highlighted course syllabus found, falling back to default content")
        }

        // Fallback to default content if no highlighted syllabus
        const defaultResponse = await fetch("/api/content/default")
        if (defaultResponse.ok) {
          const defaultContent = await defaultResponse.json()
          if (defaultContent) {
            setSelectedContent(defaultContent)
          }
        }
      } catch (error) {
        console.error("Failed to load initial content:", error)
        toast({
          title: "Loading Error",
          description: "Failed to load initial content",
          variant: "destructive",
        })
      } finally {
        setFallbackLoading(false)
      }
    }

    if (mounted) {
      // Add a delay to ensure shareable URL processing happens first
      const timer = setTimeout(initializeHighlightedSyllabus, 300)
      return () => clearTimeout(timer)
    }
  }, [mounted, selectedContent, toast, setFallbackLoading])

  // Mobile layout doesn't need sidebar state management

  const handleContentSelect = async (content: ContentItem) => {
    console.log("=== OPTIMIZED CONTENT SELECTION ===")
    console.log("Selected content:", content)
    console.log("Content type:", content.type)
    console.log("Content ID:", content.id)
    console.log("Multi-course mode:", useMultiCourse)

    try {
      // Log content access for analytics
      await trackContentEvent({
        contentId: content.id,
        contentType: content.type === "document" ? "slide" : content.type as any,
        action: "view",
        metadata: {
          title: content.title,
          topicTitle: content.topicTitle,
          courseTitle: content.courseTitle,
          cacheHitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0
        },
      })

      if (useMultiCourse) {
        // Use multi-course manager
        const manager = (window as any).multiCourseManager
        if (manager) {
          manager.addContent(content)
        }
      } else {
        // Original single-content mode
        await measureAsync('content-load', async () => {
          await loadContent(content.type, content.id)
        })

        setSelectedContent(content)
      }

      // Generate shareable URL and update the browser URL without navigation
      const contentType = content.type === "document" ? "slide" :
                         content.type === "syllabus" ? "study-tool" : content.type
      const shareUrl = generateSimpleShareUrl(contentType, content.id)

      console.log("Generated share URL:", shareUrl)
      updateUrlWithoutNavigation(shareUrl)

      toast({
        title: "Content Loaded",
        description: `Now viewing: ${content.title}`,
      })
    } catch (error) {
      console.error("Error loading content:", error)
      trackError("Content loading failed", {
        contentId: content.id,
        contentType: content.type,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async () => {
    if (!selectedContent) return

    try {
      if (selectedContent.type === "video") {
        // For YouTube videos, open the video page
        const videoId =
          selectedContent.url.match(/embed\/([^?]+)/)?.[1] ||
          selectedContent.url.match(/v=([^&]+)/)?.[1] ||
          selectedContent.url.match(/youtu\.be\/([^?]+)/)?.[1]
        if (videoId) {
          window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
        } else {
          window.open(selectedContent.url, "_blank")
        }
      } else {
        // For Google Drive files, trigger download
        const fileId = selectedContent.url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          window.open(`https://drive.google.com/uc?export=download&id=${fileId}`, "_blank")
        } else {
          window.open(selectedContent.url, "_blank")
        }
      }

      // Log download action (both internal and Vercel Analytics)
      await trackDownloadEvent({
        contentId: selectedContent.id,
        contentType: selectedContent.type === "document" ? "slide" :
                    selectedContent.type === "syllabus" ? "study-tool" : selectedContent.type as any,
        metadata: {
          title: selectedContent.title,
          topicTitle: selectedContent.topicTitle,
          courseTitle: selectedContent.courseTitle,
        },
      })

      toast({
        title: "Download Started",
        description: `Opening ${selectedContent.title}`,
      })
    } catch (error) {
      console.error("Download error:", error)
      trackError("Download failed", {
        contentId: selectedContent.id,
        contentType: selectedContent.type,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      toast({
        title: "Download Failed",
        description: "Unable to download content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFullscreen = () => {
    if (!selectedContent) return

    try {
      if (selectedContent.type === "video") {
        // For videos, open YouTube in new tab
        const videoId =
          selectedContent.url.match(/embed\/([^?]+)/)?.[1] ||
          selectedContent.url.match(/v=([^&]+)/)?.[1] ||
          selectedContent.url.match(/youtu\.be\/([^?]+)/)?.[1]
        if (videoId) {
          window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
        } else {
          window.open(selectedContent.url, "_blank")
        }
      } else {
        const iframe = document.querySelector("iframe")
        if (iframe && iframe.requestFullscreen) {
          iframe.requestFullscreen()
        } else {
          window.open(selectedContent.url, "_blank")
        }
      }

      toast({
        title: "Fullscreen Mode",
        description: "Content opened in fullscreen",
      })
    } catch (error) {
      console.error("Fullscreen error:", error)
      toast({
        title: "Fullscreen Failed",
        description: "Unable to open in fullscreen mode",
        variant: "destructive",
      })
    }
  }



  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  // Show section selection modal if user hasn't selected a section
  if (!sectionLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Header */}
        <Header />

        {/* Section Selection Modal */}
        <SectionSelectionModal />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className={`${isMobile ? 'flex flex-col h-[calc(100vh-3.5rem)]' : 'flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden'}`}>
        {/* Mobile Layout: Content at top, sidebar below */}
        {isMobile ? (
          <>
            {/* Content Area - Mobile */}
            <div className="flex-none bg-background" style={{ height: useMultiCourse ? '60vh' : 'auto' }}>
              {useMultiCourse ? (
                <MultiCourseContentManager
                  onContentChange={setSelectedContent}
                  className="h-full"
                />
              ) : selectedContent ? (
                <>
                  {/* Content Viewer - Clean Mobile Design */}
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <div className="absolute inset-0 overflow-hidden bg-black">
                      <LazyContentViewer content={selectedContent} isLoading={isLoading} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 bg-background">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-muted-foreground font-semibold text-xl">DIU</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Select content from courses below
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Sidebar - Mobile (below content) */}
            <div className="flex-1 bg-card border-t border-border overflow-hidden">
              <EnhancedSidebarWithEnrollment
                onContentSelect={handleContentSelect}
                selectedContentId={selectedContent?.id}
              />
            </div>
          </>
        ) : (
          /* Desktop Layout: Side-by-side */
          <>
            {/* Content Area - Desktop */}
            <div className="flex-1 flex flex-col bg-background min-w-0 relative">
              {useMultiCourse ? (
                <MultiCourseContentManager
                  onContentChange={setSelectedContent}
                  className="h-full"
                />
              ) : selectedContent ? (
                <>
                  {/* Content Viewer - Desktop */}
                  <div className="flex-1 p-0.5 sm:p-1 md:p-3 lg:p-4 xl:p-6 overflow-hidden">
                    <div className="h-full rounded-md sm:rounded-lg md:rounded-xl overflow-hidden shadow-md sm:shadow-lg md:shadow-modern-lg border border-border animate-fade-in">
                      <LazyContentViewer content={selectedContent} isLoading={isLoading} />
                    </div>
                  </div>

                  {/* Bottom Controls - Desktop */}
                  <div className="bg-card/95 backdrop-blur-sm px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border-t border-border/50 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                      {/* Content Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 flex-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs font-medium w-fit ${
                            selectedContent.type === "video"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : selectedContent.type === "slide"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {selectedContent.type === "slide"
                            ? "Slide Presentation"
                            : selectedContent.type === "video"
                              ? "Video Content"
                              : "Document"}
                        </Badge>
                        {selectedContent.courseTitle && (
                          <span className="text-muted-foreground text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">
                            {selectedContent.courseTitle}
                            {selectedContent.topicTitle && ` • ${selectedContent.topicTitle}`}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons - Desktop */}
                      <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                          className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9 touch-manipulation min-w-0"
                          disabled={isLoading}
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="hidden xs:inline truncate">
                            {selectedContent.type === "video" ? "Watch" : "Download"}
                          </span>
                          <span className="xs:hidden">
                            {selectedContent.type === "video" ? "▶" : "Download"}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFullscreen}
                          className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9 touch-manipulation"
                          disabled={isLoading}
                        >
                          <Maximize className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Fullscreen</span>
                          <span className="sm:hidden">Full</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <MultiCourseContentManager
                  onContentChange={setSelectedContent}
                  className="h-full"
                />
              )}
            </div>

            {/* Enhanced Sidebar - Desktop (right side) */}
            <div className="relative w-80 lg:w-96 xl:w-[28rem] bg-card/95 backdrop-blur-sm border-l border-border flex-shrink-0">
              <div className="h-full bg-card">
                <EnhancedSidebarWithEnrollment
                  onContentSelect={handleContentSelect}
                  selectedContentId={selectedContent?.id}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Toaster />
    </div>
  )
}

export default function HomePage() {
  return (
    <SectionProvider>
      <CourseEnrollmentProvider>
        <HomePageContent />
      </CourseEnrollmentProvider>
    </SectionProvider>
  )
}

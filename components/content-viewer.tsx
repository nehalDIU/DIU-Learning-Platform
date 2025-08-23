"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Loader2, AlertCircle, FileText, Play, BookOpen, ExternalLink, Maximize2, RotateCcw,
  ZoomIn, ZoomOut, RotateCw, Volume2, VolumeX, Settings, Share2, Bookmark,
  PictureInPicture, Download, RefreshCw, Eye, EyeOff, Clock, Pause
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/components/ui/use-mobile"

interface ContentItem {
  type: "slide" | "video" | "document"
  title: string
  url: string
  id: string
  topicTitle?: string
  courseTitle?: string
}

interface ContentViewerProps {
  content: ContentItem
  isLoading?: boolean
}

export function ContentViewer({ content, isLoading = false }: ContentViewerProps) {
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeError, setIframeError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [viewTime, setViewTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isRotated, setIsRotated] = useState(0)
  const [isPictureInPicture, setIsPictureInPicture] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewTimeRef = useRef<NodeJS.Timeout>()
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  const isMobile = useIsMobile()

  useEffect(() => {
    setIframeLoading(true)
    setIframeError(false)
    setZoomLevel(100)
    setIsRotated(0)
    setViewTime(0)

    // Start view time tracking
    viewTimeRef.current = setInterval(() => {
      setViewTime(prev => prev + 1)
    }, 1000)

    return () => {
      if (viewTimeRef.current) {
        clearInterval(viewTimeRef.current)
      }
    }
  }, [content.url])

  const handleIframeLoad = () => {
    setIframeLoading(false)
  }

  const handleIframeError = () => {
    setIframeLoading(false)
    setIframeError(true)
  }

  const handleRetry = () => {
    setIframeError(false)
    setIframeLoading(true)
    // Force iframe reload by changing src
    const iframe = iframeRef.current
    if (iframe) {
      const src = iframe.src
      iframe.src = ''
      setTimeout(() => {
        iframe.src = src
      }, 100)
    }
  }

  // Modern functionality methods
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 25, 200))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 25, 50))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoomLevel(100)
  }, [])

  const handleRotate = useCallback(() => {
    setIsRotated(prev => (prev + 90) % 360)
  }, [])

  const handleBookmark = useCallback(() => {
    setIsBookmarked(prev => !prev)
    // Here you could save to localStorage or send to API
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    if (!isBookmarked) {
      bookmarks.push({
        id: content.id,
        title: content.title,
        url: content.url,
        type: content.type,
        timestamp: new Date().toISOString()
      })
    } else {
      const index = bookmarks.findIndex((b: any) => b.id === content.id)
      if (index > -1) bookmarks.splice(index, 1)
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
  }, [content, isBookmarked])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: `Check out this ${content.type}: ${content.title}`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
    }
  }, [content])

  const handlePictureInPicture = useCallback(async () => {
    if (content.type === 'video' && iframeRef.current) {
      try {
        if (document.pictureInPictureEnabled) {
          const video = iframeRef.current.contentDocument?.querySelector('video')
          if (video) {
            if (document.pictureInPictureElement) {
              await document.exitPictureInPicture()
              setIsPictureInPicture(false)
            } else {
              await video.requestPictureInPicture()
              setIsPictureInPicture(true)
            }
          }
        }
      } catch (err) {
        console.error('Picture-in-picture error:', err)
      }
    }
  }, [content.type])

  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev)
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        const element = document.querySelector('.content-viewer-container')
        if (element) {
          if (element.requestFullscreen) {
            await element.requestFullscreen()
          } else if ((element as any).webkitRequestFullscreen) {
            await (element as any).webkitRequestFullscreen()
          } else if ((element as any).msRequestFullscreen) {
            await (element as any).msRequestFullscreen()
          } else {
            // Fallback to CSS fullscreen
            setIsFullscreen(true)
          }
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        } else {
          // Fallback to CSS fullscreen
          setIsFullscreen(false)
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
      // Fallback to CSS fullscreen
      setIsFullscreen(!isFullscreen)
    }
  }

  // Listen for fullscreen changes and keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return // Only work when not in input fields

      switch (e.key) {
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case '+':
        case '=':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
          e.preventDefault()
          handleZoomOut()
          break
        case '0':
          e.preventDefault()
          handleZoomReset()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleRotate()
          break
        case 'b':
        case 'B':
          e.preventDefault()
          handleBookmark()
          break
        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleShare()
          }
          break
        case 'h':
        case 'H':
          e.preventDefault()
          toggleControls()
          break
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [toggleFullscreen, handleZoomIn, handleZoomOut, handleZoomReset, handleRotate, handleBookmark, handleShare, toggleControls])

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      setShowControls(true)
      controlsTimeoutRef.current = setTimeout(() => {
        if (isFullscreen) {
          setShowControls(false)
        }
      }, 3000)
    }

    const handleMouseMove = () => {
      if (isFullscreen) {
        resetControlsTimeout()
      }
    }

    if (isFullscreen) {
      document.addEventListener('mousemove', handleMouseMove)
      resetControlsTimeout()
    } else {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isFullscreen])

  // Check if content is bookmarked on load
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    setIsBookmarked(bookmarks.some((b: any) => b.id === content.id))
  }, [content.id])

  const getContentIcon = () => {
    const iconSize = isMobile ? "h-4 w-4" : "h-5 w-5 lg:h-6 lg:w-6"
    switch (content.type) {
      case "video":
        return <Play className={`${iconSize} text-red-400 flex-shrink-0`} />
      case "slide":
        return <FileText className={`${iconSize} text-blue-400 flex-shrink-0`} />
      case "document":
        return <BookOpen className={`${iconSize} text-green-400 flex-shrink-0`} />
      default:
        return <FileText className={`${iconSize} text-slate-400 flex-shrink-0`} />
    }
  }

  // Fix YouTube URL format and Google Drive URLs
  const getEmbedUrl = (url: string, type: string) => {
    if (type === "video") {
      // Handle various YouTube URL formats
      let videoId = ""

      if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0]
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0]
      } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("embed/")[1]?.split("?")[0]
      } else if (url.includes("youtube.com/v/")) {
        videoId = url.split("v/")[1]?.split("?")[0]
      }

      if (videoId) {
        // Return proper embed URL with necessary parameters
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}&rel=0&modestbranding=1`
      }

      // If it's already an embed URL, ensure it has proper parameters
      if (url.includes("youtube.com/embed/")) {
        const baseUrl = url.split("?")[0]
        return `${baseUrl}?enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}&rel=0&modestbranding=1`
      }
    } else if (type === "slide" || type === "document") {
      // Handle Google Drive URLs for documents and slides
      let fileId = ""

      // Format: https://drive.google.com/file/d/FILE_ID/view
      if (url.includes("/file/d/")) {
        fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ""
      }
      // Format: https://drive.google.com/open?id=FILE_ID
      else if (url.includes("open?id=")) {
        fileId = url.match(/open\?id=([a-zA-Z0-9-_]+)/)?.[1] || ""
      }
      // Format: https://docs.google.com/document/d/FILE_ID/ or https://docs.google.com/presentation/d/FILE_ID/
      else if (url.includes("docs.google.com")) {
        fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ""
      }
      // Format: https://sheets.google.com/spreadsheets/d/FILE_ID/
      else if (url.includes("sheets.google.com")) {
        fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ""
      }

      if (fileId) {
        // Return Google Drive embed URL for preview
        return `https://drive.google.com/file/d/${fileId}/preview`
      }
    }

    return url
  }

  const openInNewTab = () => {
    if (content.type === "video") {
      // Convert embed URL back to watch URL for better user experience
      const videoId = content.url.match(/embed\/([^?]+)/)?.[1]
      if (videoId) {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
        return
      }
    }
    window.open(content.url, "_blank")
  }

  if (isLoading) {
    return (
      <div className="h-full bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-lg sm:shadow-2xl flex items-center justify-center">
        <div className="text-center p-4 sm:p-6">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium">Loading content...</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2">Please wait while we prepare your content</p>
        </div>
      </div>
    )
  }

  const embedUrl = getEmbedUrl(content.url, content.type)

  return (
    <div className={`
      content-viewer-container h-full bg-white dark:bg-slate-900 rounded-lg overflow-hidden
      shadow-lg sm:shadow-2xl relative transition-all duration-300
      ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}
      ${isMobile ? 'mobile-content-viewer' : ''}
    `}>
      {/* Content Header */}
      <div className={`
        absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent
        ${isMobile ? 'p-2 sm:p-3' : 'p-3 sm:p-4 lg:p-5'}
        ${isFullscreen && isMobile ? 'pt-safe-top' : ''}
      `}>
        <div className="flex items-start justify-between text-white gap-2 sm:gap-3">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            {getContentIcon()}
            <div className="min-w-0 flex-1">
              <h3 className={`
                font-semibold leading-tight line-clamp-2 mb-1
                ${isMobile ? 'text-xs sm:text-sm' : 'text-sm sm:text-base lg:text-lg'}
              `}>
                {content.title}
              </h3>
              {content.topicTitle && (
                <p className={`
                  opacity-80 truncate mb-0.5
                  ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}
                `}>
                  {content.topicTitle}
                </p>
              )}
              {content.courseTitle && (
                <p className="text-xs opacity-70 truncate">{content.courseTitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* View Time - Hidden on mobile in header, shown in mobile controls */}
            {!isMobile && (
              <div className="hidden sm:flex items-center gap-1 text-white/80 text-xs">
                <Clock className="h-3 w-3" />
                <span>{formatTime(viewTime)}</span>
              </div>
            )}

            <Badge
              variant="secondary"
              className={`
                font-medium
                ${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'}
                ${content.type === "video"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : content.type === "slide"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                }
              `}
            >
              {isMobile ? content.type.charAt(0).toUpperCase() : content.type}
            </Badge>

            {/* Desktop Controls */}
            {!isMobile && showControls && (
              <div className="flex items-center gap-1">
                {/* Bookmark */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className="text-white hover:bg-white/20 p-1.5 h-auto touch-manipulation"
                  title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Bookmark className={`h-3 w-3 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>

                {/* Share */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20 p-1.5 h-auto touch-manipulation"
                  title="Share content"
                >
                  <Share2 className="h-3 w-3" />
                </Button>

                {/* Zoom Controls */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="text-white hover:bg-white/20 p-1.5 h-auto touch-manipulation"
                  title="Zoom out"
                  disabled={zoomLevel <= 50}
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>

                <span className="text-white/80 text-xs min-w-[3rem] text-center">{zoomLevel}%</span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="text-white hover:bg-white/20 p-1.5 h-auto touch-manipulation"
                  title="Zoom in"
                  disabled={zoomLevel >= 200}
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>

                {/* Rotate */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="text-white hover:bg-white/20 p-1.5 h-auto touch-manipulation"
                  title="Rotate content"
                >
                  <RotateCw className="h-3 w-3" />
                </Button>

                {/* Picture in Picture for videos */}
                {content.type === 'video' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePictureInPicture}
                    className="text-white hover:bg-white/20 p-1.5 h-auto touch-manipulation"
                    title="Picture in picture"
                  >
                    <PictureInPicture className="h-3 w-3" />
                  </Button>
                )}

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 p-1.5 h-auto touch-manipulation"
                  title={isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>

                {/* Hide Controls */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleControls}
                  className="text-white hover:bg-white/20 p-1.5 h-auto touch-manipulation"
                  title="Hide controls (H)"
                >
                  <EyeOff className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Mobile Controls - Essential controls only */}
            {isMobile && (
              <div className="flex items-center gap-1">
                {/* Bookmark - Essential for mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className="text-white hover:bg-white/20 p-1.5 h-auto touch-manipulation"
                  title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Bookmark className={`h-3 w-3 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>

                {/* Fullscreen - Essential for mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 p-1.5 h-auto touch-manipulation"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewTab}
              className="text-white hover:bg-white/20 p-1.5 sm:p-2 h-auto touch-manipulation"
              title="Open in new tab"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {iframeLoading && (
        <div className="absolute inset-0 bg-white dark:bg-slate-900 flex items-center justify-center z-10">
          <div className={`
            text-center
            ${isMobile ? 'p-3' : 'p-4 sm:p-6'}
          `}>
            <Loader2 className={`
              animate-spin text-slate-400 mx-auto mb-4
              ${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'}
            `} />
            <p className={`
              text-slate-600 dark:text-slate-300 font-medium mb-2
              ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}
            `}>
              Loading {content.type}...
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              {getContentIcon()}
              <span className={`
                text-slate-500 dark:text-slate-400 truncate
                ${isMobile ? 'text-xs max-w-[200px]' : 'text-sm max-w-xs sm:max-w-sm'}
              `}>
                {content.title}
              </span>
            </div>
            <div className={`
              mt-4 w-full mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-1
              ${isMobile ? 'max-w-[200px]' : 'max-w-xs'}
            `}>
              <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {iframeError && (
        <div className={`
          absolute inset-0 bg-white dark:bg-slate-900 flex items-center justify-center z-10
          ${isMobile ? 'p-3' : 'p-4 sm:p-6'}
        `}>
          <div className={`
            text-center mx-auto
            ${isMobile ? 'max-w-[280px]' : 'max-w-sm sm:max-w-md lg:max-w-lg'}
          `}>
            <AlertCircle className={`
              text-red-400 mx-auto mb-6
              ${isMobile ? 'h-10 w-10' : 'h-12 w-12 sm:h-16 sm:w-16'}
            `} />
            <h3 className={`
              font-bold text-slate-800 dark:text-slate-200 mb-3
              ${isMobile ? 'text-base' : 'text-lg sm:text-xl'}
            `}>
              Content Unavailable
            </h3>
            <p className={`
              text-slate-600 dark:text-slate-300 mb-4 leading-relaxed
              ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}
            `}>
              Unable to load this {content.type}. This might be due to:
            </p>
            <ul className={`
              text-slate-500 dark:text-slate-400 text-left space-y-2 mb-6
              bg-slate-50 dark:bg-slate-800 rounded-lg
              ${isMobile ? 'text-xs p-3' : 'text-sm p-4'}
            `}>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                Content is private or restricted
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                Network connectivity issues
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                Invalid or expired link
              </li>
              {content.type === "video" && (
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  Video embedding is disabled
                </li>
              )}
            </ul>
            <div className="space-y-3">
              <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-left">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-300 text-sm">
                  Try refreshing or opening the content in a new tab.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1 touch-manipulation"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button
                  onClick={openInNewTab}
                  className="flex-1 touch-manipulation"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content iframe with modern transforms */}
      <div
        className={`
          w-full h-full flex items-center justify-center overflow-hidden
          ${isMobile ? 'mobile-overflow-responsive' : ''}
        `}
        style={{
          transform: `scale(${zoomLevel / 100}) rotate(${isRotated}deg)`,
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        {content.type === "video" ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className={`
              w-full h-full border-0 bg-black
              ${isMobile ? 'touch-manipulation' : ''}
            `}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={content.title}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className={`
              w-full h-full border-0 bg-white dark:bg-slate-800
              ${isMobile ? 'touch-manipulation' : ''}
            `}
            title={content.title}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
          />
        )}
      </div>

      {/* Floating Controls (when main controls are hidden) */}
      {isFullscreen && !showControls && !isMobile && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleControls}
              className="text-white hover:bg-white/20 p-1.5 h-auto rounded-full"
              title="Show controls (H)"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 p-1.5 h-auto rounded-full"
              title="Exit fullscreen (F)"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {isFullscreen && showControls && !isMobile && (
        <div className="absolute bottom-4 right-4 z-30">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-xs">
            <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
            <div className="space-y-1 text-white/80">
              <div><kbd className="bg-white/20 px-1 rounded">F</kbd> Fullscreen</div>
              <div><kbd className="bg-white/20 px-1 rounded">+/-</kbd> Zoom</div>
              <div><kbd className="bg-white/20 px-1 rounded">R</kbd> Rotate</div>
              <div><kbd className="bg-white/20 px-1 rounded">B</kbd> Bookmark</div>
              <div><kbd className="bg-white/20 px-1 rounded">H</kbd> Hide controls</div>
            </div>
          </div>
        </div>
      )}



      {/* Fullscreen exit overlay for mobile */}
      {isFullscreen && isMobile && (
        <div className="absolute top-4 right-4 z-30">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-black/50 text-white hover:bg-black/70 p-2 rounded-full touch-manipulation"
          >
            <ExternalLink className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      )}

      {/* Zoom Level Indicator - Desktop only when not 100% */}
      {!isMobile && zoomLevel !== 100 && (
        <div className="absolute top-4 left-4 z-30">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm">
            {zoomLevel}%
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useCallback, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  X,
  FileText,
  Video,
  BookOpen,
  FileImage,
  GraduationCap,
  Maximize2,
  Minimize2,
  MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LazyContentViewer } from "@/components/lazy-content-viewer"

interface ContentItem {
  type: "slide" | "video" | "document" | "syllabus" | "study-tool"
  title: string
  url: string
  id: string
  topicTitle?: string
  courseTitle?: string
  courseId?: string
  description?: string
  courseCode?: string
  teacherName?: string
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

interface FileTab {
  id: string
  title: string
  type: "slide" | "video" | "document" | "syllabus" | "study-tool"
  content: ContentItem
  isActive: boolean
  courseTitle?: string
  courseCode?: string
  state?: FileTabState
}

interface MultiCourseContentManagerProps {
  className?: string
  onContentChange?: (content: ContentItem | null) => void
}

export function MultiCourseContentManager({
  className,
  onContentChange
}: MultiCourseContentManagerProps) {
  const [fileTabs, setFileTabs] = useState<FileTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [contextMenuTab, setContextMenuTab] = useState<string | null>(null)
  const [tabStates, setTabStates] = useState<Map<string, FileTabState>>(new Map())

  // Get file type icon
  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-3 w-3 shrink-0" />
      case "document":
      case "slide":
        return <FileText className="h-3 w-3 shrink-0" />
      case "syllabus":
        return <BookOpen className="h-3 w-3 shrink-0" />
      case "study-tool":
        return <GraduationCap className="h-3 w-3 shrink-0" />
      default:
        return <FileImage className="h-3 w-3 shrink-0" />
    }
  }



  // Save current tab state before switching
  const saveTabState = useCallback((tabId: string, state: Partial<FileTabState>) => {
    console.log('Saving tab state:', tabId, state)
    setTabStates(prev => {
      const newStates = new Map(prev)
      const existingState = newStates.get(tabId) || {}
      const newState = {
        ...existingState,
        ...state,
        lastAccessTime: Date.now()
      }
      newStates.set(tabId, newState)
      console.log('Updated tab states:', Object.fromEntries(newStates))
      return newStates
    })
  }, [])

  // Simple time tracking for videos
  const startTimeTracking = useCallback((tabId: string) => {
    console.log('🎬 STARTED TIME TRACKING for tab:', tabId)
    const startTime = Date.now()
    saveTabState(tabId, {
      trackingStartTime: startTime,
      trackingInitialVideoTime: 0
    })
  }, [saveTabState])

  const stopTimeTracking = useCallback((tabId: string) => {
    const state = tabStates.get(tabId)
    if (state?.trackingStartTime) {
      const now = Date.now()
      const elapsedSeconds = (now - state.trackingStartTime) / 1000
      const estimatedCurrentTime = elapsedSeconds

      console.log('💾 SAVING VIDEO STATE: Stopped time tracking for tab:', tabId, 'estimated time:', estimatedCurrentTime)

      saveTabState(tabId, {
        videoCurrentTime: estimatedCurrentTime,
        isVideoPlaying: true
      })
    }
  }, [tabStates, saveTabState])



  // Save video state from iframe
  const saveVideoState = useCallback((tabId: string) => {
    const iframe = document.querySelector(`iframe[data-tab-id="${tabId}"]`) as HTMLIFrameElement
    if (iframe && iframe.contentWindow) {
      try {
        console.log('Requesting video state for tab:', tabId)
        // Request current video state from YouTube
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"getCurrentTime","args":""}',
          'https://www.youtube.com'
        )
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"getDuration","args":""}',
          'https://www.youtube.com'
        )
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"getPlaybackRate","args":""}',
          'https://www.youtube.com'
        )
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"getPlayerState","args":""}',
          'https://www.youtube.com'
        )
      } catch (error) {
        console.warn('Could not save video state:', error)
      }
    }
  }, [])

  // Restore tab state when switching back
  const restoreTabState = useCallback((tabId: string, state: FileTabState) => {
    const tab = fileTabs.find(t => t.id === tabId)
    if (!tab) return

    console.log('🎬 RESTORING STATE for tab:', tabId, 'type:', tab.type, 'state:', state)

    // Restore video state by modifying the iframe src with time parameter
    if (tab.type === 'video' && state.videoCurrentTime !== undefined && state.videoCurrentTime > 5) {
      setTimeout(() => {
        const iframe = document.querySelector(`iframe[data-tab-id="${tabId}"]`) as HTMLIFrameElement
        if (iframe) {
          try {
            const timeParam = Math.floor(state.videoCurrentTime)
            let src = iframe.src

            // Remove existing time parameter if present
            src = src.replace(/[?&]t=\d+s?/, '')

            // Add time parameter
            const separator = src.includes('?') ? '&' : '?'
            const newSrc = `${src}${separator}t=${timeParam}s&autoplay=1`

            console.log('🎬 Setting video to time:', timeParam, 'seconds')
            iframe.src = newSrc

          } catch (error) {
            console.warn('Could not restore video state:', error)
          }
        }
      }, 1500)
    }

    // Restore scroll position for documents/slides
    if (state.scrollPosition !== undefined && tab.type !== 'video') {
      setTimeout(() => {
        const contentElement = document.querySelector('.content-viewer-container')
        if (contentElement) {
          console.log('Restoring scroll position:', state.scrollPosition)
          contentElement.scrollTop = state.scrollPosition
        }
      }, 500)
    }
  }, [fileTabs])

  // Add or update a file tab
  const addOrUpdateFileTab = useCallback((content: ContentItem) => {
    const tabId = content.id
    const tabTitle = content.title

    setFileTabs(prev => {
      const existingTabIndex = prev.findIndex(tab => tab.id === tabId)

      if (existingTabIndex >= 0) {
        // Update existing tab and make it active
        const updated = [...prev]
        updated[existingTabIndex] = {
          ...updated[existingTabIndex],
          content,
          isActive: true
        }
        // Deactivate other tabs
        updated.forEach((tab, index) => {
          if (index !== existingTabIndex) {
            tab.isActive = false
          }
        })
        return updated
      } else {
        // Add new tab
        const newTab: FileTab = {
          id: tabId,
          title: tabTitle,
          type: content.type,
          content,
          isActive: true,
          courseTitle: content.courseTitle,
          courseCode: content.courseCode
        }
        // Deactivate existing tabs and add new one
        const updated = prev.map(tab => ({ ...tab, isActive: false }))
        return [...updated, newTab]
      }
    })

    setActiveTabId(tabId)
    onContentChange?.(content)

    // Start time tracking for new video tabs
    if (content.type === 'video') {
      setTimeout(() => {
        startTimeTracking(tabId)
      }, 3000) // Start tracking after video loads
    }
  }, [onContentChange, startTimeTracking])

  // Remove a file tab
  const removeFileTab = useCallback((tabId: string) => {
    setFileTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId)

      // If we removed the active tab, activate another one
      if (activeTabId === tabId && filtered.length > 0) {
        const newActiveTab = filtered[filtered.length - 1]
        newActiveTab.isActive = true
        setActiveTabId(newActiveTab.id)
        onContentChange?.(newActiveTab.content)
      } else if (filtered.length === 0) {
        setActiveTabId(null)
        onContentChange?.(null)
      }

      return filtered
    })
  }, [activeTabId, onContentChange])

  // Switch to a different tab
  const switchToTab = useCallback((tabId: string) => {
    console.log('Switching from tab:', activeTabId, 'to tab:', tabId)

    // Save current tab state before switching
    if (activeTabId && activeTabId !== tabId) {
      const currentTab = fileTabs.find(tab => tab.id === activeTabId)
      console.log('Saving state for tab:', activeTabId, 'type:', currentTab?.type)

      if (currentTab?.type === 'video') {
        // Stop time tracking for current video
        stopTimeTracking(activeTabId)
      }

      // Save scroll position for documents/slides
      const contentElement = document.querySelector('.content-viewer-container')
      if (contentElement && currentTab?.type !== 'video') {
        const scrollPosition = contentElement.scrollTop
        console.log('Saving scroll position:', scrollPosition, 'for tab:', activeTabId)
        saveTabState(activeTabId, {
          scrollPosition
        })
      }
    }

    // Update tab states
    setFileTabs(prev =>
      prev.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }))
    )
    setActiveTabId(tabId)

    const activeTab = fileTabs.find(tab => tab.id === tabId)
    onContentChange?.(activeTab?.content || null)

    // Restore state after content loads
    setTimeout(() => {
      const savedState = tabStates.get(tabId)
      console.log('Restoring state for tab:', tabId, 'state:', savedState)
      if (savedState) {
        restoreTabState(tabId, savedState)
      }

      // Start time tracking for video tabs
      if (activeTab?.type === 'video') {
        setTimeout(() => {
          startTimeTracking(tabId)
        }, 2000) // Start tracking after video loads
      }
    }, 1500) // Increased delay to ensure content is fully loaded
  }, [fileTabs, onContentChange, activeTabId, saveVideoState, saveTabState, tabStates, restoreTabState, stopTimeTracking, startTimeTracking])

  // Close all tabs except the specified one
  const closeOtherTabs = useCallback((keepTabId: string) => {
    setFileTabs(prev => {
      const tabToKeep = prev.find(tab => tab.id === keepTabId)
      if (tabToKeep) {
        return [{...tabToKeep, isActive: true}]
      }
      return prev
    })
    setActiveTabId(keepTabId)
    const activeTab = fileTabs.find(tab => tab.id === keepTabId)
    onContentChange?.(activeTab?.content || null)
  }, [fileTabs, onContentChange])

  // Close all tabs
  const closeAllTabs = useCallback(() => {
    setFileTabs([])
    setActiveTabId(null)
    onContentChange?.(null)
  }, [onContentChange])

  // Handle right-click context menu
  const handleTabContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault()
    setContextMenuTab(tabId)
  }, [])





  // Listen for YouTube API responses and periodic state saving
  useEffect(() => {
    let stateInterval: NodeJS.Timeout

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return

      try {
        const data = JSON.parse(event.data)
        console.log('YouTube API message:', data)

        // Handle different types of YouTube API responses
        if (data.event === 'video-progress' || data.info) {
          const currentTab = fileTabs.find(tab => tab.isActive && tab.type === 'video')
          if (currentTab) {
            const state = {
              videoCurrentTime: data.info?.currentTime || data.currentTime,
              videoDuration: data.info?.duration || data.duration,
              videoPlaybackRate: data.info?.playbackRate || data.playbackRate,
              isVideoPlaying: (data.info?.playerState || data.playerState) === 1
            }
            console.log('Saving video state from API:', state)
            saveTabState(currentTab.id, state)
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }

    // Periodic state saving for active video tabs
    const saveActiveVideoState = () => {
      const activeVideoTab = fileTabs.find(tab => tab.isActive && tab.type === 'video')
      if (activeVideoTab) {
        console.log('Periodic state save for:', activeVideoTab.id)
        saveVideoState(activeVideoTab.id)
      }
    }

    // Set up periodic saving every 3 seconds
    stateInterval = setInterval(saveActiveVideoState, 3000)

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
      if (stateInterval) {
        clearInterval(stateInterval)
      }
    }
  }, [fileTabs, saveTabState, saveVideoState])



  // Get the currently active content
  const activeContent = fileTabs.find(tab => tab.id === activeTabId)?.content || null

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (fileTabs.length === 0) return

    // Ctrl/Cmd + W to close current tab
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
      e.preventDefault()
      if (activeTabId) {
        removeFileTab(activeTabId)
      }
    }

    // Ctrl/Cmd + Tab to switch tabs
    if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
      e.preventDefault()
      const currentIndex = fileTabs.findIndex(tab => tab.id === activeTabId)
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + fileTabs.length) % fileTabs.length
        : (currentIndex + 1) % fileTabs.length
      switchToTab(fileTabs[nextIndex].id)
    }

    // Ctrl/Cmd + 1-9 to switch to specific tab
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
      e.preventDefault()
      const tabIndex = parseInt(e.key) - 1
      if (tabIndex < fileTabs.length) {
        switchToTab(fileTabs[tabIndex].id)
      }
    }
  }, [fileTabs, activeTabId, removeFileTab, switchToTab])

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Expose methods for external use
  useEffect(() => {
    // Attach methods to window for external access (temporary solution)
    ;(window as any).multiCourseManager = {
      addContent: addOrUpdateFileTab,
      removeTab: removeFileTab,
      switchTab: switchToTab,
      closeOtherTabs,
      closeAllTabs,
      getTabs: () => fileTabs,
      getActiveTab: () => activeContent,
      getTabCount: () => fileTabs.length,
      getTabStates: () => Object.fromEntries(tabStates),
      saveTabState,
      getTabState: (tabId: string) => tabStates.get(tabId)
    }
  }, [addOrUpdateFileTab, removeFileTab, switchToTab, closeOtherTabs, closeAllTabs, fileTabs, activeContent, tabStates, saveTabState])

  if (fileTabs.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center h-full p-4 sm:p-6 lg:p-8",
        className
      )}>
        <div className="text-center max-w-sm sm:max-w-md lg:max-w-lg animate-slide-up">
          {/* Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-primary-lg transform hover:scale-105 transition-transform duration-300">
            <span className="text-primary-foreground font-bold text-xl sm:text-2xl lg:text-3xl">DIU</span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent mb-4 leading-tight">
            Welcome to DIU CSE Learning Platform
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-6 text-sm sm:text-base lg:text-lg leading-relaxed">
            Access your course materials, watch video lectures, and study with interactive content
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-xs sm:text-sm">
            <div className="flex flex-col items-center p-3 bg-card/50 rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 dark:text-blue-400 text-sm">📊</span>
              </div>
              <span className="text-muted-foreground">Slides</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card/50 rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-red-600 dark:text-red-400 text-sm">🎥</span>
              </div>
              <span className="text-muted-foreground">Videos</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card/50 rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 dark:text-green-400 text-sm">📚</span>
              </div>
              <span className="text-muted-foreground">Documents</span>
            </div>
          </div>

          {/* Hint */}
          <div className="text-xs text-muted-foreground/70 mt-4">
            Select content from the sidebar to start learning
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* File Tabs Header */}
      <div className="flex-none border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-1 sm:px-2 py-1">
          {/* Tabs */}
          <ScrollArea className="flex-1 file-tabs-container">
            <div className="flex items-center gap-1 px-2">
              {fileTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={cn(
                    "file-tab flex items-center gap-2 h-8 px-3 rounded-md cursor-pointer transition-all duration-200",
                    "hover:bg-accent/80 hover:scale-[1.02]",
                    "min-w-[120px] max-w-[192px] sm:min-w-[140px] sm:max-w-[200px] lg:min-w-[160px] lg:max-w-[220px]",
                    tab.isActive
                      ? "file-tab-active bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => switchToTab(tab.id)}
                  onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
                  title={`${tab.title} - ${tab.courseTitle || 'Unknown Course'}`}
                >
                  {getFileIcon(tab.type)}
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className={cn(
                      "file-tab-title text-xs font-medium truncate",
                      "max-w-[80px] sm:max-w-[100px] lg:max-w-[120px]"
                    )}>
                      {tab.title}
                    </span>
                    {tab.courseCode && (
                      <span className="text-[10px] text-muted-foreground/70 truncate max-w-[80px] sm:max-w-[100px]">
                        {tab.courseCode}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFileTab(tab.id)
                    }}
                    className={cn(
                      "file-tab-close h-4 w-4 p-0 ml-1 rounded-sm flex items-center justify-center transition-all duration-200",
                      "hover:bg-destructive/20 hover:scale-110",
                      tab.isActive
                        ? "text-primary-foreground/70 hover:text-destructive"
                        : "text-muted-foreground hover:text-destructive"
                    )}
                    title="Close file"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Controls */}
          <div className="file-tabs-controls flex items-center gap-1 ml-2">
            {/* Tab count indicator for mobile */}
            <div className="hidden sm:flex items-center gap-1">
              {fileTabs.length > 1 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  {fileTabs.length}
                </Badge>
              )}
            </div>

            {/* More options for many tabs */}
            {fileTabs.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent/80 transition-all duration-200"
                title="More options"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            )}

            {/* Expand/Minimize toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 hover:bg-accent/80 transition-all duration-200"
              title={isExpanded ? "Minimize view" : "Maximize view"}
            >
              {isExpanded ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeContent && (
          <div className="h-full">
            <LazyContentViewer
              content={{
                ...activeContent,
                // Add tab ID for state management
                tabId: activeTabId
              }}
              isLoading={false}
              savedState={activeTabId ? tabStates.get(activeTabId) : undefined}
              onStateChange={(state) => {
                if (activeTabId) {
                  saveTabState(activeTabId, state)
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Content Info Footer */}
      {activeContent && (
        <div className="flex-none bg-card/95 backdrop-blur-sm px-3 py-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Badge variant="secondary" className="text-xs shrink-0">
                {activeContent.type}
              </Badge>
              <span className="text-sm font-medium truncate">
                {activeContent.title}
              </span>
              {activeContent.topicTitle && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  • {activeContent.topicTitle}
                </span>
              )}
              {fileTabs.length > 1 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 ml-auto shrink-0">
                  {fileTabs.findIndex(tab => tab.id === activeTabId) + 1} of {fileTabs.length}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground shrink-0 ml-2">
              {activeContent.courseTitle}
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          {fileTabs.length > 1 && (
            <div className="text-[10px] text-muted-foreground/60 mt-1 hidden lg:block">
              Ctrl+Tab: Switch tabs • Ctrl+W: Close tab • Ctrl+1-9: Jump to tab
            </div>
          )}
        </div>
      )}
    </div>
  )
}

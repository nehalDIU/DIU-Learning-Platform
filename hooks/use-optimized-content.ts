"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cache } from "@/lib/cache"

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

interface UseOptimizedContentOptions {
  preloadNext?: boolean
  cacheStrategy?: 'aggressive' | 'normal' | 'minimal'
  enablePrefetch?: boolean
}

interface ContentState {
  content: ContentItem | null
  isLoading: boolean
  error: string | null
  progress: number
}

export function useOptimizedContent(options: UseOptimizedContentOptions = {}) {
  const {
    preloadNext = true,
    cacheStrategy = 'normal',
    enablePrefetch = true
  } = options

  const [state, setState] = useState<ContentState>({
    content: null,
    isLoading: false,
    error: null,
    progress: 0
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const prefetchQueueRef = useRef<Set<string>>(new Set())

  // Cache TTL based on strategy
  const getCacheTTL = useCallback(() => {
    switch (cacheStrategy) {
      case 'aggressive': return 30 * 60 * 1000 // 30 minutes
      case 'minimal': return 2 * 60 * 1000 // 2 minutes
      default: return 10 * 60 * 1000 // 10 minutes
    }
  }, [cacheStrategy])

  // Optimized content fetcher with caching
  const fetchContent = useCallback(async (
    type: string,
    id: string,
    signal?: AbortSignal
  ): Promise<ContentItem> => {
    const cacheKey = `content-${type}-${id}`
    
    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Determine API endpoint - use full APIs for complete course/topic data
    let apiEndpoint: string
    if (type === 'slide') {
      apiEndpoint = `/api/slides/${id}`
    } else if (type === 'video') {
      apiEndpoint = `/api/videos/${id}`
    } else if (type === 'study-tool') {
      apiEndpoint = `/api/study-tools/${id}`
    } else {
      apiEndpoint = `/api/${type}s/${id}`
    }

    // Add cache busting parameter to force fresh data
    const cacheBustingUrl = `${apiEndpoint}?v=${Date.now()}`
    console.log("🔄 Optimized Content Hook - API Endpoint:", cacheBustingUrl)
    const response = await fetch(cacheBustingUrl, { signal })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Cache the result
    cache.set(cacheKey, data, getCacheTTL())
    
    return data
  }, [getCacheTTL])

  // Load content with progress tracking
  const loadContent = useCallback(async (type: string, id: string) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0
    }))

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 100)

      const content = await fetchContent(type, id, abortController.signal)

      clearInterval(progressInterval)

      if (!abortController.signal.aborted) {
        setState({
          content,
          isLoading: false,
          error: null,
          progress: 100
        })

        // Prefetch related content if enabled
        if (enablePrefetch && preloadNext) {
          prefetchRelatedContent(content)
        }
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        setState({
          content: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load content',
          progress: 0
        })
      }
    }
  }, [fetchContent, enablePrefetch, preloadNext])

  // Prefetch related content in background
  const prefetchRelatedContent = useCallback(async (currentContent: ContentItem) => {
    if (!enablePrefetch) return

    try {
      // Prefetch other content from the same topic/course
      const relatedEndpoint = `/api/content/related/${currentContent.id}`
      const response = await fetch(relatedEndpoint)
      
      if (response.ok) {
        const relatedItems = await response.json()
        
        // Prefetch up to 3 related items
        const itemsToPrefetch = relatedItems.slice(0, 3)
        
        for (const item of itemsToPrefetch) {
          if (!prefetchQueueRef.current.has(item.id)) {
            prefetchQueueRef.current.add(item.id)
            
            // Prefetch in background without blocking
            setTimeout(() => {
              fetchContent(item.type, item.id).catch(() => {
                // Ignore prefetch errors
              }).finally(() => {
                prefetchQueueRef.current.delete(item.id)
              })
            }, 1000)
          }
        }
      }
    } catch {
      // Ignore prefetch errors
    }
  }, [enablePrefetch, fetchContent])

  // Clear content
  const clearContent = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    setState({
      content: null,
      isLoading: false,
      error: null,
      progress: 0
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    loadContent,
    clearContent,
    cacheStats: cache.getStats(),
    hitRate: cache.getHitRate()
  }
}

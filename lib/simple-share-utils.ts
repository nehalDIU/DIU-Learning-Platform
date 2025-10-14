/**
 * Simplified share utilities for basic functionality
 */

export function generateSimpleShareUrl(contentType: string, contentId: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001')
  
  switch (contentType) {
    case 'video':
      return `${base}/video/${contentId}`
    case 'slide':
    case 'document':
      return `${base}/slide/${contentId}`
    case 'study-tool':
    case 'syllabus':
      return `${base}/study-tool/${contentId}`
    default:
      return `${base}/slide/${contentId}`
  }
}

export function parseSimpleShareUrl(url: string): { type: string; id: string } | null {
  try {
    console.log("Parsing URL:", url)
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    console.log("Path parts:", pathParts)

    if (pathParts.length >= 2) {
      const [type, id] = pathParts
      console.log("Type:", type, "ID:", id)

      if ((type === 'video' || type === 'slide' || type === 'study-tool') && id) {
        const result = { type, id }
        console.log("Parsed result:", result)
        return result
      }
    }

    console.log("No valid shareable URL pattern found")
    return null
  } catch (error) {
    console.error('Error parsing URL:', error)
    return null
  }
}

export function updateUrlWithoutNavigation(url: string): void {
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', url)
  }
}

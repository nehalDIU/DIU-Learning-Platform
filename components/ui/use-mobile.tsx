import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      // Consider both width and orientation for better mobile detection
      const isMobileDevice = width < MOBILE_BREAKPOINT ||
                            (width < 1024 && height > width) || // Portrait tablets
                            ('ontouchstart' in window && width < 1024) // Touch devices
      setIsMobile(isMobileDevice)
    }
    mql.addEventListener("change", onChange)
    onChange() // Call immediately to set initial state
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

import React, { createContext, useContext, useState, useEffect } from 'react'

const ScreenSizeContext = createContext(null)

export const ScreenSizeProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1200,
        height: 800,
        isMobile: false,
        isSmallPhone: false,
        isTablet: false,
        isDesktop: true,
        orientation: 'landscape'
      }
    }
    const width = window.innerWidth
    const height = window.innerHeight
    return {
      width,
      height,
      isMobile: width < 640,
      isSmallPhone: width < 380,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024,
      orientation: width < height ? 'portrait' : 'landscape'
    }
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 640
      const isSmallPhone = width < 380
      const isTablet = width >= 640 && width < 1024
      const isDesktop = width >= 1024
      const orientation = width < height ? 'portrait' : 'landscape'

      // Synchronize CSS custom properties and root font scaling
      const doc = document.documentElement
      doc.style.setProperty('--vh', `${height * 0.01}px`)
      doc.style.setProperty('--screen-width', `${width}px`)
      doc.setAttribute('data-device', isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop')
      doc.setAttribute('data-small-phone', isSmallPhone ? 'true' : 'false')

      setScreenSize({
        width,
        height,
        isMobile,
        isSmallPhone,
        isTablet,
        isDesktop,
        orientation
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return (
    <ScreenSizeContext.Provider value={screenSize}>
      {children}
    </ScreenSizeContext.Provider>
  )
}

export const useScreenSize = () => {
  const context = useContext(ScreenSizeContext)
  if (!context) {
    // Return sensible fallback if accessed outside provider
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200
    return {
      width,
      height: typeof window !== 'undefined' ? window.innerHeight : 800,
      isMobile: width < 640,
      isSmallPhone: width < 380,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024,
      orientation: 'landscape'
    }
  }
  return context
}

export default ScreenSizeContext

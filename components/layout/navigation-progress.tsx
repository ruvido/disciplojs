'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  // Show a progress bar at the top during navigation
  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-0.5 bg-primary animate-pulse">
      <div className="h-full w-full bg-primary/50 animate-pulse" />
    </div>
  )
}
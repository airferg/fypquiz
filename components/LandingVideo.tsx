'use client'

import { useRef, useEffect, useState } from 'react'

export default function LandingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const video = videoRef.current
    if (video) {
      // Force autoplay
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.autoplay = true
      video.controls = false
      
      // Try to play immediately
      const playVideo = () => {
        video.play().catch((error) => {
          console.log('Autoplay failed, will try on user interaction:', error)
        })
      }
      
      playVideo()
      
      // Also try to play on any user interaction
      const handleUserInteraction = () => {
        if (video.paused) {
          video.play().catch(console.error)
        }
      }
      
      document.addEventListener('click', handleUserInteraction, { once: true })
      document.addEventListener('touchstart', handleUserInteraction, { once: true })
      
      return () => {
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('touchstart', handleUserInteraction)
      }
    }
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full max-w-sm mx-auto px-4">
        <div className="relative w-full aspect-[9/16] rounded-[15px] overflow-hidden shadow-2xl bg-gray-200 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400">Loading video...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <div className="relative w-full aspect-[9/16] rounded-[15px] overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          src="/landingpagesr.mov"
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          autoPlay
          controls={false}
          preload="auto"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}

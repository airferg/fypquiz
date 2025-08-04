'use client'

import { useEffect, useRef } from 'react'

interface BackgroundVideoProps {
  src: string
  className?: string
}

export default function BackgroundVideo({ src, className = '' }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch(console.error)
    }
  }, [])

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 overflow-hidden ${className}`}>
      <div className="w-96 h-192 bg-black rounded-2xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="/placeholder-bg.jpg"
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
    </div>
  )
} 
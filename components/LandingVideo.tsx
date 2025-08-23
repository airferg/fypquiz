'use client'

import { useRef, useEffect } from 'react'

export default function LandingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Set video properties
      video.muted = true
      video.loop = true
      video.playsInline = true
      
      // Try to play
      const attemptPlay = async () => {
        try {
          await video.play()
        } catch (error) {
          console.log('Autoplay prevented:', error)
        }
      }
      
      attemptPlay()
    }
  }, [])

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
          preload="auto"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}

'use client'

import { useRef, useEffect } from 'react'

export default function LandingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Ensure video plays when component mounts
      video.play().catch(console.error)
      
      // Set up loop and other properties
      video.loop = true
      video.muted = true
      video.controls = false
      video.playsInline = true
      video.autoplay = true
      
      // Add error handling
      video.addEventListener('error', (e) => {
        console.error('Video error:', e)
      })
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
          controls={false}
          preload="auto"
          poster="/fypquizlogo.png"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}

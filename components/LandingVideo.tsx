'use client'

import { useRef, useEffect } from 'react'

export default function LandingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      console.log('Video element found, setting properties...')
      
      // Set video properties
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.autoplay = true
      
      // Add event listeners for debugging
      video.addEventListener('loadstart', () => console.log('Video loadstart'))
      video.addEventListener('loadedmetadata', () => console.log('Video loadedmetadata'))
      video.addEventListener('loadeddata', () => console.log('Video loadeddata'))
      video.addEventListener('canplay', () => console.log('Video canplay'))
      video.addEventListener('canplaythrough', () => console.log('Video canplaythrough'))
      video.addEventListener('playing', () => console.log('Video playing'))
      video.addEventListener('error', (e) => {
        console.error('Video error:', e)
        console.error('Video error details:', video.error)
        console.error('Video networkState:', video.networkState)
        console.error('Video readyState:', video.readyState)
      })
      
      // Force play
      const playVideo = async () => {
        try {
          console.log('Attempting to play video...')
          await video.play()
          console.log('Video play successful')
        } catch (error) {
          console.log('Autoplay failed, trying again:', error)
          // Try again after a short delay
          setTimeout(async () => {
            try {
              await video.play()
              console.log('Retry successful')
            } catch (retryError) {
              console.log('Retry failed:', retryError)
            }
          }, 100)
        }
      }
      
      // Wait for video to be ready
      if (video.readyState >= 2) {
        playVideo()
      } else {
        video.addEventListener('canplay', playVideo)
      }
    }
  }, [])

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <div className="relative w-full aspect-[9/16] rounded-[15px] overflow-hidden shadow-2xl bg-gray-100">
        <video
          ref={videoRef}
          src="/landingpagesr.mov"
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          autoPlay
          preload="auto"
          controls={false}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}

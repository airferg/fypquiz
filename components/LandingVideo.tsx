'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Pause } from 'lucide-react'

export default function LandingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Set video properties
      video.muted = true
      video.loop = true
      video.playsInline = true
      
      // Try to autoplay
      const attemptAutoplay = async () => {
        try {
          await video.play()
          setIsPlaying(true)
        } catch (error) {
          console.log('Autoplay prevented:', error)
          // Autoplay failed, show play button
        }
      }
      
      attemptAutoplay()
      
      // Add event listeners
      video.addEventListener('play', () => setIsPlaying(true))
      video.addEventListener('pause', () => setIsPlaying(false))
      video.addEventListener('ended', () => setIsPlaying(false))
    }
  }, [])

  const togglePlay = async () => {
    const video = videoRef.current
    if (video) {
      try {
        if (isPlaying) {
          video.pause()
        } else {
          await video.play()
          setHasUserInteracted(true)
        }
      } catch (error) {
        console.error('Error toggling video:', error)
      }
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <div className="relative w-full aspect-[9/16] rounded-[15px] overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          src="/landingpagesr.mp4"
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Play/Pause Button Overlay */}
        {(!isPlaying || !hasUserInteracted) && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-300 group"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
              {isPlaying ? (
                <Pause className="h-8 w-8 text-gray-800" />
              ) : (
                <Play className="h-8 w-8 text-gray-800 ml-1" />
              )}
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

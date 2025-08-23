'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowLeft, Play, Video, Settings, Volume2, VolumeX } from 'lucide-react'


// Disable SSR for this page
export const dynamic = 'force-dynamic'

const videos = [
  { label: 'Minecraft_video1', src: '/videos/Minecraft_video1.mp4' },
  { label: 'Minecraft_video2', src: '/videos/Minecraft_video2.mp4' },
  { label: 'Minecraft_video3', src: '/videos/Minecraft_video3.mp4' },
  { label: 'Minecraft_video4', src: '/videos/Minecraft_video4.mp4' },
  { label: 'Minecraft_video5', src: '/videos/Minecraft_video5.mp4' },
  { label: 'Minecraft_video6', src: '/videos/Minecraft_video6.mp4' },
  { label: 'Spiderman_video1', src: '/videos/Spiderman_video1.mp4' },
  { label: 'Spiderman_video2', src: '/videos/Spiderman_video2.mp4' },
  { label: 'Spiderman_video3', src: '/videos/Spiderman_video3.mp4' },
  { label: 'Spiderman_video4', src: '/videos/Spiderman_video4.mp4' },
  { label: 'gta_video1', src: '/videos/gta-video1.mp4' },
  { label: 'lofi-study', src: '/videos/lofi-study.mp4' },
  { label: 'nature-scene', src: '/videos/nature-scene.mp4' }
]

export default function VideosPage() {
  const router = useRouter()
  const [selectedVideo, setSelectedVideo] = useState<string>('')

  const handleVideoSelect = (videoLabel: string) => {
    setSelectedVideo(videoLabel)
  }

  const handleNext = () => {
    if (selectedVideo) {
      // Store the selected video in session storage
      sessionStorage.setItem('selectedVideo', selectedVideo)
      router.push('/quiz')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Background</h1>
          <p className="text-gray-600">
            Pick a background video to help you focus while studying
          </p>
        </div>

        {/* Spacer for centering */}
        <div className="h-8"></div>

        {/* Video Feed */}
        <div className="space-y-4 pb-4">
          {videos.map((video) => (
            <div 
              key={video.label} 
              className={`
                relative w-full max-w-sm mx-auto cursor-pointer transition-all
                ${selectedVideo === video.label 
                  ? 'ring-2 ring-[#5CA4F6]' 
                  : ''
                }
              `}
              onClick={() => handleVideoSelect(video.label)}
            >
              <video
                src={video.src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-[9/16] rounded-lg bg-gray-200 object-cover"
              />
              {selectedVideo === video.label && (
                <div className="absolute top-4 right-4 bg-[#5CA4F6] text-white rounded-full p-2">
                  <Check className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleNext}
            disabled={!selectedVideo}
            className={`
              px-8 py-3 rounded-full font-semibold text-lg transition-all shadow-lg
              ${selectedVideo
                ? 'bg-[#5CA4F6] text-white hover:bg-[#5CA4F6]/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {selectedVideo ? 'Continue' : 'Select a video'}
          </button>
        </div>
      </div>
    </div>
  )
}
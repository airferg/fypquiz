'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'


// Disable SSR for this page
export const dynamic = 'force-dynamic'

const videos = [
  // Minecraft
  { label: 'Minecraft_video1', src: '/videos/Minecraft_video1.mp4' },
  { label: 'Minecraft_video2', src: '/videos/Minecraft_video2.mp4' },
  { label: 'Minecraft_video3', src: '/videos/Minecraft_video3.mp4' },
  { label: 'Minecraft_video4', src: '/videos/Minecraft_video4.mp4' },
  { label: 'Minecraft_video5', src: '/videos/Minecraft_video5.mp4' },
  { label: 'Minecraft_video6', src: '/videos/Minecraft_video6.mp4' },
  // Spiderman
  { label: 'Spiderman_video1', src: '/videos/Spiderman_video1.mp4' },
  { label: 'Spiderman_video2', src: '/videos/Spiderman_video2.mp4' },
  { label: 'Spiderman_video3', src: '/videos/Spiderman_video3.mp4' },
  { label: 'Spiderman_video4', src: '/videos/Spiderman_video4.mp4' },
  // GTA
  { label: 'GTA_video1', src: '/videos/gta-video1.mp4' },
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
      // Navigate back to quiz creation
      router.push('/quiz')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.push('/quiz')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Choose Video</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Video Feed */}
        <div className="space-y-4 pb-4">
          {videos.map((video) => (
            <div 
              key={video.label} 
              className={`
                relative w-full max-w-sm mx-auto cursor-pointer transition-all
                ${selectedVideo === video.label 
                  ? 'ring-2 ring-accent' 
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
                className="w-full aspect-[9/16] rounded-lg bg-black object-cover"
              />
              {selectedVideo === video.label && (
                <div className="absolute top-4 right-4 bg-accent text-white rounded-full p-2">
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
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
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
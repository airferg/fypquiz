'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { ArrowLeft, Play, Trophy, Calendar, FileText, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'


// Disable SSR for this page
export const dynamic = 'force-dynamic'

interface StudySet {
  id: string
  title: string
  quiz_data: {
    questions: Array<{
      question: string
      choices: string[]
      correctIndex: number
      voiceScript: string
    }>
    title: string
  }
  background_video: string
  voice_selection: string
  created_at: string
  last_score?: number
  total_questions?: number
  audio_files?: { [key: string]: string }
}

export default function CollectionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [studySets, setStudySets] = useState<StudySet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)


  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    fetchStudySets()
  }, [user, router])

  const fetchStudySets = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch('/api/save-study-set', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStudySets(data.studySets || [])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch study sets')
      }
    } catch (error) {
      console.error('Error fetching study sets:', error)
      setError(error instanceof Error ? error.message : 'Failed to load study sets')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateScorePercentage = (score: number, total: number) => {
    if (total === 0) return 0
    return Math.round((score / total) * 100)
  }

  const handleDeleteQuiz = async (studySetId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return
    }

    setDeletingId(studySetId)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch('/api/delete-study-set', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ studySetId }),
      })

      if (response.ok) {
        // Remove the deleted study set from the state
        setStudySets(prev => prev.filter(set => set.id !== studySetId))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete study set')
      }
    } catch (error) {
      console.error('Error deleting study set:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete study set')
    } finally {
      setDeletingId(null)
    }
  }

  const getVideoPath = (videoName: string) => {
    // Map video names to their actual file paths
    const videoMap: { [key: string]: string } = {
      'minecraft_video1': '/videos/Minecraft_video1.mp4',
      'minecraft_video2': '/videos/Minecraft_video2.mp4',
      'minecraft_video3': '/videos/Minecraft_video3.mp4',
      'minecraft_video4': '/videos/Minecraft_video4.mp4',
      'minecraft_video5': '/videos/Minecraft_video5.mp4',
      'minecraft_video6': '/videos/Minecraft_video6.mp4',
      'Spiderman_video1': '/videos/Spiderman_video1.mp4',
      'Spiderman_video2': '/videos/Spiderman_video2.mp4',
      'Spiderman_video3': '/videos/Spiderman_video3.mp4',
      'Spiderman_video4': '/videos/Spiderman_video4.mp4',
      'gta_video1': '/videos/gta-video1.mp4',
    }
    console.log('Getting video path for:', videoName, '->', videoMap[videoName] || videoName)
    return videoMap[videoName] || videoName
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading your collection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <Trophy className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Collection</h1>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Back Button - Outside Header */}
      <div className="fixed top-4 left-4 z-[9999]">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-white">My Collection</h1>
              <p className="text-gray-300">Your saved study sets</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-accent" />
            <span className="text-white font-semibold">{studySets.length} sets</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">

        
        {studySets.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No study sets yet</h2>
            <p className="text-gray-300 mb-6">Complete some quizzes to see them here!</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              Create Your First Quiz
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-16">
              {studySets.map((studySet) => (
                <div
                  key={studySet.id}
                  className="flex flex-col"
                >
                  {/* Quiz Card */}
                  <div className="bg-gray-800 rounded-2xl p-6 mb-4 min-w-[400px]">
                    {/* Quiz Title */}
                    <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                      {studySet.title}
                    </h3>
                    
                    {/* Date and Question Count */}
                    <div className="text-sm text-gray-300 mb-4 space-y-1">
                      <div>{formatDate(studySet.created_at)}</div>
                      <div>{studySet.quiz_data.questions.length} Questions</div>
                    </div>

                    {/* Score Display */}
                    {studySet.last_score !== undefined && studySet.total_questions && (
                      <div className="mt-auto">
                        <div className="text-sm text-gray-300 mb-1">Last Score</div>
                        <div className={`text-3xl font-bold ${
                          (() => {
                            const percentage = calculateScorePercentage(studySet.last_score, studySet.total_questions)
                            if (percentage >= 0 && percentage <= 59) return 'text-red-500'
                            if (percentage >= 60 && percentage <= 70) return 'text-yellow-500'
                            if (percentage >= 71 && percentage <= 80) return 'text-yellow-400'
                            if (percentage >= 80 && percentage <= 90) return 'text-green-500'
                            if (percentage >= 91 && percentage <= 100) return 'text-green-400 animate-pulse drop-shadow-lg'
                            return 'text-gray-400'
                          })()
                        }`}>
                          {calculateScorePercentage(studySet.last_score, studySet.total_questions)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Retake Quiz clicked for:', studySet.title)
                        console.log('Quiz data:', studySet.quiz_data)
                        console.log('Video:', studySet.background_video)
                        console.log('Voice:', studySet.voice_selection)
                        
                        // Navigate to quiz with this study set
                        sessionStorage.setItem('quizData', JSON.stringify(studySet.quiz_data))
                        sessionStorage.setItem('selectedVideo', studySet.background_video)
                        sessionStorage.setItem('selectedVoice', studySet.voice_selection)
                        sessionStorage.setItem('savedAudioFiles', JSON.stringify(studySet.audio_files || {}))
                        
                        console.log('Session storage set, navigating to quiz...')
                        router.push('/quiz')
                      }}
                      onMouseDown={(e) => {
                        console.log('Button mouse down event')
                      }}
                      onMouseUp={(e) => {
                        console.log('Button mouse up event')
                      }}
                      className="flex-1 bg-accent text-white py-3 px-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors cursor-pointer relative z-20"
                    >
                      Retake Quiz
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteQuiz(studySet.id)
                      }}
                      disabled={deletingId === studySet.id}
                      className="bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors cursor-pointer relative z-20 flex items-center justify-center"
                    >
                      {deletingId === studySet.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
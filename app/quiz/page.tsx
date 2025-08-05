'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import QuizPlayer from '@/components/QuizPlayer'
import { ArrowLeft, Trophy, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Disable SSR for this page
export const dynamic = 'force-dynamic'

interface Question {
  question: string
  choices: string[]
  correctIndex: number
  voiceScript: string
}

interface QuizData {
  questions: Question[]
  title: string
}

const videoOptions = [
  // Minecraft videos
  { id: 'minecraft_video1', label: 'Minecraft_video1', name: 'Minecraft Parkour 1', category: 'Minecraft', src: '/video_library/Minecraft_Parkour/Minecraft_video1.mp4' },
  { id: 'minecraft_video2', label: 'Minecraft_video2', name: 'Minecraft Parkour 2', category: 'Minecraft', src: '/video_library/Minecraft_Parkour/Minecraft_video2.mp4' },
  { id: 'minecraft_video3', label: 'Minecraft_video3', name: 'Minecraft Parkour 3', category: 'Minecraft', src: '/video_library/Minecraft_Parkour/Minecraft_video3.mp4' },
  { id: 'minecraft_video4', label: 'Minecraft_video4', name: 'Minecraft Parkour 4', category: 'Minecraft', src: '/video_library/Minecraft_Parkour/Minecraft_video4.mp4' },
  { id: 'minecraft_video5', label: 'Minecraft_video5', name: 'Minecraft Parkour 5', category: 'Minecraft', src: '/video_library/Minecraft_Parkour/Minecraft_video5.mp4' },
  { id: 'minecraft_video6', label: 'Minecraft_video6', name: 'Minecraft Parkour 6', category: 'Minecraft', src: '/video_library/Minecraft_Parkour/Minecraft_video6.mp4' },
  { id: 'minecraft_video7', label: 'Minecraft_video7', name: 'Minecraft Parkour 7', category: 'Minecraft', src: '/video_library/Minecraft_Parkour/Minecraft_video7.mp4' },
  
  // Spiderman videos
  { id: 'spiderman_video1', label: 'Spiderman_video1', name: 'Spider-Man 1', category: 'Spider-Man', src: '/video_library/spiderman_videos/Spiderman_video1.mp4' },
  { id: 'spiderman_video2', label: 'Spiderman_video2', name: 'Spider-Man 2', category: 'Spider-Man', src: '/video_library/spiderman_videos/Spiderman_video2.mp4' },
  { id: 'spiderman_video3', label: 'Spiderman_video3', name: 'Spider-Man 3', category: 'Spider-Man', src: '/video_library/spiderman_videos/Spiderman_video3.mp4' },
  { id: 'spiderman_video4', label: 'Spiderman_video4', name: 'Spider-Man 4', category: 'Spider-Man', src: '/video_library/spiderman_videos/Spiderman_video4.mp4' },
  
  // GTA videos
  { id: 'gta_video1', label: 'GTA_video1', name: 'GTA 5 Gameplay', category: 'GTA', src: '/video_library/gta_videos/GTA_video1.mp4' },
]

const voiceOptions = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Clear and professional female voice' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Energetic and engaging female voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Warm and friendly female voice' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Confident and clear male voice' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Cheerful and upbeat female voice' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Casual and relatable male voice' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Strong and authoritative male voice' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Smooth and professional male voice' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', description: 'Friendly and approachable male voice' },
  
  // New voices added
  { id: '7c65Pcpdzr0GkR748U7h', name: 'Jaysoft', description: 'Professional and clear voice' },
  { id: 'giAoKpl5weRTCJK7uB9b', name: 'Owen', description: 'Warm and engaging male voice' },
  { id: 'gJEfHTTiifXEDmO687lC', name: 'Prince Nuri', description: 'Elegant and sophisticated voice' },
  { id: 'YOq2y2Up4RgXP2HyXjE5', name: 'Halo', description: 'Smooth and melodic voice' },
  { id: 'Bj9UqZbhQsanLzgalpEG', name: 'Austin', description: 'Casual and friendly male voice' },
  { id: 'NOpBlnGInO9m6vDvFkFC', name: 'Grandpa', description: 'Wise and experienced voice' },
  { id: 'wo6udizrrtpIxWGp2qJk', name: 'Northern Terry', description: 'Distinctive northern accent' },
  { id: 'yjJ45q8TVCrtMhEKurxY', name: 'Mad Scientist', description: 'Eccentric and enthusiastic voice' },
  { id: 'gU0LNdkMOQCOrPrwtbee', name: 'British Football Announcer', description: 'Exciting sports commentary voice' },
  { id: '4YYIPFl9wE5c4L2eu2Gb', name: 'Burt Reynolds', description: 'Classic and charismatic voice' },
  { id: 'OYWwCdDHouzDwiZJWOOu', name: 'Cowboy', description: 'Rugged and authentic western voice' },
  { id: 'qNkzaJoHLLdpvgh5tISm', name: 'Hank', description: 'Down-to-earth and relatable voice' },
  { id: 'vfaqCOvlrKi4Zp7C2IAm', name: 'Demon', description: 'Dark and mysterious voice' },
  { id: 'piI8Kku0DcvcL6TTSeQt', name: 'Fairy', description: 'Magical and enchanting voice' },
  { id: 'oR4uRy4fHDUGGISL0Rev', name: 'Myrrdin', description: 'Mystical and ancient voice' },
  { id: 'ZF6FPAbjXT4488VcRRnw', name: 'Amelia', description: 'Elegant and refined female voice' },
  { id: '1hlpeD1ydbI2ow0Tt3EW', name: 'Oracle', description: 'Wise and prophetic voice' },
  { id: 'EiNlNiXeDU1pqqOPrYMO', name: 'John Doe', description: 'Everyday and approachable voice' },
  { id: 'FF7KdobWPaiR0vkcALHF', name: 'Movie Trailer Guy', description: 'Dramatic and cinematic voice' },
  { id: 'eVItLK1UvXctxuaRV2Oq', name: 'Female Villain', description: 'Sinister and commanding female voice' },
  { id: 'UgBBYS2sOqTuMpoF3BR0', name: 'Podcaster', description: 'Conversational and engaging voice' },
  
  // Additional voices
  { id: 'CeNX9CMwmxDxUF5Q2Inm', name: '80s Radio DJ', description: 'Retro and energetic radio voice' },
  { id: 'st7NwhTPEzqo2riw7qWC', name: 'Blondie', description: 'Classic rock and roll female voice' },
  { id: 'mtrellq69YZsNwzUSyXh', name: 'Monster of Rock', description: 'Heavy metal and rock voice' },
  { id: 'KH1SQLVulwP6uG4O3nmT', name: 'Brad', description: 'Smooth and confident male voice' },
  { id: 'pjcYQlDFKMbcOUp6F5GD', name: 'Brittney', description: 'Bright and energetic female voice' },
  { id: 'WuLq5z7nEcrhppO0ZQJw', name: 'Martin Li', description: 'Professional and articulate male voice' },
]

// Voice categories for better organization
const voiceCategories = [
  { id: 'all', name: 'All Voices', count: 36 },
  { id: 'professional', name: 'Professional', count: 15 },
  { id: 'character', name: 'Character', count: 12 },
  { id: 'music', name: 'Music & Entertainment', count: 9 },
]

// Categorize voices
const categorizedVoices = {
  professional: ['21m00Tcm4TlvDq8ikWAM', 'AZnzlk1XvdvUeBnXmlld', 'EXAVITQu4vr4xnSDxMaL', 'ErXwobaYiN019PkySvjV', 'MF3mGyEYCl7XYWbV9V6O', 'TxGEqnHWrfWFTfGW9XjX', 'VR6AewLTigWG4xSOukaG', 'pNInz6obpgDQGcFmaJgB', 'yoZ06aMxZJJ28mfd3POQ', '7c65Pcpdzr0GkR748U7h', 'giAoKpl5weRTCJK7uB9b', 'gJEfHTTiifXEDmO687lC', 'YOq2y2Up4RgXP2HyXjE5', 'Bj9UqZbhQsanLzgalpEG', 'WuLq5z7nEcrhppO0ZQJw'],
  character: ['NOpBlnGInO9m6vDvFkFC', 'wo6udizrrtpIxWGp2qJk', 'yjJ45q8TVCrtMhEKurxY', 'qNkzaJoHLLdpvgh5tISm', 'vfaqCOvlrKi4Zp7C2IAm', 'piI8Kku0DcvcL6TTSeQt', 'oR4uRy4fHDUGGISL0Rev', 'ZF6FPAbjXT4488VcRRnw', '1hlpeD1ydbI2ow0Tt3EW', 'EiNlNiXeDU1pqqOPrYMO', 'eVItLK1UvXctxuaRV2Oq', 'UgBBYS2sOqTuMpoF3BR0'],
  music: ['gU0LNdkMOQCOrPrwtbee', '4YYIPFl9wE5c4L2eu2Gb', 'OYWwCdDHouzDwiZJWOOu', 'CeNX9CMwmxDxUF5Q2Inm', 'st7NwhTPEzqo2riw7qWC', 'mtrellq69YZsNwzUSyXh', 'FF7KdobWPaiR0vkcALHF', 'KH1SQLVulwP6uG4O3nmT', 'pjcYQlDFKMbcOUp6F5GD'],
}

export default function QuizPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string>('')
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [finalScore, setFinalScore] = useState({ score: 0, total: 0 })
  const [voiceSearchTerm, setVoiceSearchTerm] = useState('')
  const [selectedVoiceCategory, setSelectedVoiceCategory] = useState<string>('all')

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    // Get quiz data from session storage
    const storedQuizData = sessionStorage.getItem('quizData')
    const storedVideo = sessionStorage.getItem('selectedVideo')
    const storedVoice = sessionStorage.getItem('selectedVoice')
    const storedQuestionCount = sessionStorage.getItem('questionCount')
    const storedAudioFiles = sessionStorage.getItem('savedAudioFiles')
    
    if (!storedQuizData) {
      router.push('/')
      return
    }

    try {
      const parsedData = JSON.parse(storedQuizData)
      console.log('Quiz page - Loaded quiz data:', parsedData)
      console.log('Quiz title:', parsedData.title)
      console.log('Number of questions:', parsedData.questions?.length)
      if (parsedData.questions && parsedData.questions.length > 0) {
        console.log('First question:', parsedData.questions[0].question)
        console.log('All questions:')
        parsedData.questions.forEach((q: any, index: number) => {
          console.log(`Question ${index + 1}:`, q.question)
        })
      }
      setQuizData(parsedData)
      
      // Set selected video if available
      if (storedVideo) {
        setSelectedVideo(storedVideo)
      }
      
      // Set selected voice if available
      if (storedVoice) {
        setSelectedVoice(storedVoice)
      }
      
      // Set question count from session storage if available
      if (storedQuestionCount) {
        const count = parseInt(storedQuestionCount)
        if (count >= 5 && count <= 50) {
          setQuestionCount(count)
        }
      }

      // Check if we're retaking from collection (has saved audio files and voice selection)
      console.log('Debug - storedAudioFiles:', !!storedAudioFiles)
      console.log('Debug - storedVoice:', storedVoice)
      console.log('Debug - storedVideo:', storedVideo)
      
      // More explicit check - only auto-start if we have ALL required data for a retake
      const hasAudioFiles = storedAudioFiles && storedAudioFiles !== 'null' && storedAudioFiles !== 'undefined'
      const hasVoice = storedVoice && storedVoice !== 'null' && storedVoice !== 'undefined'
      const hasVideo = storedVideo && storedVideo !== 'null' && storedVideo !== 'undefined'
      
      const isRetakingFromCollection = hasAudioFiles && hasVoice && hasVideo
      console.log('Debug - hasAudioFiles:', hasAudioFiles)
      console.log('Debug - hasVoice:', hasVoice)
      console.log('Debug - hasVideo:', hasVideo)
      console.log('Debug - isRetakingFromCollection:', isRetakingFromCollection)
      
      if (isRetakingFromCollection) {
        console.log('Retaking quiz from collection - starting immediately')
        // Auto-start the quiz since we have all the necessary data
        setTimeout(() => {
          setShowQuiz(true)
        }, 100) // Small delay to ensure state is set
      } else {
        console.log('New quiz upload - showing voice/video selection')
        // For new uploads, show the voice/video selection page
        setShowQuiz(false)
      }
    } catch (error) {
      console.error('Error parsing quiz data:', error)
      router.push('/')
    }
  }, [router])

  const handleStartQuiz = async () => {
    if (!quizData || !selectedVoice || !selectedVideo) {
      alert('Please select both voice and video before starting')
      return
    }

    // Store the question count in session storage
    sessionStorage.setItem('questionCount', questionCount.toString())
    
    // Clear any saved audio files since this is a new quiz
    sessionStorage.removeItem('savedAudioFiles')
    
    // If the current quiz has a different number of questions than requested, regenerate
    console.log('Current quiz questions:', quizData.questions.length, 'Requested questions:', questionCount)
    if (quizData.questions.length !== questionCount) {
      console.log('Regenerating quiz with', questionCount, 'questions...')
      try {
        const response = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: sessionStorage.getItem('uploadedContent') || '',
            fileName: sessionStorage.getItem('fileName') || '',
            questionCount: questionCount,
          }),
        })

        if (response.ok) {
          const newQuizData = await response.json()
          console.log('New quiz generated with', newQuizData.questions.length, 'questions')
          sessionStorage.setItem('quizData', JSON.stringify(newQuizData))
          setQuizData(newQuizData)
        } else {
          console.error('Failed to regenerate quiz:', response.status)
        }
      } catch (error) {
        console.error('Error regenerating quiz:', error)
        // Continue with existing quiz data if regeneration fails
      }
    } else {
      console.log('Quiz already has the correct number of questions')
    }

    setShowQuiz(true)
  }

  const handleQuizComplete = (score: number, total: number) => {
    setFinalScore({ score, total })
    setQuizComplete(true)
  }

  const handleSaveToCollection = async () => {
    if (!user || !quizData) return

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }

      // Get audio files from QuizPlayer if available
      const audioFiles = window.quizAudioFiles || []

      const response = await fetch('/api/save-study-set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: quizData.title,
          quizData: quizData,
          backgroundVideo: selectedVideo,
          voiceSelection: selectedVoice,
          score: finalScore.score,
          totalQuestions: finalScore.total,
          audioFiles: audioFiles,
        }),
      })

      if (response.ok) {
        alert('Study set saved to your collection!')
        router.push('/collection')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save study set')
      }
    } catch (error) {
      console.error('Error saving study set:', error)
      alert('Failed to save study set. Please try again.')
    }
  }

  const handleCancelQuiz = async () => {
    if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
      router.push('/dashboard')
    }
  }

  // Filter voices based on search term and category
  const filteredVoices = voiceOptions.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(voiceSearchTerm.toLowerCase()) ||
                         voice.description.toLowerCase().includes(voiceSearchTerm.toLowerCase())
    const matchesCategory = selectedVoiceCategory === 'all' || 
                           categorizedVoices[selectedVoiceCategory as keyof typeof categorizedVoices]?.includes(voice.id)
    return matchesSearch && matchesCategory
  })

  const saveAudioFile = async (audioBlob: Blob, fileName: string): Promise<string> => {
    const reader = new FileReader()
    reader.readAsDataURL(audioBlob)
    return new Promise(resolve => {
      reader.onloadend = () => {
        const base64Audio = reader.result as string
        const audioId = Date.now().toString() // Simple unique ID
        const audioFile = {
          id: audioId,
          name: fileName,
          url: base64Audio,
          type: 'audio/mpeg', // Assuming MP3 for now
          size: audioBlob.size,
          duration: 0, // Placeholder, will be updated by QuizPlayer
        }
        // Add to session storage
        const savedAudioFiles = JSON.parse(sessionStorage.getItem('savedAudioFiles') || '[]')
        savedAudioFiles.push(audioFile)
        sessionStorage.setItem('savedAudioFiles', JSON.stringify(savedAudioFiles))
        resolve(audioId)
      }
    })
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/')
    }
    return null
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (showQuiz && !quizComplete) {
    const videoOption = videoOptions.find(v => v.label === selectedVideo)
    return (
      <QuizPlayer
        questions={quizData.questions}
        backgroundVideo={videoOption?.src || '/video_library/Minecraft_Parkour/Minecraft_video1.mp4'}
        selectedVoice={selectedVoice}
        onQuizComplete={handleQuizComplete}
      />
    )
  }

  if (quizComplete) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <Trophy className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">
              Quiz Complete!
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              You scored {finalScore.score} out of {finalScore.total}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleSaveToCollection}
                className="w-full bg-accent text-white py-2 px-4 rounded-lg font-semibold hover:bg-accent/90 transition-all"
              >
                Save to Collection
              </button>
              <button
                onClick={() => router.push('/collection')}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-2 px-4 rounded-lg font-semibold hover:bg-white/20 transition-all"
              >
                <Trophy className="h-4 w-4 inline mr-2" />
                View Collection
              </button>
              <button
                onClick={() => {
                  // Clear session storage when going back to dashboard
                  sessionStorage.removeItem('savedAudioFiles')
                  router.push('/dashboard')
                }}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-2 px-4 rounded-lg font-semibold hover:bg-white/20 transition-all"
              >
                <Home className="h-4 w-4 inline mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
                            onClick={() => {
                  // Clear session storage when going back to dashboard
                  sessionStorage.removeItem('savedAudioFiles')
                  router.push('/dashboard')
                }}
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">
            {quizData.title}
          </h1>
        </div>

        {/* Voice Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Choose Your Voice
          </h2>
          
          {/* Search and Category Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search voices..."
                value={voiceSearchTerm}
                onChange={(e) => setVoiceSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {voiceCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedVoiceCategory(category.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedVoiceCategory === category.id
                      ? 'bg-accent text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }
                  `}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
          
          {/* Voice Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredVoices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-left bg-white/10 backdrop-blur-md hover:scale-105
                  ${selectedVoice === voice.id
                    ? 'border-accent bg-accent/20 ring-2 ring-accent/50'
                    : 'border-white/20 hover:border-accent/50 hover:bg-white/20'
                  }
                `}
              >
                <h3 className="font-semibold text-white text-sm mb-1 truncate">{voice.name}</h3>
                <p className="text-xs text-gray-300 line-clamp-2">{voice.description}</p>
              </button>
            ))}
          </div>
          
          {filteredVoices.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No voices found matching your search.</p>
            </div>
          )}
        </div>

        {/* Question Count Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Number of Questions
          </h2>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
            <div className="flex items-center space-x-4">
              <label className="text-lg font-medium text-white">
                How many questions do you want?
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={questionCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (value >= 5 && value <= 50) {
                    setQuestionCount(value)
                    sessionStorage.setItem('questionCount', value.toString())
                  }
                }}
                className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-center text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="10"
              />
            </div>
            <div className="text-sm text-gray-300 mt-2">
              <span>Enter a number between 5 and 50</span>
            </div>
          </div>
        </div>

        {/* Video Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Choose Your Background Video
          </h2>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
            {selectedVideo ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Selected: {selectedVideo}</p>
                  <p className="text-sm text-gray-300">Background video for your quiz</p>
                </div>
                <button
                  onClick={() => router.push('/videos')}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                >
                  Change Video
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-300 mb-4">No video selected yet</p>
                <button
                  onClick={() => router.push('/videos')}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90"
                >
                  Choose Video
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Start Quiz Button */}
        <div className="text-center">
          <button
            onClick={handleStartQuiz}
            disabled={!selectedVoice || !selectedVideo}
            className={`
              px-8 py-3 rounded-lg font-semibold text-lg transition-all
              ${selectedVoice && selectedVideo
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {selectedVoice && selectedVideo 
              ? `Start Chaotic Quiz Experience (${questionCount} questions)` 
              : 'Please select both voice and video'
            }
          </button>
        </div>
      </div>
    </div>
  )
} 
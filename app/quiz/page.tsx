'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import { AuthProvider, useAuth } from '../../components/AuthProvider'
import QuizPlayer from '../../components/QuizPlayer'

interface Question {
  question: string
  choices: string[]
  correctIndex: number
  voiceScript: string
}

interface QuizData {
  id?: string
  title: string
  questions: Question[]
}

function QuizContent() {
  const { user } = useAuth()
  const router = useRouter()
  
  // State for quiz data and selections
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [selectedVoice, setSelectedVoice] = useState('')
  const [selectedVideo, setSelectedVideo] = useState('')
  
  // State for UI flow
  const [showVoiceSelection, setShowVoiceSelection] = useState(true)
  const [showVideoSelection, setShowVideoSelection] = useState(false)
  
  // Voice selection state
  const [voiceSearchTerm, setVoiceSearchTerm] = useState('')
  const [selectedVoiceCategory, setSelectedVoiceCategory] = useState('all')

  // Voice options with exact same structure as before
  const voiceOptions = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Professional and clear female voice' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Confident and engaging female voice' },
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
    
    // New ASMR voices
    { id: 'zA6D7RyKdc2EClouEMkP', name: 'Almee', description: 'Soft and soothing ASMR voice' },
    { id: 'nbk2esDn4RRk4cVDdoiE', name: 'Alice', description: 'Gentle and calming ASMR voice' },
    { id: 'itjA83RExdsQkFbXkihc', name: 'Kurt', description: 'Deep and relaxing ASMR voice' },
    { id: 'QdD5gQKLa216mSpjYoXS', name: 'Willow', description: 'Whisper soft ASMR voice' },
  ]

  // Voice categories for better organization
  const voiceCategories = [
    { id: 'all', name: 'All Voices', count: voiceOptions.length },
    { id: 'professional', name: 'Professional', count: voiceOptions.filter(v => ['Rachel', 'Domi', 'Bella', 'Antoni', 'Adam', 'Sam', 'Jaysoft', 'Owen', 'Prince Nuri', 'Halo', 'Austin', 'Martin Li'].includes(v.name)).length },
    { id: 'character', name: 'Character', count: voiceOptions.filter(v => ['Mad Scientist', 'Burt Reynolds', 'Demon', 'Fairy', 'Myrrdin', 'Oracle', 'Movie Trailer Guy', 'Female Villain', 'Cowboy', 'Grandpa', 'Northern Terry', 'Hank'].includes(v.name)).length },
    { id: 'music', name: 'Music & Entertainment', count: voiceOptions.filter(v => ['British Football Announcer', '80s Radio DJ', 'Blondie', 'Monster of Rock', 'Podcaster'].includes(v.name)).length },
    { id: 'asmr', name: 'ASMR', count: voiceOptions.filter(v => ['Almee', 'Alice', 'Kurt', 'Willow'].includes(v.name)).length },
  ]

  // Video options with exact same structure as before
  const videoOptions = [
    // Minecraft videos
    { id: 'minecraft_video1', label: 'minecraft_video1', name: 'Minecraft Parkour 1', category: 'Minecraft', src: '/videos/Minecraft_video1.mp4' },
    { id: 'minecraft_video2', label: 'minecraft_video2', name: 'Minecraft Parkour 2', category: 'Minecraft', src: '/videos/Minecraft_video2.mp4' },
    { id: 'minecraft_video3', label: 'minecraft_video3', name: 'Minecraft Parkour 3', category: 'Minecraft', src: '/videos/Minecraft_video3.mp4' },
    { id: 'minecraft_video4', label: 'minecraft_video4', name: 'Minecraft Parkour 4', category: 'Minecraft', src: '/videos/Minecraft_video4.mp4' },
    { id: 'minecraft_video5', label: 'minecraft_video5', name: 'Minecraft Parkour 5', category: 'Minecraft', src: '/videos/Minecraft_video5.mp4' },
    { id: 'minecraft_video6', label: 'minecraft_video6', name: 'Minecraft Parkour 6', category: 'Minecraft', src: '/videos/Minecraft_video6.mp4' },
    
    // Spiderman videos
    { id: 'spiderman_video1', label: 'spiderman_video1', name: 'Spider-Man 1', category: 'Spider-Man', src: '/videos/Spiderman_video1.mp4' },
    { id: 'spiderman_video2', label: 'spiderman_video2', name: 'Spider-Man 2', category: 'Spider-Man', src: '/videos/Spiderman_video2.mp4' },
    { id: 'spiderman_video3', label: 'spiderman_video3', name: 'Spider-Man 3', category: 'Spider-Man', src: '/videos/Spiderman_video3.mp4' },
    { id: 'spiderman_video4', label: 'spiderman_video4', name: 'Spider-Man 4', category: 'Spider-Man', src: '/videos/Spiderman_video4.mp4' },
    
    // GTA videos
    { id: 'gta_video1', label: 'gta_video1', name: 'GTA 5 Gameplay', category: 'GTA', src: '/videos/gta-video1.mp4' },
  ]

  // Filter voices based on search and category
  const filteredVoices = voiceOptions.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(voiceSearchTerm.toLowerCase()) ||
                         voice.description.toLowerCase().includes(voiceSearchTerm.toLowerCase())
    const matchesCategory = selectedVoiceCategory === 'all' || 
                           (selectedVoiceCategory === 'professional' && ['Rachel', 'Domi', 'Bella', 'Antoni', 'Adam', 'Sam', 'Jaysoft', 'Owen', 'Prince Nuri', 'Halo', 'Austin', 'Martin Li'].includes(voice.name)) ||
                           (selectedVoiceCategory === 'character' && ['Mad Scientist', 'Burt Reynolds', 'Demon', 'Fairy', 'Myrrdin', 'Oracle', 'Movie Trailer Guy', 'Female Villain', 'Cowboy', 'Grandpa', 'Northern Terry', 'Hank'].includes(voice.name)) ||
                           (selectedVoiceCategory === 'music' && ['British Football Announcer', '80s Radio DJ', 'Blondie', 'Monster of Rock', 'Podcaster'].includes(voice.name)) ||
                           (selectedVoiceCategory === 'asmr' && ['Almee', 'Alice', 'Kurt', 'Willow'].includes(voice.name))
    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push('/auth')
      return
    }

    // Load quiz data from session storage
    const savedQuizData = sessionStorage.getItem('quizData')
    console.log('Saved quiz data from session storage:', savedQuizData);
    
    if (savedQuizData) {
      try {
        const parsed = JSON.parse(savedQuizData)
        console.log('Parsed quiz data:', parsed);
        console.log('Quiz title from parsed data:', parsed.title);
        console.log('Quiz data structure:', {
          hasTitle: !!parsed.title,
          titleValue: parsed.title,
          hasQuestions: !!parsed.questions,
          questionsCount: parsed.questions?.length,
          hasQuizData: !!parsed.quiz_data,
          quizDataQuestionsCount: parsed.quiz_data?.questions?.length,
          quizDataStructure: parsed.quiz_data
        });
        setQuizData(parsed)
        
        // If we have saved quiz data, check if we should skip voice/video selection
        const savedVoice = sessionStorage.getItem('selectedVoice')
        const savedVideo = sessionStorage.getItem('selectedVideo')
        
        if (savedVoice && savedVideo) {
          console.log('Found saved voice and video, skipping selection menus');
          setSelectedVoice(savedVoice)
          setSelectedVideo(savedVideo)
          // Skip both voice and video selection - go straight to quiz
          setShowVoiceSelection(false)
          setShowVideoSelection(false)
        } else {
          console.log('Missing saved voice or video, showing voice selection');
          setShowVoiceSelection(true)
          setShowVideoSelection(false)
        }
      } catch (error) {
        console.error('Error parsing quiz data:', error)
        // For testing, create a sample quiz instead of redirecting
        createSampleQuiz()
        setShowVoiceSelection(true)
        setShowVideoSelection(false)
      }
    } else {
      console.log('No quiz data in session storage, creating sample quiz');
      // For testing, create a sample quiz instead of redirecting
      createSampleQuiz()
      setShowVoiceSelection(true)
      setShowVideoSelection(false)
    }

    // Load saved selections (for when we do need to show selection)
    const savedVoice = sessionStorage.getItem('selectedVoice')
    const savedVideo = sessionStorage.getItem('selectedVideo')
    if (savedVoice) setSelectedVoice(savedVoice)
    if (savedVideo) {
      // Check if it's a video label or path
      if (savedVideo.includes('/videos/')) {
        setSelectedVideo(savedVideo) // Already a path
      } else {
        // It's a label, convert to path
        const videoPathMap: { [key: string]: string } = {
          'minecraft_video1': '/videos/Minecraft_video1.mp4',
          'minecraft_video2': '/videos/Minecraft_video2.mp4',
          'minecraft_video3': '/videos/Minecraft_video3.mp4',
          'minecraft_video4': '/videos/Minecraft_video4.mp4',
          'minecraft_video5': '/videos/Minecraft_video5.mp4',
          'minecraft_video6': '/videos/Minecraft_video6.mp4',
          'spiderman_video1': '/videos/Spiderman_video1.mp4',
          'spiderman_video2': '/videos/Spiderman_video2.mp4',
          'spiderman_video3': '/videos/Spiderman_video3.mp4',
          'spiderman_video4': '/videos/Spiderman_video4.mp4',
          'gta_video1': '/videos/gta-video1.mp4',
          '': '' // No background
        }
        const videoPath = videoPathMap[savedVideo] || ''
        setSelectedVideo(videoPath)
      }
    }
  }, [user, router])

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId)
    sessionStorage.setItem('selectedVoice', voiceId)
    setShowVoiceSelection(false)
    setShowVideoSelection(true)
  }

  const handleVideoSelect = (videoLabel: string) => {
    // Map video labels to actual file paths
    const videoPathMap: { [key: string]: string } = {
      'minecraft_video1': '/videos/Minecraft_video1.mp4',
      'minecraft_video2': '/videos/Minecraft_video2.mp4',
      'minecraft_video3': '/videos/Minecraft_video3.mp4',
      'minecraft_video4': '/videos/Minecraft_video4.mp4',
      'minecraft_video5': '/videos/Minecraft_video5.mp4',
      'minecraft_video6': '/videos/Minecraft_video6.mp4',
      'spiderman_video1': '/videos/Spiderman_video1.mp4',
      'spiderman_video2': '/videos/Spiderman_video2.mp4',
      'spiderman_video3': '/videos/Spiderman_video3.mp4',
      'spiderman_video4': '/videos/Spiderman_video4.mp4',
      'gta_video1': '/videos/gta-video1.mp4',
      '': '' // No background
    }
    
    const videoPath = videoPathMap[videoLabel] || ''
    setSelectedVideo(videoPath)
    sessionStorage.setItem('selectedVideo', videoPath)
    setShowVideoSelection(false)
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const handleBackToVoiceSelection = () => {
    setShowVideoSelection(false)
    setShowVoiceSelection(true)
  }

  // Create a sample quiz for testing
  const createSampleQuiz = () => {
    console.log('Creating sample quiz...');
    const sampleQuiz: QuizData = {
      title: "Sample Quiz",
      questions: [
        {
          question: "What is the capital of France?",
          choices: ["London", "Berlin", "Paris", "Madrid"],
          correctIndex: 2,
          voiceScript: "What is the capital of France?"
        },
        {
          question: "Which planet is closest to the Sun?",
          choices: ["Venus", "Mars", "Mercury", "Earth"],
          correctIndex: 2,
          voiceScript: "Which planet is closest to the Sun?"
        },
        {
          question: "What is 2 + 2?",
          choices: ["3", "4", "5", "6"],
          correctIndex: 1,
          voiceScript: "What is 2 + 2?"
        }
      ]
    }
    console.log('Sample quiz created:', sampleQuiz);
    setQuizData(sampleQuiz)
  }

  // Single return statement with conditional rendering
  return (
    <>
      {/* Voice Selection */}
      {showVoiceSelection && (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {quizData?.title || 'Choose Your Voice'}
              </h1>
            </div>

            {/* Voice Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
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
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5CA4F6] focus:border-transparent"
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
                          ? 'bg-[#5CA4F6] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    onClick={() => handleVoiceSelect(voice.id)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left bg-white hover:scale-105
                      ${selectedVoice === voice.id
                        ? 'border-[#5CA4F6] bg-[#5CA4F6]/10 ring-2 ring-[#5CA4F6]/50'
                        : 'border-gray-200 hover:border-[#5CA4F6]/50 hover:bg-gray-50'
                      }
                    `}
                  >
                    <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{voice.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{voice.description}</p>
                  </button>
                ))}
              </div>
              
              {filteredVoices.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No voices found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Selection */}
      {showVideoSelection && (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBackToVoiceSelection}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Voice Selection</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Choose Your Background Video
              </h1>
            </div>

            {/* Video Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Select a background video for your quiz
              </h2>
              <p className="text-gray-600 mb-6">
                Choose a video that matches your mood and energy level
              </p>
              
              {/* Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Minecraft videos */}
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('minecraft_video1')}
                >
                  <video
                    src="/videos/Minecraft_video1.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">Minecraft Parkour 1</h3>
                  <p className="text-sm text-gray-600">Relaxing parkour</p>
                </div>

                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('minecraft_video2')}
                >
                  <video
                    src="/videos/Minecraft_video2.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">Minecraft Parkour 2</h3>
                  <p className="text-sm text-gray-600">More challenging</p>
                </div>

                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('minecraft_video3')}
                >
                  <video
                    src="/videos/Minecraft_video3.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">Minecraft Parkour 3</h3>
                  <p className="text-sm text-gray-600">Advanced level</p>
                </div>

                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('minecraft_video4')}
                >
                  <video
                    src="/videos/Minecraft_video4.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">Minecraft Parkour 4</h3>
                  <p className="text-sm text-gray-600">Expert level</p>
                </div>

                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('minecraft_video5')}
                >
                  <video
                    src="/videos/Minecraft_video5.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">Minecraft Parkour 5</h3>
                  <p className="text-sm text-gray-600">Master level</p>
                </div>

                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('minecraft_video6')}
                >
                  <video
                    src="/videos/Minecraft_video6.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">Minecraft Parkour 6</h3>
                  <p className="text-sm text-gray-600">Ultimate challenge</p>
                </div>

                {/* Spiderman videos */}
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('spiderman_video1')}
                >
                  <video
                    src="/videos/Spiderman_video1.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">Spider-Man 1</h3>
                  <p className="text-sm text-gray-600">Web swinging</p>
                </div>

                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('spiderman_video2')}
                >
                  <video
                    src="/videos/Spiderman_video2.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">Spider-Man 2</h3>
                  <p className="text-sm text-gray-600">Combat action</p>
                </div>

                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('spiderman_video3')}
                >
                  <video
                    src="/videos/Spiderman_video3.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">Spider-Man 3</h3>
                  <p className="text-sm text-gray-600">Epic battles</p>
                </div>

                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('spiderman_video4')}
                >
                  <video
                    src="/videos/Spiderman_video4.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">Spider-Man 4</h3>
                  <p className="text-sm text-gray-600">Final showdown</p>
                </div>

                {/* GTA video */}
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('gta_video1')}
                >
                  <video
                    src="/videos/gta-video1.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">GTA 5 Gameplay</h3>
                  <p className="text-sm text-gray-600">Fast-paced gaming for energy</p>
                </div>

                {/* No Background */}
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all hover:border-[#5CA4F6]"
                  onClick={() => handleVideoSelect('')}
                >
                  <div className="w-full aspect-[9/16] bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <X className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">No Background</h3>
                  <p className="text-sm text-gray-600">Just focus on the quiz</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Player */}
      {quizData && selectedVoice && selectedVideo && !showVoiceSelection && !showVideoSelection && (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {quizData?.title || 'Quiz'}
              </h1>
            </div>

            {/* Quiz Player */}
            {(() => {
              const questions = quizData?.questions || quizData?.quiz_data?.questions || []
              const previousScore = quizData?.last_score
              console.log('Passing questions to QuizPlayer:', {
                questions,
                questionsCount: questions.length,
                quizDataQuestions: quizData?.questions,
                quizDataQuizDataQuestions: quizData?.quiz_data?.questions,
                previousScore
              })
              return (
                <QuizPlayer
                  questions={questions}
                  backgroundVideo={selectedVideo}
                  selectedVoice={selectedVoice}
                  quizTitle={quizData?.title}
                  studySetId={quizData?.id}
                  previousScore={previousScore}
                  onQuizComplete={(score: number, total: number) => {
                    // Handle quiz completion
                    console.log(`Quiz completed! Score: ${score}/${total}`)
                  }}
                />
              )
            })()}
          </div>
        </div>
      )}

      {/* Loading State */}
      {!quizData && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5CA4F6] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      )}

      {/* Fallback State */}
      {quizData && (!selectedVoice || !selectedVideo) && !showVoiceSelection && !showVideoSelection && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Something went wrong. Please try again.</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-[#5CA4F6] text-white rounded-lg hover:bg-[#4A90E2]"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function QuizPage() {
  return (
    <AuthProvider>
      <QuizContent />
    </AuthProvider>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useAuth, AuthProvider } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { BookOpen, MessageSquare, Trophy, LogOut, Menu, X, ArrowRight, Play, FileText, Video, Link, CheckCircle, AlertCircle, Sparkles, Plus, Search, Filter, SortAsc, SortDesc, Trash2 } from 'lucide-react'
import FileUploader from '@/components/FileUploader'
import PWAInstall from '@/components/PWAInstall'
import { supabase } from '@/lib/supabase'


interface StudySet {
  id: string
  title: string
  created_at: string
  quiz_data: any
  background_video?: string
  voice_selection?: string
  last_score?: number
  total_questions?: number
  audio_files?: any[]
}

function DashboardContent() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'collection'>('dashboard')
  
  // Collection state
  const [studySets, setStudySets] = useState<StudySet[]>([])
  const [collectionLoading, setCollectionLoading] = useState(false)
  const [collectionError, setCollectionError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'score'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Check for pending URL from landing page
  useEffect(() => {
    const storedUrl = sessionStorage.getItem('pendingUrl')
    if (storedUrl && user) {
      setPendingUrl(storedUrl)
      sessionStorage.removeItem('pendingUrl')
      handleUrlFromLanding(storedUrl)
    }
  }, [user])

  // Fetch study sets when collection tab is active
  useEffect(() => {
    if (activeTab === 'collection' && user) {
      fetchStudySets()
    }
  }, [activeTab, user])

  const fetchStudySets = async () => {
    try {
      setCollectionLoading(true)
      
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/save-study-set', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch study sets')
      }

      const data = await response.json()
      setStudySets(data.studySets || [])
    } catch (err) {
      console.error('Error fetching study sets:', err)
      setCollectionError(err instanceof Error ? err.message : 'Failed to load your study sets')
    } finally {
      setCollectionLoading(false)
    }
  }

  const handleDeleteStudySet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study set? This action cannot be undone.')) {
      return
    }

    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('No active session')
      }

      const response = await fetch(`/api/delete-study-set`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ studySetId: id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete study set')
      }

      // Remove from local state
      setStudySets(prev => prev.filter(set => set.id !== id))
    } catch (err) {
      console.error('Error deleting study set:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete study set. Please try again.')
    }
  }

  const handleRetakeQuiz = (studySet: StudySet) => {
    console.log('Retaking quiz with study set:', studySet)
    
    // Prepare quiz data with audio files attached to questions
    let quizDataWithAudio = studySet
    
    // If we have audio files, attach them to the questions
    if (studySet.audio_files && studySet.audio_files.length > 0 && studySet.quiz_data?.questions) {
      console.log('Found audio files in study set:', studySet.audio_files)
      const audioFiles = studySet.audio_files // Store in local variable for TypeScript
      const questionsWithAudio = studySet.quiz_data.questions.map((question: any, index: number) => ({
        ...question,
        audioUrl: audioFiles[index] || 'dummy-audio'
      }))
      
      console.log('Questions with audio attached:', questionsWithAudio)
      
      quizDataWithAudio = {
        ...studySet,
        quiz_data: {
          ...studySet.quiz_data,
          questions: questionsWithAudio
        }
      }
    } else {
      console.log('No audio files found in study set, or no quiz data')
      console.log('audio_files:', studySet.audio_files)
      console.log('quiz_data:', studySet.quiz_data)
    }
    
    // Ensure the title is properly set for the quiz
    const quizDataForStorage = {
      ...quizDataWithAudio,
      title: studySet.title || 'Untitled Quiz' // Ensure title is always present
    }
    
    console.log('Storing quiz data:', quizDataForStorage)
    
    // Store the enhanced quiz data in session storage
    console.log('Storing in session storage:', {
      quizData: quizDataForStorage,
      selectedVideo: studySet.background_video || '',
      selectedVoice: studySet.voice_selection || ''
    });
    
    sessionStorage.setItem('quizData', JSON.stringify(quizDataForStorage))
    sessionStorage.setItem('selectedVideo', studySet.background_video || '')
    sessionStorage.setItem('selectedVoice', studySet.voice_selection || '')
    
    // Store saved audio files if they exist
    if (studySet.audio_files && studySet.audio_files.length > 0) {
      sessionStorage.setItem('savedAudioFiles', JSON.stringify(studySet.audio_files))
    }
    
    // Redirect to quiz page
    router.push('/quiz')
  }

  const filteredAndSortedSets = studySets
    .filter(set => 
      set.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'score':
          const scoreA = a.last_score || 0
          const scoreB = b.last_score || 0
          comparison = scoreA - scoreB
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleUrlFromLanding = async (url: string) => {
    setIsProcessing(true)
    setProcessingStep('Extracting content from your link...')

    try {
      const response = await fetch('/api/extract-url-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract content from URL')
      }

      // Use the extracted content to generate quiz
      await handleFileUpload(data.text, data.title || data.url || 'Web Content')
    } catch (error) {
      console.error('Error processing URL from landing:', error)
      setIsProcessing(false)
      setProcessingStep('')
      alert('Failed to process the URL. Please try again.')
    }
  }

  const handleFileUpload = async (content: string, fileName: string) => {
    setIsProcessing(true)
    setProcessingStep('Generating your quiz with AI...')

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          fileName,
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      const quizData = await response.json()
      
      // Store quiz data in session storage for the quiz page
      sessionStorage.setItem('quizData', JSON.stringify(quizData))
      sessionStorage.setItem('uploadedContent', content)
      sessionStorage.setItem('fileName', fileName)
      
      // Redirect to quiz page
      router.push('/quiz')
    } catch (error) {
      console.error('Quiz generation error:', error)
      setProcessingStep('')
      alert(error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5CA4F6] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not authenticated
  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/fypquizlogo.png" alt="FYPQuiz logo - Best quiz app for students" className="h-8 w-8" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">fypquiz</h1>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => router.push('/blog')}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center space-x-2 shadow-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span>Blog</span>
            </button>
            <button
              onClick={() => router.push('/feedback')}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center space-x-2 shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </button>
            <button
              onClick={handleSignOut}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center space-x-2 shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md bg-white hover:bg-gray-50 border border-gray-200"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute top-0 left-0 h-full w-72 bg-white border-r border-gray-200 shadow-xl p-6 flex flex-col">
              <div className="flex items-center space-x-2 mb-6">
                <img src="/fypquizlogo.png" alt="FYPQuiz logo" className="h-6 w-6" />
                <span className="text-lg font-bold text-gray-800">fypquiz</span>
              </div>
              <button
                className="inline-flex items-center justify-center p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <a href="/blog" className="py-3 border-b border-gray-200 text-gray-700 hover:text-[#5CA4F6] transition-colors" onClick={() => setIsMenuOpen(false)}>Blog</a>
            <a href="/feedback" className="py-3 border-b border-gray-200 text-gray-700 hover:text-[#5CA4F6] transition-colors" onClick={() => setIsMenuOpen(false)}>Feedback</a>
            <a href="/" className="py-3 border-b border-gray-200 text-gray-700 hover:text-[#5CA4F6] transition-colors" onClick={() => setIsMenuOpen(false)}>Home</a>
            <button
              onClick={() => {
                handleSignOut()
                setIsMenuOpen(false)
              }}
              className="mt-6 bg-red-500 text-white px-4 py-3 rounded-lg text-center shadow-lg"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 mb-8 border border-gray-200 shadow-sm">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#5CA4F6] text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'collection'
                  ? 'bg-[#5CA4F6] text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>My Collection</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200 shadow-sm">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Welcome back, {user.email?.split('@')[0]}! 👋
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Ready to turn your study materials into fun, TikTok-style quizzes?
                </p>
                
                {/* Exam Motivation Section */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-6 border border-pink-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">✨ You've Got This! ✨</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="text-left">
                      <p className="text-gray-700 mb-2">🎯 <strong>Crush your SATs</strong> and unlock amazing college opportunities!</p>
                      <p className="text-gray-700 mb-2">📚 <strong>Master your AP exams</strong> and earn college credit early!</p>
                      <p className="text-gray-700">🏆 <strong>Conquer your finals</strong> and finish the semester strong!</p>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-700 mb-2">🌟 <strong>Excel in your ACT</strong> and showcase your academic skills!</p>
                      <p className="text-gray-700 mb-2">💪 <strong>Own your midterms</strong> and prove what you're capable of!</p>
                      <p className="text-gray-700">🚀 <strong>Level up your GPA</strong> and build your future foundation!</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Upload PDFs & Docs</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                    <Video className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Video Support</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-full">
                    <Link className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Web Content</span>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Create Your Quiz</h3>
                <p className="text-gray-600">
                  Upload your study materials or paste a link to get started
                </p>
              </div>
              
              <FileUploader onFileUpload={handleFileUpload} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('collection')}>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Trophy className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">My Collection</h4>
                    <p className="text-gray-600 text-sm">View your saved study sets</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/blog')}>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Study Tips</h4>
                    <p className="text-gray-600 text-sm">Learn better study strategies</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/feedback')}>
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Feedback</h4>
                    <p className="text-gray-600 text-sm">Help us improve fypquiz</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white rounded-2xl p-8 mt-8 border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Learning Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#5CA4F6] mb-2">{studySets.length}</div>
                  <div className="text-gray-600">Quizzes Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#5CA4F6] mb-2">0</div>
                  <div className="text-gray-600">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#5CA4F6] mb-2">0%</div>
                  <div className="text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#5CA4F6] mb-2">0</div>
                  <div className="text-gray-600">Study Sessions</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Collection Tab Content */}
        {activeTab === 'collection' && (
          <>
            {/* Collection Header */}
            <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">My Collection</h2>
                  <p className="text-gray-600">Your saved study sets</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-[#5CA4F6]" />
                  <span className="text-gray-800 font-semibold">{studySets.length} sets</span>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your study sets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20"
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'score')}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20"
                  >
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="score">Score</option>
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 text-gray-600" /> : <SortDesc className="h-4 w-4 text-gray-600" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Study Sets Grid */}
            {collectionLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5CA4F6] mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Loading your collection...</p>
              </div>
            ) : collectionError ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading Collection</h3>
                <p className="text-gray-500 mb-6">{collectionError}</p>
                <button
                  onClick={fetchStudySets}
                  className="bg-[#5CA4F6] text-white px-6 py-3 rounded-lg hover:bg-[#5CA4F6]/90 transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : filteredAndSortedSets.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'No study sets found' : 'No study sets yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Create your first quiz to get started!'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="bg-[#5CA4F6] text-white px-6 py-3 rounded-lg hover:bg-[#5CA4F6]/90 transition-all flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Create Your First Quiz</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedSets.map((studySet) => (
                  <div key={studySet.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                          {studySet.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{studySet.quiz_data?.questions?.length || 0} questions</span>
                          {studySet.last_score !== undefined && (
                            <span className="flex items-center space-x-1">
                              <Trophy className="h-4 w-4 text-[#5CA4F6]" />
                              <span>{studySet.last_score}/{studySet.total_questions}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteStudySet(studySet.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete study set"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>
                        Created {new Date(studySet.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRetakeQuiz(studySet)}
                        className="flex-1 bg-[#5CA4F6] text-white py-2 px-4 rounded-lg hover:bg-[#5CA4F6]/90 transition-all flex items-center justify-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>Retake Quiz</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Create New Quiz</h4>
                    <p className="text-sm text-gray-600">Upload new study materials</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/blog')}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Study Tips</h4>
                    <p className="text-sm text-gray-600">Learn better strategies</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/feedback')}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Feedback</h4>
                    <p className="text-sm text-gray-600">Help us improve</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5CA4F6] mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Creating Your Quiz</h3>
              <p className="text-gray-600">{processingStep}</p>
              <div className="mt-4 text-sm text-gray-500">
                This usually takes 30-60 seconds...
              </div>
            </div>
          </div>
        )}

        {/* PWA Install Component */}
        <PWAInstall />
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
} 
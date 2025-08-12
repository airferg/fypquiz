'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import FileUploader from '@/components/FileUploader'
import { useRouter } from 'next/navigation'
import { BookOpen, Trophy, LogOut, GraduationCap, Menu, X, MessageSquare } from 'lucide-react'


export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedContent, setUploadedContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [processingStep, setProcessingStep] = useState('')

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Show feedback popup after 30 seconds
  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => {
        setShowFeedbackPopup(true)
      }, 30000) // 30 seconds
      
      return () => clearTimeout(timer)
    }
  }, [user, loading])

  const handleFileUpload = async (content: string, name: string) => {
    // Enhanced logging for mobile debugging
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    console.log('=== QUIZ GENERATION DEBUG ===')
    console.log('Device type:', isMobile ? 'Mobile' : 'Desktop')
    console.log('User agent:', navigator.userAgent)
    console.log('File name:', name)
    console.log('Content length:', content.length)
    console.log('Content preview:', content.substring(0, 200) + '...')
    
    setUploadedContent(content)
    setFileName(name)
    setIsProcessing(true)
    setProcessingStep('Analyzing your content...')

    // Clear any old session storage data from previous quizzes
    sessionStorage.removeItem('selectedVoice')
    sessionStorage.removeItem('selectedVideo')
    sessionStorage.removeItem('savedAudioFiles')
    sessionStorage.removeItem('quizData')
    sessionStorage.removeItem('fileName')
    sessionStorage.removeItem('uploadedContent')

    try {
      setProcessingStep('Generating quiz questions with AI...')
      console.log('Starting quiz generation API call...')
      
      const requestBody = {
        content,
        fileName: name,
        questionCount: 10, // Default to 10 questions for initial generation
      }
      console.log('Request body:', requestBody)
      
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('API response status:', response.status)
      console.log('API response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`Failed to generate quiz: ${response.status} - ${errorText}`)
      }

      setProcessingStep('Finalizing your quiz...')
      console.log('Parsing quiz data...')
      
      const quizData = await response.json()
      console.log('Quiz data received:', quizData)
      console.log('Quiz questions count:', quizData.questions?.length)
      
      // Store in session storage for quiz page
      sessionStorage.setItem('quizData', JSON.stringify(quizData))
      sessionStorage.setItem('fileName', name)
      sessionStorage.setItem('uploadedContent', content)
      
      setProcessingStep('Redirecting to quiz...')
      console.log('Redirecting to quiz page...')
      
      // Redirect to quiz page
      router.push('/quiz')
    } catch (error) {
      console.error('=== QUIZ GENERATION ERROR ===')
      console.error('Error details:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : 'No message')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      
      // Enhanced error handling for mobile
      let errorMessage = 'Failed to generate quiz. Please try again.'
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your internet connection and try again.'
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else if (error.message.includes('Failed to generate quiz')) {
          errorMessage = 'Quiz generation failed. The content might be too short or unreadable.'
        }
      }
      
      alert(errorMessage)
    } finally {
      console.log('Cleaning up processing state...')
      setIsProcessing(false)
      setProcessingStep('')
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

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading your chaotic experience...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not authenticated
  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-black p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/favicon.svg" alt="FYPQuiz logo - Best quiz app for students" className="h-8 w-8" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">fypquiz</h1>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => router.push('/blog')}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Blog</span>
            </button>
            <button
              onClick={() => router.push('/feedback')}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </button>
            <button
              onClick={() => router.push('/collection')}
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-all flex items-center space-x-2"
            >
              <Trophy className="h-4 w-4" />
              <span>My Collection</span>
            </button>
            <button
              onClick={handleSignOut}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md bg-white/10 hover:bg-white/20"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute top-0 right-0 h-full w-72 bg-white/20 backdrop-blur-md border-l border-white/30 shadow-xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Menu</h2>
                <button
                  className="inline-flex items-center justify-center p-2 rounded-md bg-white/10 hover:bg-white/20"
                  aria-label="Close menu"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <button onClick={() => { setIsMenuOpen(false); router.push('/blog') }} className="py-3 border-b border-white/20 text-left text-white hover:text-accent transition-colors">Blog</button>
              <button onClick={() => { setIsMenuOpen(false); router.push('/feedback') }} className="py-3 border-b border-white/20 text-left text-white hover:text-accent transition-colors">Feedback</button>
              <button onClick={() => { setIsMenuOpen(false); router.push('/collection') }} className="py-3 border-b border-white/20 text-left text-white hover:text-accent transition-colors">My Collection</button>
              <button onClick={() => { setIsMenuOpen(false); handleSignOut() }} className="mt-6 bg-white/20 px-4 py-3 rounded-lg text-left text-white hover:bg-white/30 transition-all">Sign Out</button>
            </div>
          </div>
        )}
      </header>

      {/* File Upload Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <BookOpen className="h-16 w-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Create Your Study Set
          </h2>
          <p className="text-gray-300">
            Upload your study materials and we'll turn them into a hilarious quiz experience
          </p>
        </div>

        <FileUploader
          onFileUpload={handleFileUpload}
          isLoading={isProcessing}
        />

        {isProcessing && (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-lg text-gray-300 mb-2">
              {processingStep || 'AI is analyzing your content and creating a chaotic quiz experience...'}
            </p>
            <div className="w-64 bg-white/20 rounded-full h-2 mt-4 mx-auto">
              <div className="bg-accent h-2 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              This usually takes 30-60 seconds...
            </p>
          </div>
        )}
      </div>

      {/* Feedback Popup */}
      {showFeedbackPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full text-center">
            <MessageSquare className="h-16 w-16 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Help Us Improve FYPQuiz!</h3>
            <p className="text-gray-300 mb-6">
              We'd love to hear your ideas for new features that would help you study better. Your feedback shapes our development roadmap!
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowFeedbackPopup(false)
                  router.push('/feedback')
                }}
                className="flex-1 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-all"
              >
                Share Feedback
              </button>
              <button
                onClick={() => setShowFeedbackPopup(false)}
                className="flex-1 bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import FileUploader from '@/components/FileUploader'
import { useRouter } from 'next/navigation'
import { BookOpen, Trophy, LogOut, GraduationCap } from 'lucide-react'
import { NextSeo } from 'next-seo'
import { pageSEO } from '@/lib/seo'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  
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

  const handleFileUpload = async (content: string, name: string) => {
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
      
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          fileName: name,
          questionCount: 10, // Default to 10 questions for initial generation
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      setProcessingStep('Finalizing your quiz...')
      
      const quizData = await response.json()
      
      console.log('Dashboard - Received quiz data:', quizData)
      console.log('Quiz title:', quizData.title)
      console.log('Number of questions:', quizData.questions?.length)
      if (quizData.questions && quizData.questions.length > 0) {
        console.log('First question:', quizData.questions[0].question)
      }
      
      // Store in session storage for quiz page
      sessionStorage.setItem('quizData', JSON.stringify(quizData))
      sessionStorage.setItem('fileName', name)
      sessionStorage.setItem('uploadedContent', content)
      
      setProcessingStep('Redirecting to quiz...')
      
      router.push('/quiz')
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Failed to generate quiz. Please try again.')
    } finally {
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
    <>
      <NextSeo
        title={pageSEO.dashboard.title}
        description={pageSEO.dashboard.description}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: pageSEO.dashboard.keywords,
          },
        ]}
      />
      <div className="min-h-screen bg-black p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3">
              <img src="/favicon.svg" alt="FYPQuiz logo - Best quiz app for students" className="h-8 w-8" />
              <h1 className="text-3xl font-bold text-white">fypquiz</h1>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-gray-300">Welcome back, {user.email}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
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
        </div>
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
    </div>
    </>
  )
} 
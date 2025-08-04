'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Brain, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function AuthPage() {
  const { user, loading, signIn, signUp, signInWithGoogle, signOut } = useAuth()
  const router = useRouter()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Auth loading timeout reached, forcing continue...')
        setTimeoutReached(true)
      }
    }, 3000) // Reduced to 3 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (error) {
      console.error('Auth error:', error)
      setAuthError(error instanceof Error ? error.message : 'Authentication failed. Please try again.')
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError('')
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google auth error:', error)
      setAuthError(error instanceof Error ? error.message : 'Google authentication failed. Please try again.')
    }
  }

  const handleBackToLanding = () => {
    router.push('/')
  }

  // Show loading spinner with timeout message
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading your chaotic experience...</p>
        </div>
      </div>
    )
  }

  // Show timeout message if loading takes too long
  if (loading && timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <Brain className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">fypquiz</h1>
            <p className="text-gray-300 mb-4">
              Having trouble connecting to our servers. This might be due to:
            </p>
            <ul className="text-sm text-gray-400 text-left mb-4">
              <li>• Network connectivity issues</li>
              <li>• Supabase service temporarily unavailable</li>
              <li>• Environment variables not properly configured</li>
            </ul>
          </div>
          <button
            onClick={() => router.refresh()}
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={handleBackToLanding}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Landing</span>
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold text-white">fypquiz</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-300">
            {isSignUp 
              ? 'Join thousands of students studying smarter with AI-powered quizzes'
              : 'Sign in to continue your learning journey'
            }
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center space-x-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/10 text-gray-400">or</span>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                !isSignUp ? 'bg-accent text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                isSignUp ? 'bg-accent text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {authError && (
              <div className="text-red-400 text-sm bg-red-500/20 border border-red-400 p-3 rounded-lg">
                {authError}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-accent text-white py-3 px-4 rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-accent hover:text-accent/80 transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
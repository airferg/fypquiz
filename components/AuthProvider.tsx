'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true

    // Only run on client side and if supabase is available
    if (typeof window === 'undefined') {
      setLoading(false)
      setInitialized(true)
      return
    }

    if (!supabase) {
      console.log('AuthProvider: Supabase not available, setting loading to false')
      setLoading(false)
      setInitialized(true)
      return
    }

    // Get initial session with timeout
    const getSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session...')
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session timeout')), 10000) // 10 second timeout
        })

        const sessionPromise = supabase.auth.getSession()
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any
        
        if (!mounted) return
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error)
        } else {
          console.log('AuthProvider: Session retrieved:', session ? 'User logged in' : 'No session')
        }
        
        setUser(session?.user ?? null)
        

      } catch (error) {
        console.error('AuthProvider: Exception getting session:', error)
        // Continue without session if there's an error
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!mounted) return
        
        console.log('AuthProvider: Auth state changed:', event, session ? 'User logged in' : 'No session')
        setUser(session?.user ?? null)
        

        
        setLoading(false)
        setInitialized(true)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    try {
      console.log('AuthProvider: Attempting sign in for:', email)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error('AuthProvider: Sign in error:', error)
        throw error
      }
      console.log('AuthProvider: Sign in successful')
    } catch (error) {
      console.error('AuthProvider: Sign in exception:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    try {
      console.log('AuthProvider: Attempting sign up for:', email)
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        console.error('AuthProvider: Sign up error:', error)
        throw error
      }
      console.log('AuthProvider: Sign up successful')
    } catch (error) {
      console.error('AuthProvider: Sign up exception:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    try {
      console.log('AuthProvider: Attempting Google sign in')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) {
        console.error('AuthProvider: Google sign in error:', error)
        throw error
      }
      console.log('AuthProvider: Google sign in initiated')
    } catch (error) {
      console.error('AuthProvider: Google sign in exception:', error)
      throw error
    }
  }

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    try {
      console.log('AuthProvider: Attempting sign out')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('AuthProvider: Sign out error:', error)
        throw error
      }
      console.log('AuthProvider: Sign out successful')
    } catch (error) {
      console.error('AuthProvider: Sign out exception:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {initialized ? children : (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-lg text-gray-300">Initializing...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
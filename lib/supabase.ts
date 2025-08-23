import { createClient } from '@supabase/supabase-js'

// Only create Supabase client on the client side
let supabase: any = null

if (typeof window !== 'undefined') {
  // Only check for client-side environment variables
  const clientUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const clientKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Supabase config check:', {
    url: clientUrl ? 'Set' : 'Missing',
    anonKey: clientKey ? 'Set' : 'Missing'
  })

  if (!clientUrl || !clientKey) {
    console.error('Supabase environment variables are missing:', {
      url: !!clientUrl,
      anonKey: !!clientKey
    })
    throw new Error('Supabase environment variables are not set')
  }

  supabase = createClient(clientUrl, clientKey)
  console.log('Supabase client initialized successfully')
}



// Server-side Supabase client for API routes
export const createSupabaseServer = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('Missing Supabase configuration for server client')
    throw new Error('Supabase configuration incomplete')
  }
  
  return createClient(url, key)
}

export { supabase }

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      study_sets: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          quiz_data: any
          background_video: string
          voice_selection: string
          last_score?: number
          total_questions?: number
          audio_files?: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          quiz_data?: any
          background_video?: string
          voice_selection?: string
          last_score?: number
          total_questions?: number
          audio_files?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          quiz_data?: any
          background_video?: string
          voice_selection?: string
          last_score?: number
          total_questions?: number
          audio_files?: any[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 
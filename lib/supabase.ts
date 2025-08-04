import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Only create Supabase client on the client side
let supabase: any = null

if (typeof window !== 'undefined') {
  console.log('Supabase config check:', {
    url: config.supabase.url ? 'Set' : 'Missing',
    anonKey: config.supabase.anonKey ? 'Set' : 'Missing',
    serviceRoleKey: config.supabase.serviceRoleKey ? 'Set' : 'Missing'
  })

  if (!config.supabase.url || !config.supabase.anonKey) {
    console.error('Supabase environment variables are missing:', {
      url: !!config.supabase.url,
      anonKey: !!config.supabase.anonKey
    })
    throw new Error('Supabase environment variables are not set')
  }

  supabase = createClient(config.supabase.url, config.supabase.anonKey)
  console.log('Supabase client initialized successfully')
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
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 
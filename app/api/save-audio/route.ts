import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { config } from '../../../lib/config'

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error('Supabase environment variables are not set')
}

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey)

export async function POST(request: NextRequest) {
  try {
    const { audioBlob, fileName, studySetId } = await request.json()

    if (!audioBlob || !fileName || !studySetId) {
      return NextResponse.json(
        { error: 'Audio blob, file name, and study set ID are required' },
        { status: 400 }
      )
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Convert base64 audio blob to buffer
    const audioBuffer = Buffer.from(audioBlob, 'base64')
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(`${studySetId}/${fileName}`, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to save audio file' },
        { status: 500 }
      )
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(`${studySetId}/${fileName}`)

    return NextResponse.json({ 
      success: true, 
      audioUrl: publicUrl,
      fileName: fileName
    })
  } catch (error) {
    console.error('Error saving audio:', error)
    return NextResponse.json(
      { error: 'Failed to save audio file' },
      { status: 500 }
    )
  }
} 
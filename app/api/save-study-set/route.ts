import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { config } from '../../../lib/config'

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error('Supabase environment variables are not set')
}

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey)

export async function GET(request: NextRequest) {
  try {
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

    const { data, error } = await supabase
      .from('study_sets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch study sets' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      studySets: data 
    })
  } catch (error) {
    console.error('Error fetching study sets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study sets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, quizData, backgroundVideo, voiceSelection, score, totalQuestions, audioFiles } = await request.json()

    if (!title || !quizData) {
      return NextResponse.json(
        { error: 'Title and quiz data are required' },
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

    // Check if a study set with the same title already exists for this user
    const { data: existingStudySet, error: checkError } = await supabase
      .from('study_sets')
      .select('id')
      .eq('user_id', user.id)
      .eq('title', title)
      .single()

    let data, error

    if (existingStudySet) {
      // Update existing study set
      console.log('Updating existing study set:', existingStudySet.id)
      const { data: updateData, error: updateError } = await supabase
        .from('study_sets')
        .update({
          content: JSON.stringify(quizData),
          quiz_data: quizData,
          background_video: backgroundVideo,
          voice_selection: voiceSelection,
          last_score: score,
          total_questions: totalQuestions,
          audio_files: audioFiles || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStudySet.id)
        .select()
      
      data = updateData
      error = updateError
    } else {
      // Create new study set
      console.log('Creating new study set')
      const { data: insertData, error: insertError } = await supabase
        .from('study_sets')
        .insert({
          user_id: user.id,
          title,
          content: JSON.stringify(quizData),
          quiz_data: quizData,
          background_video: backgroundVideo,
          voice_selection: voiceSelection,
          last_score: score,
          total_questions: totalQuestions,
          audio_files: audioFiles || [],
        })
        .select()
      
      data = insertData
      error = insertError
    }

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save study set' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to save study set - no data returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      studySet: data[0] 
    })
  } catch (error) {
    console.error('Error saving study set:', error)
    return NextResponse.json(
      { error: 'Failed to save study set' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { config } from '../../../lib/config'

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error('Supabase environment variables are not set')
}

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey)

export async function DELETE(request: NextRequest) {
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

    // Get the study set ID from the request body
    const { studySetId } = await request.json()

    if (!studySetId) {
      return NextResponse.json(
        { error: 'Study set ID is required' },
        { status: 400 }
      )
    }

    // Delete the study set from the database
    const { error } = await supabase
      .from('study_sets')
      .delete()
      .eq('id', studySetId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting study set:', error)
      return NextResponse.json(
        { error: 'Failed to delete study set' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Study set deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in delete study set:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    // Get the study set ID from the request body
    const { studySetId } = await request.json()

    if (!studySetId) {
      return NextResponse.json(
        { error: 'Study set ID is required' },
        { status: 400 }
      )
    }

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete the study set from the database
    const { error } = await supabase
      .from('study_sets')
      .delete()
      .eq('id', studySetId)
      .eq('user_id', session.user.id)

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
import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      overallRating,
      easeOfUse,
      featureRating,
      wouldRecommend,
      newFeatures,
      additionalFeedback,
      contactEmail
    } = body

    // Validate required fields
    if (!overallRating || !easeOfUse || !featureRating || !wouldRecommend) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert feedback into database
    const supabase = createSupabaseServer()
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        overall_rating: overallRating,
        ease_of_use: easeOfUse,
        feature_rating: featureRating,
        would_recommend: wouldRecommend,
        new_features: newFeatures || null,
        additional_feedback: additionalFeedback || null,
        contact_email: contactEmail || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error saving feedback:', error)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: data
    })

  } catch (error) {
    console.error('Error in feedback API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

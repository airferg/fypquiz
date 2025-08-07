import { NextRequest, NextResponse } from 'next/server'
import { config } from '../../../lib/config'

// Helper function to create a timeout promise
const createTimeout = (ms: number) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Request timeout')), ms)
)

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Text and voice ID are required' },
        { status: 400 }
      )
    }

    if (!config.elevenlabs.apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    // Truncate text if it's too long to improve speed
    const truncatedText = text.length > 500 ? text.substring(0, 500) + '...' : text

    const responsePromise = fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenlabs.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: truncatedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    })

    // Add 30-second timeout for voice generation
    const response = await Promise.race([
      responsePromise,
      createTimeout(30000) // 30 seconds timeout
    ]) as Response

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate voice audio' },
        { status: 500 }
      )
    }

    const audioBuffer = await response.arrayBuffer()
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating voice:', error)
    
    // Check if it's a timeout error
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Voice generation timed out. Please try again.' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate voice audio' },
      { status: 500 }
    )
  }
} 
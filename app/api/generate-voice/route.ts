import { NextRequest, NextResponse } from 'next/server'
import { config } from '../../../lib/config'

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

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenlabs.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    })

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
    return NextResponse.json(
      { error: 'Failed to generate voice audio' },
      { status: 500 }
    )
  }
} 
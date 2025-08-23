import { NextRequest, NextResponse } from 'next/server'
import { config } from '../../../lib/config'

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id, study_set_id } = await request.json()

    if (!text || !voice_id) {
      return NextResponse.json(
        { error: 'Text and voice_id are required' },
        { status: 400 }
      )
    }

    if (!config.elevenlabs.apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    console.log(`🎵 Generating voice for: "${text.substring(0, 50)}..." with voice ${voice_id}`)

    // Truncate text if it's too long
    const truncatedText = text.length > 500 ? text.substring(0, 500) + '...' : text

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
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

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate voice' },
        { status: response.status }
      )
    }

    const audioBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(audioBuffer)
    const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))
    
    console.log(`✅ Voice generated successfully (${audioBuffer.byteLength} bytes)`)

    return NextResponse.json({
      success: true,
      audio_url: `data:audio/mpeg;base64,${base64Audio}`,
      size: audioBuffer.byteLength
    })

  } catch (error) {
    console.error('Error in voice generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate voice' },
      { status: 500 }
    )
  }
} 
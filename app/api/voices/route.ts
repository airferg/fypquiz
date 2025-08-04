import { NextRequest, NextResponse } from 'next/server'
import { config } from '../../../lib/config'

export async function GET() {
  try {
    if (!config.elevenlabs.apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.elevenlabs.io/v2/voices', {
      headers: {
        'xi-api-key': config.elevenlabs.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Filter and format the voices for the frontend
    const voices = data.voices
      .filter((voice: any) => voice.category === 'professional' || voice.category === 'generated')
      .map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        description: voice.description || `${voice.labels?.accent || 'Professional'} voice`,
        category: voice.category,
        preview_url: voice.preview_url,
        labels: voice.labels,
      }))
      .slice(0, 20) // Limit to first 20 voices

    return NextResponse.json({ voices })
  } catch (error) {
    console.error('Error fetching voices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    )
  }
} 
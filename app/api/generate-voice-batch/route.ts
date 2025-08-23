import { NextRequest, NextResponse } from 'next/server'
import { config } from '../../../lib/config'

export async function POST(request: NextRequest) {
  try {
    const { questions, voiceId } = await request.json()

    if (!questions || !Array.isArray(questions) || !voiceId) {
      return NextResponse.json(
        { error: 'Questions array and voice ID are required' },
        { status: 400 }
      )
    }

    if (!config.elevenlabs.apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    console.log(`🎵 Single batch voice generation: ${questions.length} questions for voice ${voiceId}`)

    // Combine all questions into one text input for a single API call
    const combinedText = questions.map((q, index) => 
      `Question ${index + 1}: ${q.text}`
    ).join('\n\n')

    console.log(`Combined text length: ${combinedText.length} characters`)
    console.log(`Sending single API call to ElevenLabs...`)

    // Make ONE single API call with all questions combined
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenlabs.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: combinedText,
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
    console.log(`✅ Single voice generation successful (${audioBuffer.byteLength} bytes)`)

    // Convert to base64 for the response
    const uint8Array = new Uint8Array(audioBuffer)
    const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))

    // Return the single audio file - the QuizPlayer will need to handle splitting it
    return NextResponse.json({
      success: true,
      audio: base64Audio,
      combinedAudio: true,
      questionCount: questions.length,
      summary: {
        total: questions.length,
        successful: 1,
        failed: 0
      }
    })

  } catch (error) {
    console.error('Error in single batch voice generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate batch voice' },
      { status: 500 }
    )
  }
}

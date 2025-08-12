import { NextRequest, NextResponse } from 'next/server'
import { config } from '../../../lib/config'

// Helper function to create a timeout promise
const createTimeout = (ms: number) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Request timeout')), ms)
)

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

    console.log(`🎵 Batch voice generation: ${questions.length} questions for voice ${voiceId}`)

    // Process each question individually but in sequence to avoid concurrent limits
    const audioResults = []
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      console.log(`🎵 Generating voice ${i + 1}/${questions.length}: "${question.text.substring(0, 50)}..."`)
      
      try {
        // Truncate text if it's too long to improve speed
        const truncatedText = question.text.length > 500 ? question.text.substring(0, 500) + '...' : question.text

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

        // Add 30-second timeout for each voice generation
        const response = await Promise.race([
          responsePromise,
          createTimeout(30000) // 30 seconds timeout
        ]) as Response

        if (!response.ok) {
          const errorData = await response.text()
          console.error(`ElevenLabs API error for question ${i + 1}:`, errorData)
          // Continue with other questions instead of failing completely
          audioResults.push({ index: question.index, success: false, error: errorData })
          continue
        }

        const audioBuffer = await response.arrayBuffer()
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))
        
        audioResults.push({
          index: question.index,
          success: true,
          audio: base64Audio,
          size: audioBuffer.byteLength
        })
        
        console.log(`✅ Voice ${i + 1}/${questions.length} generated successfully (${audioBuffer.byteLength} bytes)`)
        
        // Add small delay between requests to be extra safe
        if (i < questions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
      } catch (error) {
        console.error(`❌ Error generating voice for question ${i + 1}:`, error)
        audioResults.push({ 
          index: question.index, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    // Calculate success rate
    const successfulCount = audioResults.filter(r => r.success).length
    const failedCount = audioResults.filter(r => !r.success).length
    
    console.log(`🎉 Batch voice generation complete: ${successfulCount} successful, ${failedCount} failed`)

    return NextResponse.json({
      success: true,
      results: audioResults,
      summary: {
        total: questions.length,
        successful: successfulCount,
        failed: failedCount
      }
    })

  } catch (error) {
    console.error('Error in batch voice generation:', error)
    
    // Check if it's a timeout error
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Batch voice generation timed out. Please try again.' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate batch voices' },
      { status: 500 }
    )
  }
}

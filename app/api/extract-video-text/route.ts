import { NextRequest, NextResponse } from 'next/server'
import { config } from '../../../lib/config'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const execAsync = promisify(exec)

// Helper function to create a timeout promise
const createTimeout = (ms: number) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Request timeout')), ms)
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      )
    }

    // Validate file size (max 200MB)
    const maxSize = 200 * 1024 * 1024 // 200MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size is 200MB. For larger files, try compressing the video first.' },
        { status: 400 }
      )
    }

    console.log('Processing video:', file.name, 'Size:', file.size, 'Type:', file.type)
    
    // Log file size in MB for better debugging
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    console.log(`File size: ${fileSizeMB}MB`)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create temporary files
    const tempDir = tmpdir()
    const videoPath = join(tempDir, `video_${Date.now()}.mp4`)
    const audioPath = join(tempDir, `audio_${Date.now()}.mp3`)

    try {
      // Write video file
      await writeFile(videoPath, buffer)

      // Extract audio using ffmpeg with optimized settings for larger files
      console.log('Extracting audio from video...')
      await execAsync(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -ar 16000 -ac 1 -b:a 64k "${audioPath}" -y`)

      // Check if audio file was created and has content
      const { stdout: audioInfo } = await execAsync(`ffprobe -v quiet -print_format json -show_format "${audioPath}"`)
      const audioData = JSON.parse(audioInfo)
      
      if (!audioData.format || !audioData.format.duration) {
        throw new Error('No audio track found in video')
      }

      const duration = parseFloat(audioData.format.duration)
      if (duration > 600) { // 10 minutes
        throw new Error('Video too long. Maximum duration is 10 minutes.')
      }

      // Transcribe audio using OpenAI Whisper
      console.log('Transcribing audio...')
      const audioBuffer = await readFile(audioPath)
      
      // Validate audio buffer
      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Audio extraction failed - no audio data found')
      }
      
      console.log('Audio buffer size:', audioBuffer.length, 'bytes')

      // Add timeout for transcription (5 minutes max processing time)
      const transcriptionPromise = fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
        },
        body: (() => {
          const formData = new FormData()
          // Convert Buffer to Uint8Array for proper Blob compatibility
          const uint8Array = new Uint8Array(audioBuffer)
          formData.append('file', new Blob([uint8Array], { type: 'audio/mp3' }), 'audio.mp3')
          formData.append('model', 'whisper-1')
          formData.append('response_format', 'text')
          return formData
        })(),
      })

      const transcriptionResponse = await Promise.race([
        transcriptionPromise,
        createTimeout(300000) // 5 minutes timeout
      ]) as Response

      if (!transcriptionResponse.ok) {
        const errorText = await transcriptionResponse.text()
        console.error('OpenAI transcription error:', errorText)
        console.error('Response status:', transcriptionResponse.status)
        console.error('Response headers:', Object.fromEntries(transcriptionResponse.headers.entries()))
        throw new Error('Failed to transcribe audio')
      }

      const transcription = await transcriptionResponse.text()
      
      if (!transcription || transcription.trim().length < 50) {
        throw new Error('Transcription too short or empty. Please ensure the video has clear speech.')
      }

      console.log('Video transcription successful')
      console.log('Transcription length:', transcription.length)
      console.log('Transcription preview:', transcription.substring(0, 500))

      // Clean up the transcription
      const cleanedText = transcription
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\x20-\x7E]/g, ' ') // Remove non-printable characters
        .trim()

      return NextResponse.json({ 
        text: cleanedText,
        originalLength: transcription.length,
        cleanedLength: cleanedText.length,
        duration: duration
      })

    } finally {
      // Clean up temporary files
      try {
        await unlink(videoPath)
        await unlink(audioPath)
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary files:', cleanupError)
      }
    }

  } catch (error) {
    console.error('Video extraction error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('ffmpeg')) {
        return NextResponse.json(
          { error: 'Video processing failed. Please ensure the video format is supported (MP4, MOV, AVI).' },
          { status: 400 }
        )
      } else if (error.message.includes('duration')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      } else if (error.message.includes('audio')) {
        return NextResponse.json(
          { error: 'No clear audio found in video. Please ensure the video has clear speech.' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to extract text from video. Please try again with a different file.' },
      { status: 500 }
    )
  }
} 
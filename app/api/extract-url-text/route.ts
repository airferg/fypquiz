import { NextRequest, NextResponse } from 'next/server'
import TurndownService from 'turndown'
import { YoutubeTranscript } from 'youtube-transcript'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let parsedUrl
    try {
      parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Block private/local addresses for security
    const privateIPs = [
      '127.0.0.1', 'localhost', '::1',
      '169.254.', '10.', '172.16.', '172.17.', '172.18.', '172.19.',
      '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.',
      '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.',
      '192.168.'
    ]
    
    const hostname = parsedUrl.hostname
    if (privateIPs.some(ip => hostname.startsWith(ip))) {
      return NextResponse.json(
        { error: 'Private/local addresses are not allowed' },
        { status: 400 }
      )
    }

    let extractedText = ''
    let title = ''
    let sourceType = 'webpage'

    // Check if it's a YouTube video
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      try {
        sourceType = 'youtube'
        
        // Extract video ID
        let videoId = ''
        if (hostname.includes('youtube.com')) {
          videoId = parsedUrl.searchParams.get('v') || ''
        } else if (hostname.includes('youtu.be')) {
          videoId = parsedUrl.pathname.slice(1)
        }

        if (!videoId) {
          throw new Error('Could not extract YouTube video ID')
        }

        // Try to get transcript
        try {
          const transcript = await YoutubeTranscript.fetchTranscript(videoId)
          
          if (!transcript || transcript.length === 0) {
            throw new Error('No transcript available for this video')
          }
          
          extractedText = transcript
            .map(item => item.text)
            .join(' ')
          
          title = `YouTube Video Transcript (${videoId})`
          console.log('Successfully extracted YouTube transcript')
        } catch (transcriptError) {
          console.log('Transcript not available, falling back to video info:', transcriptError)
          // Fallback: try to get video info from the page
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          })
          
          if (!response.ok) {
            throw new Error('Failed to fetch YouTube page')
          }
          
          const html = await response.text()
          
          // Extract title and description using regex
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
          const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)
          
          title = titleMatch ? titleMatch[1] : `YouTube Video (${videoId})`
          const description = descMatch ? descMatch[1] : ''
          
          extractedText = description || 'No transcript or description available for this YouTube video.'
        }
      } catch (youtubeError) {
        console.error('YouTube processing error:', youtubeError)
        const errorMessage = youtubeError instanceof Error && youtubeError.message.includes('No transcript available') 
          ? 'This YouTube video does not have captions or transcript available. Please try a different video with captions enabled.'
          : 'Failed to extract content from YouTube video. The video might be private, deleted, or have no transcript available.'
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        )
      }
    } else {
      // Regular webpage
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const html = await response.text()
        
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        title = titleMatch ? titleMatch[1] : 'Webpage Content'
        
        // Simple content extraction - remove script, style, and navigation elements
        let cleanHtml = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
          .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '') // Remove navigation
          .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '') // Remove headers
          .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '') // Remove footers
          .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '') // Remove sidebars
          .replace(/<[^>]*class="[^"]*(?:ad|advertisement|banner|sidebar)[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi, '') // Remove ad-related content
        
        // Convert HTML to markdown for cleaner text
        const turndownService = new TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced'
        })
        
        // Configure turndown to preserve important content
        turndownService.addRule('preserveContent', {
          filter: ['div', 'section', 'article', 'main'],
          replacement: function(content: string) {
            return content + '\n\n'
          }
        })
        
        const markdown = turndownService.turndown(cleanHtml)
        
        // Convert markdown to plain text (remove markdown syntax)
        extractedText = markdown
          .replace(/#{1,6}\s+/g, '') // Remove headers
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
          .replace(/\*(.*?)\*/g, '$1') // Remove italic
          .replace(/`(.*?)`/g, '$1') // Remove inline code
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
          .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
          .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
          .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
          .replace(/^\s*>\s+/gm, '') // Remove blockquotes
          .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
        
        console.log('Successfully extracted content using simplified parsing')
      } catch (webpageError) {
        console.error('Webpage processing error:', webpageError)
        return NextResponse.json(
          { error: `Failed to extract content from webpage: ${webpageError instanceof Error ? webpageError.message : 'Unknown error'}` },
          { status: 400 }
        )
      }
    }

    // Clean up the extracted text
    console.log('Before validation - extractedText:', extractedText)
    console.log('Before validation - extractedText length:', extractedText?.length)
    console.log('Before validation - extractedText trimmed length:', extractedText?.trim().length)
    
    if (!extractedText || extractedText.trim().length < 50) {
      console.log('Validation failed - text too short or empty')
      return NextResponse.json(
        { error: 'Could not extract meaningful content from the URL. The page might be empty, require authentication, or contain no readable text.' },
        { status: 400 }
      )
    }

    const cleanedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\x20-\x7E]/g, ' ') // Remove non-printable characters
      .trim()

    console.log('URL text extraction successful')
    console.log('Source type:', sourceType)
    console.log('Title:', title)
    console.log('Extracted text length:', cleanedText.length)
    console.log('Text preview:', cleanedText.substring(0, 500))

    return NextResponse.json({ 
      text: cleanedText,
      title: title,
      sourceType: sourceType,
      url: url,
      originalLength: extractedText.length,
      cleanedLength: cleanedText.length
    })

  } catch (error) {
    console.error('URL extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract content from URL. Please check the URL and try again.' },
      { status: 500 }
    )
  }
}

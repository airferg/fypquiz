import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

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

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    console.log('Processing PDF:', file.name, 'Size:', file.size)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text using pdf-parse
    const data = await pdf(buffer)
    const text = data.text

    console.log('PDF text extraction successful')
    console.log('Extracted text length:', text.length)
    console.log('Text preview:', text.substring(0, 500))

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from PDF. The PDF might be image-based or encrypted.' },
        { status: 400 }
      )
    }

    // Clean up the text
    const cleanedText = text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\x20-\x7E]/g, ' ') // Remove non-printable characters
      .trim()

    return NextResponse.json({ 
      text: cleanedText,
      originalLength: text.length,
      cleanedLength: cleanedText.length
    })

  } catch (error) {
    console.error('PDF extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from PDF. Try converting to text format first.' },
      { status: 500 }
    )
  }
} 
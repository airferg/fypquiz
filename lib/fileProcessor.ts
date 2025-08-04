// File processing utilities for extracting text from different file types

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type
  
  try {
    if (fileType === 'text/plain') {
      return await file.text()
    } else if (fileType === 'application/pdf') {
      return await extractTextFromPDF(file)
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractTextFromDOCX(file)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }
  } catch (error) {
    console.error('File processing error:', error)
    throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  // Send PDF to server for processing since pdf-parse is Node.js only
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await fetch('/api/extract-pdf-text', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to extract PDF text')
    }
    
    const data = await response.json()
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF. Try converting to text format first.')
  }
}

async function extractTextFromDOCX(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)
        
        console.log('DOCX file size:', uint8Array.length)
        
        // Convert to string for processing
        const docxString = new TextDecoder('utf-8').decode(uint8Array)
        
        // Look for text content in DOCX
        let text = ''
        
        // Extract text using common DOCX patterns
        const textMatches = docxString.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []
        const paragraphMatches = docxString.match(/<w:p[^>]*>([^<]+)<\/w:p>/g) || []
        
        // Combine all potential text matches
        const allMatches = [...textMatches, ...paragraphMatches]
        
        for (const match of allMatches) {
          // Extract text content from XML tags
          const textContent = match.replace(/<[^>]*>/g, '').trim()
          if (textContent.length > 0) {
            text += textContent + ' '
          }
        }
        
        // If we didn't find much text, try a different approach
        if (text.length < 100) {
          console.log('Trying alternative DOCX extraction...')
          // Look for readable ASCII characters
          for (let i = 0; i < uint8Array.length; i++) {
            const char = uint8Array[i]
            if (char >= 32 && char <= 126) {
              text += String.fromCharCode(char)
            }
          }
        }
        
        // Clean up the final text
        text = text
          .replace(/[^\x20-\x7E]/g, ' ') // Remove non-printable characters
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
        
        console.log('DOCX text extraction successful, length:', text.length)
        console.log('DOCX text preview:', text.substring(0, 200))
        
        if (text.length < 50) {
          throw new Error('Could not extract meaningful text from DOCX')
        }
        
        resolve(text)
      } catch (error) {
        reject(new Error('Failed to extract text from DOCX'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read DOCX file'))
    reader.readAsArrayBuffer(file)
  })
} 
'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, File, AlertCircle, Video } from 'lucide-react'
import { extractTextFromFile } from '@/lib/fileProcessor'

interface FileUploaderProps {
  onFileUpload: (content: string, fileName: string) => void
  isLoading?: boolean
}

export default function FileUploader({ onFileUpload, isLoading = false }: FileUploaderProps) {
  const [error, setError] = useState<string>('')
  const [processingStatus, setProcessingStatus] = useState<string>('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError('')
    setProcessingStatus('')
    
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    
    try {
      // Enhanced mobile debugging
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      console.log('=== FILE UPLOAD DEBUG ===')
      console.log('Device type:', isMobile ? 'Mobile' : 'Desktop')
      console.log('User agent:', navigator.userAgent)
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
      })
      console.log('File object:', file)
      
      setProcessingStatus('Extracting text from file...')
      
      const content = await extractTextFromFile(file)

      if (content.trim().length === 0) {
        throw new Error('File appears to be empty')
      }

      console.log('Extracted content length:', content.length)
      console.log('Content preview:', content.substring(0, 500) + '...')

      setProcessingStatus('Generating quiz questions...')
      onFileUpload(content, file.name)
    } catch (err) {
      console.error('=== FILE PROCESSING ERROR ===')
      console.error('Error details:', err)
      console.error('Error type:', typeof err)
      console.error('Error message:', err instanceof Error ? err.message : 'No message')
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack')
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to read file'
      
      // Enhanced error messages for mobile debugging
      let userFriendlyError = errorMessage
      
      if (errorMessage.includes('PDF')) {
        userFriendlyError = 'PDF processing failed. This might be an image-based PDF. Try converting it to text or uploading a different file.'
      } else if (errorMessage.includes('DOCX')) {
        userFriendlyError = 'DOCX processing failed. Try saving the file as a different format or uploading a text file.'
      } else if (errorMessage.includes('video') || errorMessage.includes('Video')) {
        userFriendlyError = errorMessage
      } else if (errorMessage.includes('timeout')) {
        userFriendlyError = 'Request timed out. Please check your internet connection and try again.'
      } else if (errorMessage.includes('network')) {
        userFriendlyError = 'Network error. Please check your internet connection and try again.'
      } else if (file.size > 100 * 1024 * 1024) { // 100MB
        userFriendlyError = 'File is too large for mobile processing. Try a smaller file or use desktop.'
      }
      
      setError(userFriendlyError)
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi']
    },
    multiple: false,
    disabled: isLoading,
    maxSize: 100 * 1024 * 1024, // 100MB limit for mobile compatibility
    onDropRejected: (rejectedFiles) => {
      const file = rejectedFiles[0]
      if (file.errors.some(e => e.code === 'file-too-large')) {
        setError('File is too large. Maximum size is 100MB for mobile devices.')
      } else if (file.errors.some(e => e.code === 'file-invalid-type')) {
        setError('File type not supported. Please upload PDF, DOCX, TXT, or video files.')
      } else {
        setError('File upload failed. Please try again.')
      }
    }
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all bg-white/10 backdrop-blur-md border-white/20
          ${isDragActive 
            ? 'border-accent bg-accent/20' 
            : 'hover:border-accent/50 hover:bg-white/20'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          ) : (
            <div className="flex items-center space-x-2">
              <Upload className="h-8 w-8 text-accent" />
              <FileText className="h-8 w-8 text-accent" />
              <File className="h-8 w-8 text-accent" />
              <Video className="h-8 w-8 text-accent" />
            </div>
          )}
          
          <div>
            <p className="text-lg font-semibold text-white">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your study material'}
            </p>
            <p className="text-sm text-gray-300 mt-2">
              Supports PDF, DOCX, TXT, and video files (MP4, MOV, AVI)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Mobile: Max 100MB • Desktop: Max 200MB
            </p>
            {processingStatus && (
              <p className="text-sm text-accent mt-2">{processingStatus}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center space-x-2 text-red-400 bg-red-500/20 border border-red-400 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <div>
            <span className="font-semibold">File Processing Error:</span>
            <br />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Helpful tips */}
      <div className="mt-4 text-sm text-gray-300">
        <p className="font-semibold mb-2">Tips for better results:</p>
        <ul className="space-y-1">
          <li>• Use text-based PDFs (not scanned images)</li>
          <li>• Ensure files are not password-protected</li>
          <li>• Try converting image-based PDFs to text first</li>
          <li>• Plain text files work best</li>
          <li>• Videos should have clear speech audio (max 10 minutes)</li>
          <li>• Video files must be under 200MB</li>
          <li>• Mobile devices: Use smaller files (under 100MB) for best performance</li>
          <li>• Check your internet connection - mobile networks may be slower</li>
        </ul>
      </div>
    </div>
  )
} 
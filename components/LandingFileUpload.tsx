'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { Upload, FileText, File, AlertCircle, Video, Link, Globe, Play, CheckCircle, Sparkles } from 'lucide-react'
import { extractTextFromFile } from '@/lib/fileProcessor'

interface LandingFileUploadProps {
  onFileUpload: (content: string, fileName: string) => void
}

export default function LandingFileUpload({ onFileUpload }: LandingFileUploadProps) {
  const [error, setError] = useState<string>('')
  const [processingStatus, setProcessingStatus] = useState<string>('')
  const [url, setUrl] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const router = useRouter()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError('')
    setProcessingStatus('')
    setIsProcessing(true)
    
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    
    try {
      setProcessingStatus('Extracting text from file...')
      
      const content = await extractTextFromFile(file)

      if (content.trim().length === 0) {
        throw new Error('File appears to be empty')
      }

      setProcessingStatus('AI is building your quiz...')
      
      // Simulate AI processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setShowSignupPrompt(true)
      setProcessingStatus('')
    } catch (err) {
      console.error('File processing error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to read file'
      setError(errorMessage)
      setIsProcessing(false)
    }
  }, [])

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setError('')
    setProcessingStatus('')
    setIsProcessing(true)

    try {
      setProcessingStatus('Extracting content from URL...')
      
      const response = await fetch('/api/extract-url-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract content from URL')
      }

      setProcessingStatus('AI is building your quiz...')
      
      // Simulate AI processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setShowSignupPrompt(true)
      setProcessingStatus('')
    } catch (err) {
      console.error('URL processing error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract content from URL'
      setError(errorMessage)
      setIsProcessing(false)
    }
  }

  const handleContinueToSignup = () => {
    // Store the extracted content and redirect to signup
    if (url.trim()) {
      // For URL content, we need to store it temporarily
      // The actual content will be re-extracted after signup
      sessionStorage.setItem('pendingUrl', url.trim())
    }
    router.push('/auth')
  }

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
    disabled: isProcessing,
    maxSize: 100 * 1024 * 1024, // 100MB limit
    onDropRejected: (rejectedFiles) => {
      const file = rejectedFiles[0]
      if (file.errors.some(e => e.code === 'file-too-large')) {
        setError('File is too large. Maximum size is 100MB.')
      } else if (file.errors.some(e => e.code === 'file-invalid-type')) {
        setError('File type not supported. Please upload PDF, DOCX, TXT, or video files.')
      } else {
        setError('File upload failed. Please try again.')
      }
    }
  })

  // Auto-redirect after 5 seconds if user doesn't continue
  useEffect(() => {
    if (showSignupPrompt) {
      const timer = setTimeout(() => {
        // This function is kept for compatibility but not used in this version
        // addTerminalLine('Redirecting to signup...') 
        router.push('/auth')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [showSignupPrompt, router])

  const addTerminalLine = (line: string) => {
    // This function is kept for compatibility but not used in this version
    console.log(line)
  }

  if (showSignupPrompt) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="bg-white/90 backdrop-blur-md border border-green-200 rounded-2xl p-8 shadow-lg">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your quiz is ready! 🎉</h3>
          <p className="text-base text-gray-600 mb-6">
            Want to see your quiz? Create a free account in 10 seconds.
          </p>
          <button
            onClick={handleContinueToSignup}
            className="bg-[#5CA4F6] text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-[#5CA4F6]/90 transition-all flex items-center justify-center space-x-2 mx-auto shadow-lg"
          >
            <Play className="h-5 w-5" />
            <span>See My Quiz</span>
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Redirecting automatically in 5 seconds...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Unified Input Section */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-700 mb-2">Paste your link or drop a file</h3>
          <p className="text-xs text-gray-500">
            We'll turn it into a fun quiz in seconds ✨
          </p>
        </div>
        
        {/* URL Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube link, article, or drop your study notes here..."
            className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20"
            disabled={isProcessing}
          />
          <button
            onClick={handleUrlSubmit}
            disabled={isProcessing || !url.trim()}
            className="px-6 py-3 bg-[#5CA4F6] text-white rounded-full hover:bg-[#5CA4F6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Extract'
            )}
          </button>
        </div>
        
        {/* YouTube Captions Notice */}
        {url.includes('youtube.com') || url.includes('youtu.be') ? (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium">
                <strong>Important:</strong> Make sure captions/CC are turned on in the YouTube video for best results! 🎥
              </span>
            </div>
          </div>
        ) : null}
        
        {/* Processing Status */}
        {processingStatus && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5CA4F6] mx-auto mb-2"></div>
            <p className="text-[#5CA4F6] font-medium">{processingStatus}</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-4 text-gray-400 font-medium">or</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      {/* File Upload Section */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all bg-white/80 backdrop-blur-sm border-gray-200
          ${isDragActive 
            ? 'border-[#5CA4F6] bg-[#5CA4F6]/10' 
            : 'hover:border-[#5CA4F6]/50 hover:bg-white/90'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5CA4F6]"></div>
          ) : (
            <div className="flex items-center space-x-2">
              <Upload className="h-8 w-8 text-[#5CA4F6]" />
              <FileText className="h-8 w-8 text-[#5CA4F6]" />
              <File className="h-8 w-8 text-[#5CA4F6]" />
              <Video className="h-8 w-8 text-[#5CA4F6]" />
            </div>
          )}
          
          <div>
            <p className="text-base font-semibold text-gray-700">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your study material'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supports PDF, DOCX, TXT, and video files (MP4, MOV, AVI)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max 100MB • Works on mobile & desktop
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 flex items-center space-x-2 text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <div>
            <span className="font-semibold">Error:</span>
            <br />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Helpful tips */}
      <div className="mt-4 text-xs text-gray-500">
        <p className="font-semibold mb-2 text-gray-600 flex items-center justify-center">
          <Sparkles className="h-4 w-4 mr-1" />
          Tips for better results:
        </p>
        <ul className="space-y-1">
          <li>• <strong>YouTube videos:</strong> Turn on captions/CC for best results! 🎥</li>
          <li>• Works with articles, blog posts, documentation, and wikis</li>
          <li>• Avoid login-required or paywall-protected content</li>
          <li>• Some JavaScript-heavy sites may not work perfectly</li>
          <li>• Respect website terms of service and robots.txt</li>
          <li>• Use text-based PDFs (not scanned images)</li>
          <li>• Ensure files are not password-protected</li>
          <li>• Videos should have clear speech audio (max 10 minutes)</li>
        </ul>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { extractTextFromFile } from '@/lib/fileProcessor'
import { useDropzone } from 'react-dropzone'

export default function TestPage() {
  const [status, setStatus] = useState('Loading...')
  const [envVars, setEnvVars] = useState<any>({})
  const [fileContent, setFileContent] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        // Check environment variables
        const envCheck = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
          openaiKey: process.env.OPEN_AI_API_KEY ? 'Set' : 'Missing',
          elevenlabsKey: process.env.ELEVENLABS_API_KEY ? 'Set' : 'Missing',
          runwayKey: process.env.RUNWAY_API_KEY ? 'Set' : 'Missing',
        }
        setEnvVars(envCheck)

        // Test Supabase connection
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus(`Supabase Error: ${error.message}`)
        } else {
          setStatus('Supabase connection successful! Environment variables are working.')
        }
      } catch (error) {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    checkEnvironment()
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setFileName(file.name)
        setIsProcessing(true)
        setStatus('Processing file...')
        
        try {
          const content = await extractTextFromFile(file)
          setFileContent(content)
          setStatus(`File processed successfully! Extracted ${content.length} characters.`)
        } catch (error) {
          setStatus(`File processing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
          setIsProcessing(false)
        }
      }
    },
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  })

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Environment Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-mono text-sm">{key}:</span>
                  <span className={`font-semibold ${value === 'Set' ? 'text-green-600' : 'text-red-600'}`}>
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <p className="text-gray-700">{status}</p>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">File Processing Test</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input {...getInputProps()} />
            {isProcessing ? (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-600">Processing file...</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">Drop a file here to test text extraction</p>
                <p className="text-sm text-gray-500 mt-2">Supports PDF, DOCX, and TXT files</p>
              </div>
            )}
          </div>
        </div>

        {fileName && (
          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">File Content Preview</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">File: {fileName}</p>
              <p className="text-sm text-gray-600">Content length: {fileContent.length} characters</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">{fileContent.substring(0, 2000)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
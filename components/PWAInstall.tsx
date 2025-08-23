'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Globe, CheckCircle } from 'lucide-react'

interface PWAInstallProps {
  className?: string
}

export default function PWAInstall({ className = '' }: PWAInstallProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const closeInstructions = () => {
    setShowInstructions(false)
  }

  if (!isClient) {
    return null
  }

  return (
    <>
      {/* Static Install Button */}
      <button
        onClick={() => setShowInstructions(true)}
        className={`fixed bottom-6 right-6 z-50 bg-[#5CA4F6] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${className}`}
        aria-label="Install FYPQuiz App"
      >
        <span className="text-sm font-medium whitespace-nowrap">Using mobile?</span>
      </button>

      {/* Instructions Drawer */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Using Mobile? Add the App! 📱
              </h2>
              <button
                onClick={closeInstructions}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* iOS Instructions */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <Smartphone className="h-8 w-8 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">iPhone/iPad Instructions</h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">1</span>
                  <p>Tap the <strong>Share</strong> button <span className="text-blue-600">⎋</span> at the bottom of your browser</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">2</span>
                  <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">3</span>
                  <p>Tap <strong>"Add"</strong> to install the app</p>
                </div>
              </div>
            </div>

            {/* Android Instructions */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <Smartphone className="h-8 w-8 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-800">Android Instructions</h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start space-x-3">
                  <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">1</span>
                  <p>Tap the <strong>Menu</strong> button ⋮ in your browser</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">2</span>
                  <p>Tap <strong>"Add to Home screen"</strong></p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">3</span>
                  <p>Tap <strong>"Add"</strong> to install the app</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-3">Why Install the App? ✨</h4>
              <div className="space-y-2 text-blue-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Quick access from your home screen</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Works offline for saved quizzes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Full-screen experience like a native app</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Faster loading and better performance</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={closeInstructions}
              className="w-full bg-[#5CA4F6] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-[#4A90E2] transition-colors"
            >
              Got it! 👍
            </button>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'

interface UsageMonitorProps {
  characterUsage: number
  maxCharacters?: number
}

export default function UsageMonitor({ characterUsage, maxCharacters = 50000 }: UsageMonitorProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show monitor when usage is high
    if (characterUsage > maxCharacters * 0.8) {
      setIsVisible(true)
    }
  }, [characterUsage, maxCharacters])

  if (!isVisible) return null

  const percentage = (characterUsage / maxCharacters) * 100
  const isWarning = percentage > 80
  const isCritical = percentage > 95

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg text-white text-sm ${
      isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
    }`}>
      <div className="font-bold">API Usage</div>
      <div>{characterUsage.toLocaleString()} / {maxCharacters.toLocaleString()} chars</div>
      <div className="w-full bg-white/20 rounded-full h-2 mt-1">
        <div 
          className={`h-2 rounded-full transition-all ${
            isCritical ? 'bg-red-200' : isWarning ? 'bg-yellow-200' : 'bg-green-200'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
} 
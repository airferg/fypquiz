import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <Image
      src="/fypquizlogo.png"
      alt="FYPQuiz Logo"
      width={size}
      height={size}
      className={className}
    />
  )
}

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Schedule configuration
const SCHEDULE_CONFIG = {
  postsPerWeek: 3,
  preferredDays: ['monday', 'wednesday', 'friday'], // Days to publish
  preferredTime: '10:00', // Time to publish (24-hour format)
}

export async function POST() {
  try {
    // Check if we need to generate a post today
    const today = new Date()
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'lowercase' })
    const currentTime = today.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    
    // Check if today is a preferred day and time
    const shouldPublish = SCHEDULE_CONFIG.preferredDays.includes(dayOfWeek) && 
                         currentTime >= SCHEDULE_CONFIG.preferredTime
    
    if (!shouldPublish) {
      return NextResponse.json({ 
        message: 'Not time to publish yet',
        nextPublishTime: getNextPublishTime()
      })
    }
    
    // Check if we already published today
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    const { data: todayPosts, error: checkError } = await supabase
      .from('blog_posts')
      .select('id')
      .gte('published_at', todayStart.toISOString())
      .lt('published_at', todayEnd.toISOString())
    
    if (checkError) {
      console.error('Error checking today\'s posts:', checkError)
      return NextResponse.json({ error: 'Failed to check existing posts' }, { status: 500 })
    }
    
    if (todayPosts && todayPosts.length > 0) {
      return NextResponse.json({ 
        message: 'Already published today',
        postsToday: todayPosts.length
      })
    }
    
    // Generate and publish a new post
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blog/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to generate blog post')
    }
    
    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Blog post scheduled and published successfully',
      post: result.post,
      nextPublishTime: getNextPublishTime()
    })
    
  } catch (error) {
    console.error('Error in blog scheduling:', error)
    return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 })
  }
}

function getNextPublishTime(): string {
  const today = new Date()
  const currentDay = today.toLocaleDateString('en-US', { weekday: 'lowercase' })
  
  // Find next preferred day
  let nextDay = SCHEDULE_CONFIG.preferredDays.find(day => day > currentDay)
  if (!nextDay) {
    nextDay = SCHEDULE_CONFIG.preferredDays[0] // Next week
  }
  
  // Calculate days until next publish
  const daysUntilNext = SCHEDULE_CONFIG.preferredDays.indexOf(nextDay) - SCHEDULE_CONFIG.preferredDays.indexOf(currentDay)
  const nextDate = new Date(today.getTime() + (daysUntilNext > 0 ? daysUntilNext : 7 + daysUntilNext) * 24 * 60 * 60 * 1000)
  
  return `${nextDate.toLocaleDateString()} at ${SCHEDULE_CONFIG.preferredTime}`
}

// GET endpoint to check schedule status
export async function GET() {
  try {
    const today = new Date()
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'lowercase' })
    const currentTime = today.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    
    const shouldPublish = SCHEDULE_CONFIG.preferredDays.includes(dayOfWeek) && 
                         currentTime >= SCHEDULE_CONFIG.preferredTime
    
    return NextResponse.json({
      schedule: {
        postsPerWeek: SCHEDULE_CONFIG.postsPerWeek,
        preferredDays: SCHEDULE_CONFIG.preferredDays,
        preferredTime: SCHEDULE_CONFIG.preferredTime,
        shouldPublish,
        nextPublishTime: getNextPublishTime()
      }
    })
  } catch (error) {
    console.error('Error getting schedule status:', error)
    return NextResponse.json({ error: 'Failed to get schedule status' }, { status: 500 })
  }
} 
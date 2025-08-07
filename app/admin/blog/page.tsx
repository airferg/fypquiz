'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Play, 
  Settings, 
  TrendingUp,
  Users,
  FileText,
  ArrowLeft
} from 'lucide-react'

interface BlogStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  thisWeekPosts: number
  averageReadTime: number
  totalKeywords: number
}

interface ScheduleInfo {
  postsPerWeek: number
  preferredDays: string[]
  preferredTime: string
  shouldPublish: boolean
  nextPublishTime: string
}

export default function BlogAdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<BlogStats | null>(null)
  const [schedule, setSchedule] = useState<ScheduleInfo | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastAction, setLastAction] = useState<string>('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user) {
      fetchStats()
      fetchSchedule()
    }
  }, [user, loading, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/blog/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/blog/schedule')
      if (response.ok) {
        const data = await response.json()
        setSchedule(data.schedule)
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
    }
  }

  const generatePost = async () => {
    setIsGenerating(true)
    setLastAction('')
    
    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
      })
      
      if (response.ok) {
        const result = await response.json()
        setLastAction(`✅ Blog post "${result.post.title}" generated successfully!`)
        fetchStats() // Refresh stats
      } else {
        setLastAction('❌ Failed to generate blog post')
      }
    } catch (error) {
      setLastAction('❌ Error generating blog post')
    } finally {
      setIsGenerating(false)
    }
  }

  const triggerSchedule = async () => {
    try {
      const response = await fetch('/api/blog/schedule', {
        method: 'POST',
      })
      
      if (response.ok) {
        const result = await response.json()
        setLastAction(`✅ ${result.message}`)
        fetchSchedule() // Refresh schedule
      } else {
        setLastAction('❌ Failed to trigger schedule')
      }
    } catch (error) {
      setLastAction('❌ Error triggering schedule')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-lg text-gray-300">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-accent" />
              <h1 className="text-2xl font-bold">Blog Admin</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Posts</p>
                  <p className="text-3xl font-bold text-white">{stats.totalPosts}</p>
                </div>
                <FileText className="h-8 w-8 text-accent" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Published</p>
                  <p className="text-3xl font-bold text-green-400">{stats.publishedPosts}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">This Week</p>
                  <p className="text-3xl font-bold text-accent">{stats.thisWeekPosts}</p>
                </div>
                <Calendar className="h-8 w-8 text-accent" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Read Time</p>
                  <p className="text-3xl font-bold text-white">{stats.averageReadTime}m</p>
                </div>
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Schedule Info */}
        {schedule && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="h-6 w-6 text-accent" />
              <h2 className="text-xl font-bold">Publishing Schedule</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Current Schedule</h3>
                <div className="space-y-2 text-gray-300">
                  <p><span className="font-medium">Posts per week:</span> {schedule.postsPerWeek}</p>
                  <p><span className="font-medium">Publish days:</span> {schedule.preferredDays.join(', ')}</p>
                  <p><span className="font-medium">Publish time:</span> {schedule.preferredTime}</p>
                  <p><span className="font-medium">Next publish:</span> {schedule.nextPublishTime}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Status</h3>
                <div className="space-y-2">
                  <div className={`flex items-center space-x-2 ${schedule.shouldPublish ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${schedule.shouldPublish ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span>{schedule.shouldPublish ? 'Ready to publish' : 'Not time to publish'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Manual Actions</h3>
            <div className="space-y-4">
              <button
                onClick={generatePost}
                disabled={isGenerating}
                className="w-full bg-accent text-white py-3 px-4 rounded-lg font-semibold hover:bg-accent/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Generate Blog Post</span>
                  </>
                )}
              </button>
              
              <button
                onClick={triggerSchedule}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-3 px-4 rounded-lg font-semibold hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Trigger Schedule Check</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/blog')}
                className="w-full text-left text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>View Blog</span>
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full text-left text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Last Action Status */}
        {lastAction && (
          <div className="mt-8 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
            <p className="text-center">{lastAction}</p>
          </div>
        )}
      </div>
    </div>
  )
} 
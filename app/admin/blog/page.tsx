'use client'

import { useState, useEffect } from 'react'
import { useAuth, AuthProvider } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Plus, Edit, Trash2, Eye, Calendar, Clock, User, Tag, Search, Filter, SortAsc, SortDesc, BarChart3, TrendingUp, Users, FileText } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  readTime: number
  tags: string[]
  slug: string
  status: 'draft' | 'published'
  views: number
}

function BlogAdminContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'views'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    fetchPosts()
  }, [user, router])

  const fetchPosts = async () => {
    try {
      setPostsLoading(true)
      const response = await fetch('/api/blog/posts')
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      // For demo purposes, create some sample posts
      setPosts([
        {
          id: '1',
          title: '5 Study Hacks That Actually Work for Gen Z Students',
          excerpt: 'Discover proven study techniques that match your TikTok attention span and help you retain information better.',
          content: 'Full content here...',
          author: 'FYPQuiz Team',
          publishedAt: '2024-01-15T10:00:00Z',
          readTime: 5,
          tags: ['study tips', 'gen z', 'focus'],
          slug: '5-study-hacks-gen-z',
          status: 'published',
          views: 1247
        },
        {
          id: '2',
          title: 'Why Background Videos Help You Focus While Studying',
          excerpt: 'Learn the science behind why having Minecraft parkour or Subway Surfers in the background actually improves your concentration.',
          content: 'Full content here...',
          author: 'FYPQuiz Team',
          publishedAt: '2024-01-10T14:30:00Z',
          readTime: 7,
          tags: ['focus', 'background videos', 'science'],
          slug: 'background-videos-focus-studying',
          status: 'published',
          views: 892
        },
        {
          id: '3',
          title: 'How to Turn Boring Notes Into Fun Quizzes',
          excerpt: 'Transform your dull study materials into engaging quiz experiences that make learning actually enjoyable.',
          content: 'Full content here...',
          author: 'FYPQuiz Team',
          publishedAt: '2024-01-05T09:15:00Z',
          readTime: 6,
          tags: ['quiz creation', 'study materials', 'engagement'],
          slug: 'turn-notes-into-quizzes',
          status: 'draft',
          views: 0
        }
      ])
    } finally {
      setPostsLoading(false)
    }
  }

  const allStatuses = ['all', 'published', 'draft']

  const filteredAndSortedPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'views':
          comparison = a.views - b.views
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0)
  const publishedPosts = posts.filter(post => post.status === 'published').length
  const draftPosts = posts.filter(post => post.status === 'draft').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5CA4F6] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-[#5CA4F6]" />
              <h1 className="text-2xl font-bold">Blog Admin</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Posts</p>
                <p className="text-2xl font-bold text-gray-800">{posts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-800">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-2xl font-bold text-gray-800">{publishedPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Edit className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Drafts</p>
                <p className="text-2xl font-bold text-gray-800">{draftPosts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20"
              >
                {allStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'views')}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="views">Views</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 text-gray-600" /> : <SortDesc className="h-4 w-4 text-gray-600" />}
              </button>
            </div>

            {/* New Post Button */}
            <button className="bg-[#5CA4F6] text-white px-4 py-2 rounded-lg hover:bg-[#5CA4F6]/90 transition-all flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Post</span>
            </button>
          </div>
        </div>

        {/* Posts Table */}
        {filteredAndSortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || selectedStatus !== 'all' ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search terms or filters'
                : 'Create your first blog post to get started!'
              }
            </p>
            {(searchTerm || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedStatus('all')
                }}
                className="bg-[#5CA4F6] text-white px-6 py-3 rounded-lg hover:bg-[#5CA4F6]/90 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-800 mb-1">{post.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{post.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {post.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BlogAdminPage() {
  return (
    <AuthProvider>
      <BlogAdminContent />
    </AuthProvider>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Calendar, Clock, User, Tag, Search, Filter, SortAsc, SortDesc } from 'lucide-react'

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
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'readTime'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
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
          slug: '5-study-hacks-gen-z'
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
          slug: 'background-videos-focus-studying'
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
          slug: 'turn-notes-into-quizzes'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const allTags = ['all', ...Array.from(new Set(posts.flatMap(post => post.tags || []).filter(tag => tag && typeof tag === 'string')))]

  const filteredAndSortedPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTag = selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag))
      return matchesSearch && matchesTag
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
        case 'readTime':
          comparison = a.readTime - b.readTime
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5CA4F6] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading study tips...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-[#5CA4F6] mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Study Tips & Learning Guides</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the best study methods, Gen Z learning hacks, and how to make studying actually fun with TikTok-style quizzes.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link href="/" className="text-[#5CA4F6] hover:text-[#5CA4F6]/80">Back to Home</Link>
              <Link href="/auth" className="text-[#5CA4F6] hover:text-[#5CA4F6]/80">Try FYPQuiz Free</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search study tips and guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20"
              />
            </div>

            {/* Tag Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20"
              >
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag === 'all' ? 'All Topics' : (tag && typeof tag === 'string' ? tag.charAt(0).toUpperCase() + tag.slice(1) : tag)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'readTime')}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="readTime">Read Time</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 text-gray-600" /> : <SortDesc className="h-4 w-4 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredAndSortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || selectedTag !== 'all' ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedTag !== 'all' 
                ? 'Try adjusting your search terms or filters'
                : 'Check back soon for study tips and learning guides!'
              }
            </p>
            {(searchTerm || selectedTag !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedTag('all')
                }}
                className="bg-[#5CA4F6] text-white px-6 py-3 rounded-lg hover:bg-[#5CA4F6]/90 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(post.tags || []).slice(0, 3).filter(tag => tag && typeof tag === 'string').map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-[#5CA4F6] transition-colors">
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>

                  {/* Read More */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[#5CA4F6] hover:text-[#5CA4F6]/80 font-medium text-sm flex items-center space-x-1"
                    >
                      <span>Read More</span>
                      <ArrowLeft className="h-3 w-3 rotate-180" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <ArrowLeft className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Back to Home</h4>
                <p className="text-sm text-gray-600">Return to landing page</p>
              </div>
            </div>
          </Link>

          <Link
            href="/auth"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Try FYPQuiz</h4>
                <p className="text-sm text-gray-600">Create your first quiz</p>
              </div>
            </div>
          </Link>

          <Link
            href="/feedback"
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Share Feedback</h4>
                <p className="text-sm text-gray-600">Help us improve</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 
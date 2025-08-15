import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseServer()
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    // Transform database fields to match frontend expectations
    const transformedPosts = (posts || []).map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      publishedAt: post.published_at,
      readTime: post.read_time,
      keywords: post.keywords || [],
      imageUrl: post.image_url
    }))

    return NextResponse.json({ posts: transformedPosts })
  } catch (error) {
    console.error('Error in blog posts API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
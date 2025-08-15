import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createSupabaseServer()
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Transform database fields to match frontend expectations
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      publishedAt: post.published_at,
      readTime: post.read_time,
      keywords: post.keywords || [],
      imageUrl: post.image_url
    }

    return NextResponse.json({ post: transformedPost })
  } catch (error) {
    console.error('Error in blog post API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
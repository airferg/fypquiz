import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post: posts })
  } catch (error) {
    console.error('Error in blog post API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
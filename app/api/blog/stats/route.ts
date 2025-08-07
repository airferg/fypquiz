import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get total posts
    const { data: totalPosts, error: totalError } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact' })

    if (totalError) {
      console.error('Error getting total posts:', totalError)
      return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
    }

    // Get published posts
    const { data: publishedPosts, error: publishedError } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact' })
      .eq('status', 'published')

    if (publishedError) {
      console.error('Error getting published posts:', publishedError)
      return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
    }

    // Get draft posts
    const { data: draftPosts, error: draftError } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact' })
      .eq('status', 'draft')

    if (draftError) {
      console.error('Error getting draft posts:', draftError)
      return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
    }

    // Get this week's posts
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    
    const { data: thisWeekPosts, error: weekError } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact' })
      .gte('published_at', weekStart.toISOString())
      .eq('status', 'published')

    if (weekError) {
      console.error('Error getting this week posts:', weekError)
      return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
    }

    // Get average read time
    const { data: readTimes, error: readTimeError } = await supabase
      .from('blog_posts')
      .select('read_time')
      .eq('status', 'published')

    if (readTimeError) {
      console.error('Error getting read times:', readTimeError)
      return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
    }

    const readTimesData = (readTimes as Array<{ read_time: number | null }> | null) ?? []
    const totalReadTime: number = readTimesData.reduce((sum: number, post: { read_time: number | null }) => sum + (post.read_time ?? 0), 0)
    const averageReadTime: number = readTimesData.length > 0 ? Math.round(totalReadTime / readTimesData.length) : 0

    // Get total unique keywords
    const { data: allPosts, error: keywordsError } = await supabase
      .from('blog_posts')
      .select('keywords')
      .eq('status', 'published')

    if (keywordsError) {
      console.error('Error getting keywords:', keywordsError)
      return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
    }

    const allPostsData = (allPosts as Array<{ keywords: string[] | null }> | null) ?? []
    const allKeywords: string[] = allPostsData.flatMap((post) => post.keywords ?? [])
    // De-duplicate without using Set to avoid downlevelIteration issues
    const uniqueKeywords: string[] = allKeywords.filter((kw, idx, arr) => arr.indexOf(kw) === idx)

    const stats = {
      totalPosts: totalPosts?.length || 0,
      publishedPosts: publishedPosts?.length || 0,
      draftPosts: draftPosts?.length || 0,
      thisWeekPosts: thisWeekPosts?.length || 0,
      averageReadTime,
      totalKeywords: uniqueKeywords.length
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in blog stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
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

    const averageReadTime = readTimes && readTimes.length > 0 
      ? Math.round(readTimes.reduce((sum, post) => sum + (post.read_time || 0), 0) / readTimes.length)
      : 0

    // Get total unique keywords
    const { data: allPosts, error: keywordsError } = await supabase
      .from('blog_posts')
      .select('keywords')
      .eq('status', 'published')

    if (keywordsError) {
      console.error('Error getting keywords:', keywordsError)
      return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
    }

    const allKeywords = allPosts?.flatMap(post => post.keywords || []) || []
    const uniqueKeywords = [...new Set(allKeywords)]

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
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Blog post templates with target keywords
const blogTemplates = [
  {
    title: "5 Gen Z Study Hacks That Actually Work",
    keywords: ["gen z", "study hacks", "best study methods", "college", "study tools"],
    outline: [
      "Introduction to Gen Z study challenges",
      "Hack 1: TikTok-style learning techniques",
      "Hack 2: Micro-study sessions",
      "Hack 3: Visual learning methods",
      "Hack 4: Social learning approaches",
      "Hack 5: Technology integration",
      "How FYPQuiz implements these hacks"
    ]
  },
  {
    title: "Why TikTok-Style Quizzes Help You Remember More",
    keywords: ["tiktok-style quizzes", "memory retention", "study methods", "quiz apps for studying"],
    outline: [
      "The science behind memory retention",
      "Why traditional study methods fail",
      "How TikTok-style learning works",
      "The psychology of short-form content",
      "Real-world examples and case studies",
      "How to create effective TikTok-style quizzes",
      "FYPQuiz's approach to engaging learning"
    ]
  },
  {
    title: "Best Study Tools for High School & College in 2025",
    keywords: ["best study tools", "high school", "college", "study apps", "2025"],
    outline: [
      "The evolution of study tools",
      "Digital vs traditional study methods",
      "Top study apps comparison",
      "AI-powered learning tools",
      "Personalized study approaches",
      "Future of education technology",
      "Why FYPQuiz leads the pack"
    ]
  },
  {
    title: "How to Study for Exams: A Complete Guide for Students",
    keywords: ["how to study for exams", "study methods", "exam preparation", "best study apps"],
    outline: [
      "Understanding your learning style",
      "Creating effective study schedules",
      "Active vs passive learning techniques",
      "Memory techniques and mnemonics",
      "Technology-enhanced study methods",
      "Managing exam stress and anxiety",
      "Tools and apps for exam success"
    ]
  },
  {
    title: "Gen Z vs Millennials: Different Study Approaches That Work",
    keywords: ["gen z", "millennials", "study approaches", "generation differences", "learning styles"],
    outline: [
      "Understanding generational learning differences",
      "Millennial study habits and preferences",
      "Gen Z study habits and preferences",
      "Technology's role in learning evolution",
      "Adapting study methods for different generations",
      "Bridging the generational learning gap",
      "Universal study principles that work for all"
    ]
  }
]

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(' ').length
  return Math.ceil(wordCount / wordsPerMinute)
}

export async function POST() {
  try {
    // Select a random template
    const template = blogTemplates[Math.floor(Math.random() * blogTemplates.length)]
    
    // Generate the blog post using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert content writer specializing in education and study methods. Write engaging, SEO-optimized blog posts that are informative, entertaining, and naturally incorporate target keywords. 

Requirements:
- Write 800-2000 words
- Use the provided outline structure
- Naturally incorporate target keywords throughout
- Write in a conversational, Gen Z-friendly tone
- Include practical tips and actionable advice
- Add a call-to-action mentioning FYPQuiz naturally
- Use proper HTML formatting with <h2>, <h3>, <p>, <ul>, <li> tags
- Make it engaging and shareable on social media

Target keywords: ${template.keywords.join(', ')}`
        },
        {
          role: "user",
          content: `Write a comprehensive blog post titled "${template.title}" following this outline:

${template.outline.map((point, index) => `${index + 1}. ${point}`).join('\n')}

Make sure to:
- Naturally include the target keywords throughout
- Write engaging, informative content
- Include practical examples and tips
- Mention FYPQuiz as a solution in relevant sections
- Use proper HTML formatting
- Keep it conversational and Gen Z-friendly`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content || ''
    
    if (!content) {
      throw new Error('Failed to generate content')
    }

    // Extract excerpt (first 150 characters)
    const excerpt = content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
    
    // Calculate read time
    const readTime = calculateReadTime(content)
    
    // Generate slug
    const slug = generateSlug(template.title)
    
    // Create blog post object
    const blogPost = {
      title: template.title,
      slug,
      excerpt,
      content,
      keywords: template.keywords,
      read_time: readTime,
      status: 'published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Save to database
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogPost])
      .select()
      .single()

    if (error) {
      console.error('Error saving blog post:', error)
      return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      post: data,
      message: 'Blog post generated and published successfully'
    })

  } catch (error) {
    console.error('Error generating blog post:', error)
    return NextResponse.json({ error: 'Failed to generate post' }, { status: 500 })
  }
} 
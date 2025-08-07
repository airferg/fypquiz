import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { config } from '../../../lib/config'

if (!config.openai.apiKey) {
  throw new Error('OPEN_AI_API_KEY environment variable is not set')
}

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
})

// Helper function to create a timeout promise
const createTimeout = (ms: number) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Request timeout')), ms)
)

export async function POST(request: NextRequest) {
  try {
    const { content, fileName, questionCount = 10 } = await request.json()

    if (!content || !fileName) {
      return NextResponse.json(
        { error: 'Content and fileName are required' },
        { status: 400 }
      )
    }

    // Validate question count
    const validatedQuestionCount = Math.max(5, Math.min(50, parseInt(questionCount) || 10))

    // Validate content length
    if (content.length < 50) {
      return NextResponse.json(
        { error: 'Content is too short to generate meaningful questions' },
        { status: 400 }
      )
    }

    // Check if content appears to be garbled (lots of special characters)
    const readableChars = content.replace(/[^a-zA-Z0-9\s]/g, '').length
    const totalChars = content.length
    const readabilityRatio = readableChars / totalChars

    console.log('Generating quiz for file:', fileName)
    console.log('Content length:', content.length)
    console.log('Readability ratio:', readabilityRatio.toFixed(2))
    console.log('Requested question count:', validatedQuestionCount)

    // If content is mostly unreadable, provide a helpful error
    if (readabilityRatio < 0.3) {
      return NextResponse.json(
        { 
          error: 'The uploaded file appears to be image-based or encrypted. Please try uploading a text-based PDF or convert your file to text format first.' 
        },
        { status: 400 }
      )
    }

    // Truncate content to improve speed (keep first 2000 characters)
    const truncatedContent = content.length > 2000 ? content.substring(0, 2000) + '...' : content

    // Generate quiz using OpenAI with timeout
    const completionPromise = openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate exactly ${validatedQuestionCount} multiple choice questions based on the provided content. Each question should have 4 choices (A, B, C, D) with one correct answer. Make questions specific to the content, not generic. Return as JSON:
{
  "title": "Quiz title",
  "questions": [
    {
      "question": "Question text",
      "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
      "correctIndex": 0,
      "voiceScript": "Brief engaging commentary"
    }
  ]
}`
        },
        {
          role: "user",
          content: `Content: ${truncatedContent}`
        }
      ],
      temperature: 0.7,
      max_tokens: Math.min(2000, validatedQuestionCount * 150), // Reduced tokens for speed
    })

    // Add 60-second timeout
    const completion = await Promise.race([
      completionPromise,
      createTimeout(60000) // 60 seconds timeout
    ]) as OpenAI.Chat.Completions.ChatCompletion

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    console.log('OpenAI response length:', responseText.length)

    // Clean the response text to remove markdown code blocks
    let cleanedResponse = responseText.trim()
    
    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '')
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '')
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/\s*```$/, '')
    }

    // Parse the JSON response
    let quizData
    try {
      quizData = JSON.parse(cleanedResponse)
      
      // Validate the quiz data
      if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        throw new Error('Invalid quiz structure')
      }
      
      // Ensure we have the right number of questions
      if (quizData.questions.length !== validatedQuestionCount) {
        // Truncate or extend to match requested count
        if (quizData.questions.length > validatedQuestionCount) {
          quizData.questions = quizData.questions.slice(0, validatedQuestionCount)
        } else {
          // Add generic questions if we don't have enough
          const missingCount = validatedQuestionCount - quizData.questions.length
          for (let i = 0; i < missingCount; i++) {
            quizData.questions.push({
              question: `What is the main topic of this content?`,
              choices: ["The uploaded content", "A different topic", "Something unrelated", "I'm not sure"],
              correctIndex: 0,
              voiceScript: "Let's see what you remember from the content!"
            })
          }
        }
      }
      
      // Randomize the position of correct answers
      quizData.questions = quizData.questions.map((question: any) => {
        const { choices, correctIndex, ...rest } = question
        const correctAnswer = choices[correctIndex]
        
        // Create new array with all choices except the correct one
        const otherChoices = choices.filter((_: any, index: number) => index !== correctIndex)
        
        // Generate random position for correct answer
        const newCorrectIndex = Math.floor(Math.random() * 4)
        
        // Create new choices array with correct answer at random position
        const newChoices = [...otherChoices]
        newChoices.splice(newCorrectIndex, 0, correctAnswer)
        
        return {
          ...rest,
          choices: newChoices,
          correctIndex: newCorrectIndex
        }
      })
      
      console.log('Successfully generated quiz with', quizData.questions.length, 'questions')
      
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error)
      
      // Create a simple fallback quiz
      quizData = {
        title: `Quiz: ${fileName}`,
        questions: Array.from({ length: validatedQuestionCount }, (_, i) => ({
          question: `Question ${i + 1}: What is the main topic of your uploaded content?`,
          choices: ["The content you uploaded", "A different topic", "Something unrelated", "I'm not sure"],
          correctIndex: 0,
          voiceScript: "Let's test your knowledge!"
        }))
      }
      
      console.log('Using fallback quiz due to parsing error')
    }

    return NextResponse.json(quizData)
  } catch (error) {
    console.error('Error generating quiz:', error)
    
    // Check if it's a timeout error
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Quiz generation timed out. Please try again with a shorter document.' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
} 
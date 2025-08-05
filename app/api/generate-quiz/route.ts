import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { config } from '../../../lib/config'

if (!config.openai.apiKey) {
  throw new Error('OPEN_AI_API_KEY environment variable is not set')
}

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
})

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
    console.log('Content preview:', content.substring(0, 500) + '...')
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

    // Generate quiz using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional quiz generator that creates challenging educational content with engaging voice commentary.

CRITICAL: You MUST generate EXACTLY ${validatedQuestionCount} questions that are DIRECTLY about the specific content provided. Do NOT create generic questions about uploading files or general topics.

Your task:
1. Read and analyze the provided content carefully
2. Identify specific facts, concepts, definitions, and details from the content
3. Create EXACTLY ${validatedQuestionCount} multiple choice questions that test understanding of the ACTUAL content provided
4. Each question should have 4 choices (A, B, C, D) with one correct answer
5. Include engaging, educational commentary in the voiceScript field that introduces the question or provides context

RULES FOR ANSWER CHOICES:
- All answer choices must be plausible and related to the topic
- No joke answers or irrelevant options
- Make the incorrect choices challenging and realistic
- Use similar concepts, related terms, or common misconceptions as distractors
- Ensure the correct answer is not obviously correct

EXAMPLE: If the content mentions "Common Stock represents ownership in a corporation", create a question like:
"What does Common Stock represent?"
Choices: ["Ownership in a corporation", "A type of bond", "A mutual fund", "A savings account"]
Correct: 0

EXAMPLE: If the content mentions "Market risk is a primary concern for stock investors", create a question like:
"What is the primary risk concern for stock investors?"
Choices: ["Market risk", "Interest rate risk", "Liquidity risk", "Credit risk"]
Correct: 0

IMPORTANT: You MUST return EXACTLY ${validatedQuestionCount} questions, no more, no less.

Return the response as a JSON object with this exact structure:
{
  "title": "Quiz title based on the actual content",
  "questions": [
    {
      "question": "Specific question about the topic (do not mention 'content' or 'material')",
      "choices": ["Plausible choice A", "Plausible choice B", "Plausible choice C", "Plausible choice D"],
      "correctIndex": 0,
      "voiceScript": "Engaging commentary that introduces the question or provides educational context"
    }
  ]
}`
        },
        {
          role: "user",
          content: `Generate EXACTLY ${validatedQuestionCount} quiz questions based on this content: ${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: Math.max(4000, validatedQuestionCount * 250), // Increase tokens for more questions
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    console.log('OpenAI response length:', responseText.length)
    console.log('OpenAI response preview:', responseText.substring(0, 500) + '...')

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
    
    console.log('Cleaned response preview:', cleanedResponse.substring(0, 500) + '...')

    // Parse the JSON response
    let quizData
    try {
      quizData = JSON.parse(cleanedResponse)
      
      // Validate the quiz data
      if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        throw new Error('Invalid quiz structure')
      }
      
      // Check if we got the exact number of questions requested
      if (quizData.questions.length !== validatedQuestionCount) {
        console.warn(`Warning: Got ${quizData.questions.length} questions but requested ${validatedQuestionCount}`)
        
        // If we got fewer questions, try to generate more
        if (quizData.questions.length < validatedQuestionCount) {
          const missingCount = validatedQuestionCount - quizData.questions.length
          console.log(`Attempting to generate ${missingCount} more questions...`)
          
          // Try to generate additional questions
          const additionalCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `Generate EXACTLY ${missingCount} additional quiz questions based on the same content. Make sure they are different from the existing questions.`
              },
              {
                role: "user",
                content: `Generate ${missingCount} more questions based on this content: ${content}`
              }
            ],
            temperature: 0.7,
            max_tokens: missingCount * 250,
          })
          
          const additionalResponse = additionalCompletion.choices[0]?.message?.content
          if (additionalResponse) {
            let additionalCleaned = additionalResponse.trim()
            if (additionalCleaned.startsWith('```json')) {
              additionalCleaned = additionalCleaned.replace(/^```json\s*/, '')
            }
            if (additionalCleaned.startsWith('```')) {
              additionalCleaned = additionalCleaned.replace(/^```\s*/, '')
            }
            if (additionalCleaned.endsWith('```')) {
              additionalCleaned = additionalCleaned.replace(/\s*```$/, '')
            }
            
            try {
              const additionalData = JSON.parse(additionalCleaned)
              if (additionalData.questions && Array.isArray(additionalData.questions)) {
                quizData.questions = [...quizData.questions, ...additionalData.questions]
                console.log(`Added ${additionalData.questions.length} additional questions`)
              }
            } catch (additionalError) {
              console.error('Failed to parse additional questions:', additionalError)
            }
          }
        }
        
        // If we still don't have enough questions, truncate to the requested number
        if (quizData.questions.length > validatedQuestionCount) {
          quizData.questions = quizData.questions.slice(0, validatedQuestionCount)
          console.log(`Truncated to ${validatedQuestionCount} questions`)
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
        
        console.log(`Question: ${question.question.substring(0, 50)}...`)
        console.log(`Original correct index: ${correctIndex}, New correct index: ${newCorrectIndex}`)
        console.log(`Original choices: ${choices.join(' | ')}`)
        console.log(`New choices: ${newChoices.join(' | ')}`)
        
        return {
          ...rest,
          choices: newChoices,
          correctIndex: newCorrectIndex
        }
      })
      
      console.log('Successfully parsed OpenAI response!')
      console.log('Quiz title:', quizData.title)
      console.log('Final number of questions:', quizData.questions.length)
      console.log('First question:', quizData.questions[0]?.question)
      
      // Log all questions to verify they're content-specific
      quizData.questions.forEach((q: any, index: number) => {
        console.log(`Question ${index + 1}:`, q.question)
        console.log(`Correct answer position: ${q.correctIndex}`)
      })
      
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error)
      console.error('Raw response:', responseText)
      console.error('Cleaned response:', cleanedResponse)
      
      // Create a better fallback quiz that's more specific to the content
      const contentWords = content.split(/\s+/).slice(0, 20).join(' ') // Get first 20 words
      quizData = {
        title: `Quiz: ${fileName}`,
        questions: [
          {
            question: `What is the main topic discussed in your uploaded content about "${contentWords.substring(0, 50)}..."?`,
            choices: ["The content you uploaded", "A different topic", "Something unrelated", "I'm not sure"],
            correctIndex: 0,
            voiceScript: "Alright, listen up you absolute legend! This is where the magic happens. Don't mess this up, or I'll personally come to your house and... actually, that sounds like a lot of work. Just pick the right answer, okay?"
          },
          {
            question: "Based on your uploaded content, what type of information is being presented?",
            choices: ["Educational material", "Fictional story", "News article", "Personal diary"],
            correctIndex: 0,
            voiceScript: "Oh boy, this is a tough one! I mean, not really, but let's pretend it is. You got this, champ! Unless you don't, then... well, that's awkward."
          },
          {
            question: "What should you do when you're not sure about an answer?",
            choices: ["Panic", "Guess randomly", "Think carefully", "Ask for help"],
            correctIndex: 2,
            voiceScript: "Listen, I know this might be stressful, but don't panic! Unless you want to, then go ahead. I'm not your mom. But seriously, just think about it for a second."
          },
          {
            question: "What's the best way to study?",
            choices: ["Cram the night before", "Study regularly", "Wing it", "Ask your cat"],
            correctIndex: 1,
            voiceScript: "Oh man, this is like asking me what's the best way to eat a sandwich. The answer is obvious, but somehow people still get it wrong. Come on, you know this!"
          },
          {
            question: "What happens when you complete this quiz?",
            choices: ["Nothing", "You get a certificate", "You become smarter", "You unlock a secret level"],
            correctIndex: 2,
            voiceScript: "And here we are, the grand finale! This is it, folks. The moment of truth. Don't let me down now. Actually, do whatever you want, I'm just a voice in your head."
          }
        ]
      }
      
      console.log('Using fallback quiz due to parsing error')
    }

    return NextResponse.json(quizData)
  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
} 
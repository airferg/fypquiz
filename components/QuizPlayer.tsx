'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import QuestionCard from './QuestionCard'
import BackgroundVideo from './BackgroundVideo'
import UsageMonitor from './UsageMonitor'

// Extend Window interface to include our global variable
declare global {
  interface Window {
    quizAudioFiles?: { [key: string]: string }
  }
}

interface Question {
  question: string
  choices: string[]
  correctIndex: number
  voiceScript: string
}

interface QuizPlayerProps {
  questions: Question[]
  backgroundVideo: string
  selectedVoice: string
  onQuizComplete: (score: number, total: number) => void
  studySetId?: string // Optional ID for saving audio files
}

export default function QuizPlayer({ questions, backgroundVideo, selectedVoice, onQuizComplete }: QuizPlayerProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [answeredCurrentQuestion, setAnsweredCurrentQuestion] = useState(false)
  const [currentQuestionCorrect, setCurrentQuestionCorrect] = useState(false)
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [savedAudioFiles, setSavedAudioFiles] = useState<{ [key: string]: string }>({})
  const [characterUsage, setCharacterUsage] = useState(0)
  const scoreRef = useRef(0)
  const lastPlayedQuestionRef = useRef(-1)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleCancelQuiz = () => {
    if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
      router.push('/dashboard')
    }
  }

  const saveAudioFile = async (audioBlob: Blob, fileName: string): Promise<string> => {
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      
      // Save to our API
      const response = await fetch('/api/save-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBlob: base64,
          fileName: fileName,
          studySetId: `temp-${Date.now()}`, // We'll update this when the study set is saved
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.audioUrl
      } else {
        console.warn('Failed to save audio file:', fileName)
        return ''
      }
    } catch (error) {
      console.error('Error saving audio file:', error)
      return ''
    }
  }

  useEffect(() => {
    // Generate individual audio for each question (more reliable than batch)
    const generateQuestionAudio = async () => {
      try {
        console.log('🔄 Generating individual question audio...');
        
        const newAudioUrls: string[] = [];
        
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          console.log(`🎤 Generating audio for question ${i + 1}/${questions.length}`);
          
          // Create question text - just the question, not "Question X:"
          const questionText = question.question;
          
          // Generate question audio
          const questionResponse = await fetch('/api/generate-voice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: questionText,
              voiceId: selectedVoice,
            }),
          });

          if (questionResponse.ok) {
            const questionAudioBlob = await questionResponse.blob();
            const questionAudioUrl = URL.createObjectURL(questionAudioBlob);
            newAudioUrls.push(questionAudioUrl);
            console.log(`✅ Question audio generated for question ${i + 1}`);
          } else {
            console.warn(`❌ Failed to generate question audio for question ${i + 1}`);
            newAudioUrls.push('');
          }
        }
        
        setAudioUrls(newAudioUrls);
        setIsLoading(false);
        console.log('🎉 All question audio generated!');
      } catch (error) {
        console.error('❌ Error generating audio:', error);
        setIsLoading(false);
      }
    };

    // Check for saved audio files first
    const savedAudioFilesStr = sessionStorage.getItem('savedAudioFiles')
    const savedAudioFiles = savedAudioFilesStr ? JSON.parse(savedAudioFilesStr) : {}
    
    if (Object.keys(savedAudioFiles).length > 0) {
      // Use saved audio files
      console.log('Using saved audio files:', savedAudioFiles)
      setSavedAudioFiles(savedAudioFiles)
      
      // Convert saved URLs to local URLs for playback
      const audioUrls = questions.map((_, index) => {
        const savedUrl = savedAudioFiles[`question-${index + 1}`]
        return savedUrl || ''
      }).filter(url => url !== '')
      
      setAudioUrls(audioUrls)
      setIsLoading(false)
      return
    }

    // Generate new audio
    generateQuestionAudio();
  }, [questions, selectedVoice])

  useEffect(() => {
    if (isLoading || audioUrls.length === 0) return

    // Only play audio if we haven't already played it for this question
    if (lastPlayedQuestionRef.current !== currentQuestionIndex && 
        audioUrls[currentQuestionIndex] && 
        audioUrls[currentQuestionIndex] !== '') {
      console.log(`🎵 Playing QUESTION audio for question ${currentQuestionIndex + 1} - QUESTION CHANGED`);
      const audio = new Audio(audioUrls[currentQuestionIndex]);
      audio.play().catch(console.error);
      lastPlayedQuestionRef.current = currentQuestionIndex;
    }
    
    // Reset answered state for new question
    setAnsweredCurrentQuestion(false)
    setCurrentQuestionCorrect(false)
  }, [currentQuestionIndex, isLoading, audioUrls])

  const handleAnswer = async (isCorrect: boolean) => {
    console.log('=== handleAnswer called ===')
    console.log(`isCorrect: ${isCorrect}`)
    console.log(`answeredCurrentQuestion: ${answeredCurrentQuestion}`)
    console.log(`Current question index: ${currentQuestionIndex}`)
    console.log(`Is last question: ${currentQuestionIndex === questions.length - 1}`)
    
    if (answeredCurrentQuestion) {
      console.log('Already answered, returning early')
      return // Prevent multiple answers
    }
    
    console.log(`Question ${currentQuestionIndex + 1}: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`)
    console.log(`Previous score: ${score}, Current question correct: ${isCorrect}`)
    console.log(`Total questions: ${questions.length}, Current question index: ${currentQuestionIndex}`)
    
    setAnsweredCurrentQuestion(true)
    setCurrentQuestionCorrect(isCorrect)
    if (isCorrect) {
      const newScore = score + 1
      scoreRef.current = newScore
      setScore(newScore)
      console.log(`Score updated: ${score} -> ${newScore}`)
    }
  }

  const handleNext = () => {
    console.log(`Moving to next question: ${currentQuestionIndex + 1} -> ${currentQuestionIndex + 2}`)
    console.log(`Resetting state for next question`)
    setCurrentQuestionIndex(currentQuestionIndex + 1)
    setAnsweredCurrentQuestion(false)
    setCurrentQuestionCorrect(false)
  }

  const handleFinishQuiz = () => {
    // For the last question, we need to include its score
    // The scoreRef should already include all previous questions
    // We just need to add 1 if the last question was correct
    const finalScore = currentQuestionCorrect ? scoreRef.current + 1 : scoreRef.current
    console.log('=== QUIZ COMPLETED ===')
    console.log('Current question index:', currentQuestionIndex)
    console.log('Current question correct:', currentQuestionCorrect)
    console.log('Current score (state):', score)
    console.log('Current score (ref):', scoreRef.current)
    console.log('Final score:', finalScore, 'out of', questions.length)
    console.log('Total questions:', questions.length)
    console.log('Expected perfect score:', questions.length)
    console.log('Score calculation:', `${finalScore}/${questions.length} = ${Math.round((finalScore / questions.length) * 100)}%`)
    console.log('Is this the last question?', currentQuestionIndex === questions.length - 1)
    onQuizComplete(finalScore, questions.length)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Generating AI voices for your quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <UsageMonitor characterUsage={characterUsage} />
      <div className="max-w-md mx-auto relative h-screen">
        {/* Background Video - Phone Frame */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-192 bg-black rounded-2xl overflow-hidden shadow-2xl">
            <video
              src={backgroundVideo}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Video overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="max-w-md mx-auto">
            <div className="bg-white/20 backdrop-blur-sm p-2 mx-4 mt-4 rounded-lg">
              <div className="flex justify-between items-center text-white text-sm">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                <div 
                  className="bg-accent h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={handleCancelQuiz}
            className="p-2 bg-red-500/80 hover:bg-red-600/80 rounded-full transition-colors cursor-pointer"
            title="Exit Quiz"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Question Content - TikTok Style */}
        <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
          <div className="w-full max-w-xs">
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onFinishQuiz={handleFinishQuiz}
              isLastQuestion={isLastQuestion}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface Question {
  question: string
  choices: string[]
  correctIndex: number
  voiceScript: string
}

interface QuestionCardProps {
  question: Question
  onAnswer: (isCorrect: boolean) => void
  onNext: () => void
  onFinishQuiz: () => void
  isLastQuestion: boolean
}

export default function QuestionCard({ question, onAnswer, onNext, onFinishQuiz, isLastQuestion }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null)
    setShowFeedback(false)
    setIsCorrect(false)
    setHasAnswered(false)
  }, [question.question]) // Reset when question text changes

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return // Prevent multiple selections
    
    setSelectedAnswer(index)
    const correct = index === question.correctIndex
    setIsCorrect(correct)
    setShowFeedback(true)
    setHasAnswered(true)
    
    // Call onAnswer immediately - QuizPlayer will handle the auto-advance
    onAnswer(correct)
  }

  // QuizPlayer now handles all navigation logic

  const getFeedbackMessage = () => {
    if (isCorrect) {
      const positiveMessages = [
        "Nice work!",
        "You got it!",
        "That's correct!",
        "Well done!",
        "Good job!",
        "You're on fire!",
        "Excellent!",
        "Perfect!",
        "You nailed it!",
        "That's right!"
      ];
      const randomMessage = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
      
      return {
        message: randomMessage,
        icon: <CheckCircle className="h-6 w-6 text-green-400" />,
        className: "bg-green-500/20 border-green-400/60 text-white backdrop-blur-md"
      }
    } else {
      const negativeMessages = [
        "Not quite right",
        "Try again!",
        "That's not it",
        "Keep trying!",
        "Almost there!",
        "Don't give up!",
        "You're close!",
        "Think about it",
        "Give it another shot!",
        "You'll get it next time!"
      ];
      const randomMessage = negativeMessages[Math.floor(Math.random() * negativeMessages.length)];
      
      return {
        message: randomMessage,
        icon: <XCircle className="h-6 w-6 text-red-400" />,
        className: "bg-red-500/20 border-red-400/60 text-white backdrop-blur-md"
      }
    }
  }

  const feedback = getFeedbackMessage()

  return (
    <div className="w-full">
      <div className="bg-transparent backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white text-center flex-1">
              {question.question}
            </h2>
          </div>
          
          <div className="space-y-3">
            {question.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={`
                  w-full p-4 text-left rounded-xl border-2 transition-all duration-300
                  ${selectedAnswer === null
                    ? 'border-white/40 bg-white/20 backdrop-blur-md hover:bg-white/30 hover:border-white/60 text-white shadow-lg hover:shadow-xl'
                    : selectedAnswer === index
                    ? index === question.correctIndex
                      ? 'border-green-400 bg-green-500/20 backdrop-blur-md text-white shadow-lg'
                      : 'border-red-400 bg-red-500/20 backdrop-blur-md text-white shadow-lg'
                    : selectedAnswer !== null && index === question.correctIndex
                    ? 'border-green-400 bg-green-500/20 backdrop-blur-md text-white shadow-lg'
                    : 'border-white/30 bg-white/20 backdrop-blur-md text-white/80'
                  }
                  ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <span className="font-medium">
                  {String.fromCharCode(65 + index)}. {choice}
                </span>
              </button>
            ))}
          </div>
        </div>

        {showFeedback && (
          <div
            className={`p-4 rounded-xl border backdrop-blur-sm shadow-lg ${feedback.className} mb-4`}
          >
            <div className="flex items-center space-x-3">
              {feedback.icon}
              <span className="font-medium">{feedback.message}</span>
            </div>
          </div>
        )}

        {/* Next Question Button */}
        {showFeedback && (
          <div className="flex justify-center">
            <button
              onClick={isLastQuestion ? onFinishQuiz : onNext}
              className="px-8 py-3 bg-[#5CA4F6] text-white rounded-xl hover:bg-[#4A90E2] transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-lg"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 
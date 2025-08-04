'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react'

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
    
    // Auto-advance after showing feedback
    setTimeout(() => {
      if (hasAnswered) {
        advanceToNext()
      }
    }, 2000)
  }

  const advanceToNext = () => {
    console.log('=== advanceToNext called ===')
    console.log('isLastQuestion:', isLastQuestion)
    console.log('isCorrect:', isCorrect)
    console.log('Calling onAnswer with:', isCorrect)
    onAnswer(isCorrect)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setHasAnswered(false)
    
    if (isLastQuestion) {
      console.log('Last question - finishing quiz')
      onFinishQuiz()
    } else {
      console.log('Not last question - going to next')
      onNext()
    }
  }

  const handleManualNext = () => {
    console.log('Manual next clicked. hasAnswered:', hasAnswered, 'isLastQuestion:', isLastQuestion)
    if (hasAnswered) {
      advanceToNext()
    } else {
      console.log('Cannot advance - user has not answered yet')
    }
  }

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
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        className: "bg-green-50 border-green-200 text-green-800"
      }
    } else {
      const negativeMessages = [
        "Not quite right",
        "Try again",
        "That's not it",
        "Keep trying",
        "Wrong answer",
        "Not this time",
        "Incorrect",
        "That's not correct",
        "Try another option",
        "Wrong choice"
      ];
      const randomMessage = negativeMessages[Math.floor(Math.random() * negativeMessages.length)];
      
      return {
        message: randomMessage,
        icon: <XCircle className="h-6 w-6 text-red-500" />,
        className: "bg-red-50 border-red-200 text-red-800"
      }
    }
  }

  const feedback = getFeedbackMessage()

  return (
    <div className="w-full">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
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
                  w-full p-4 text-left rounded-xl border-2 transition-all
                  ${selectedAnswer === null
                    ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white'
                    : selectedAnswer === index
                    ? index === question.correctIndex
                      ? 'border-green-400 bg-green-500/20 text-white'
                      : 'border-red-400 bg-red-500/20 text-white'
                    : selectedAnswer !== null && index === question.correctIndex
                    ? 'border-green-400 bg-green-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-white/70'
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
          <div className={`mt-6 p-4 rounded-xl border ${isCorrect ? 'border-green-400 bg-green-500/20' : 'border-red-400 bg-red-500/20'}`}>
            <div className="flex items-center justify-center space-x-3">
              {feedback.icon}
              <span className="font-semibold text-white">{feedback.message}</span>
            </div>
          </div>
        )}

        {showFeedback && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleManualNext}
              className="flex items-center space-x-2 bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-accent/90 transition-all"
            >
              <span>{isLastQuestion ? 'Finish Quiz' : 'Next Question'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 
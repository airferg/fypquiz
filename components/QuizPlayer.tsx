'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import QuestionCard from './QuestionCard'
import BackgroundVideo from './BackgroundVideo'
import UsageMonitor from './UsageMonitor'
import { supabase } from '@/lib/supabase'

// Score Improvement Component
function ScoreImprovement({ currentScore, previousScore }: { currentScore: number, previousScore?: number }) {
  console.log('ScoreImprovement component:', { currentScore, previousScore })

  if (!previousScore) {
    console.log('No previous score to compare')
    return null // No previous score to compare
  }

  const scoreDifference = currentScore - previousScore
  const isImprovement = scoreDifference > 0
  const isSame = scoreDifference === 0
  
  console.log('Score comparison:', {
    currentScore,
    previousScore,
    scoreDifference,
    isImprovement,
    isSame
  })

  if (isSame) {
    return (
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30">
        <div className="text-sm text-white/80">
          Same score as last attempt! Keep practicing! 🎯
        </div>
      </div>
    )
  }

  return (
    <div className={`backdrop-blur-md rounded-xl p-3 border ${
      isImprovement 
        ? 'bg-green-500/20 border-green-400/30' 
        : 'bg-orange-500/20 border-orange-400/30'
    }`}>
      <div className={`text-sm font-medium ${
        isImprovement ? 'text-green-200' : 'text-orange-200'
      }`}>
        {isImprovement ? '📈 Improvement!' : '📉 Score Decreased'}
      </div>
      <div className="text-xs text-white/70 mt-1">
        {isImprovement ? 'Increased' : 'Decreased'} by {Math.abs(scoreDifference)}%
      </div>
      <div className="text-xs text-white/50 mt-1">
        Previous: {previousScore}% → Current: {currentScore}%
      </div>
    </div>
  )
}

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
  quizTitle?: string
  onQuizComplete: (score: number, total: number) => void
  studySetId?: string // Optional ID for saving audio files
  previousScore?: number // Previous score for comparison
}

export default function QuizPlayer({ questions, backgroundVideo, selectedVoice, quizTitle, onQuizComplete, studySetId, previousScore }: QuizPlayerProps) {

  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [answeredCurrentQuestion, setAnsweredCurrentQuestion] = useState(false)
  const [currentQuestionCorrect, setCurrentQuestionCorrect] = useState(false)
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [savedAudioFiles, setSavedAudioFiles] = useState<{ [key: string]: string }>({})
  const [characterUsage, setCharacterUsage] = useState(0)
  const [audioProgress, setAudioProgress] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [subtitleProgress, setSubtitleProgress] = useState(0)
  const [currentSubtitle, setCurrentSubtitle] = useState('')
  const [visibleWords, setVisibleWords] = useState<string[]>([])
  const [hasGeneratedAudio, setHasGeneratedAudio] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const scoreRef = useRef(0)
  const lastPlayedQuestionRef = useRef(-1)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  // Play audio for current question with real-time subtitles
  const playQuestionAudio = () => {
    // Check if we have dummy audio (fallback mode)
    if (audioUrls[currentQuestionIndex] === 'dummy-audio') {
      setShowAnswers(true)
      return;
    }
    
    if (audioUrls[currentQuestionIndex] && !isPlayingAudio) {
      const audio = new Audio(audioUrls[currentQuestionIndex])
      
      // Reset subtitle state
      setSubtitleProgress(0)
      setCurrentSubtitle('')
      setVisibleWords([])
      
      // Split question into words for animation
      const words = currentQuestion.question.split(' ')
      const totalWords = words.length
      const audioDuration = Math.max(2, totalWords * 0.3) // More realistic timing: 0.3s per word, minimum 2s

      const wordInterval = audioDuration / totalWords
      
      audio.addEventListener('play', () => {
        setIsPlayingAudio(true)
        setShowAnswers(false)
        setCurrentSubtitle(currentQuestion.question)
        
        // Start word-by-word animation
        let currentWordIndex = 0
        const wordTimer = setInterval(() => {
          if (currentWordIndex < totalWords) {
            setVisibleWords(words.slice(0, currentWordIndex + 1))
            currentWordIndex++
          } else {
            clearInterval(wordTimer)
          }
        }, wordInterval * 1000)
        
        // Store timer reference for cleanup
        ;(audio as any).wordTimer = wordTimer
      })

      audio.addEventListener('ended', () => {
        setIsPlayingAudio(false)
        setShowAnswers(true)
        setCurrentSubtitle('')
        setVisibleWords([])
        
        // Clean up word timer
        if ((audio as any).wordTimer) {
          clearInterval((audio as any).wordTimer)
        }
      })

      audio.addEventListener('error', (e) => {
        setIsPlayingAudio(false)
        setShowAnswers(true)
      })

      // Store current audio for cleanup
      setCurrentAudio(audio)
      
      // Start playing
      audio.play().catch(error => {
        setIsPlayingAudio(false)
        setShowAnswers(true)
      })
    } else {
      setShowAnswers(true)
    }
  }

  // Stop current audio and clean up
  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      
      // Clean up word timer
      if ((currentAudio as any).wordTimer) {
        clearInterval((currentAudio as any).wordTimer)
      }
      
      setCurrentAudio(null)
    }
    setIsPlayingAudio(false)
  }

  // Generate voice audio for all questions
  const generateVoiceAudio = async () => {
    console.log('🔄 generateVoiceAudio called')
    if (!questions || questions.length === 0) {
      console.log('❌ No questions to generate audio for')
      return;
    }

    console.log('🔄 Setting loading state and starting audio generation...')
    setIsLoading(true)
    setAudioProgress(0)

    try {
      // Prepare questions array for batch processing
      const questionsForBatch = questions.map((question, index) => ({
        text: question.question,
        index: index
      }))

      const response = await fetch('/api/generate-voice-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: questionsForBatch,
          voiceId: selectedVoice
        })
      })

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check if it's a quota exceeded error
        if (errorText.includes('quota_exceeded')) {
          throw new Error('QUOTA_EXCEEDED');
        } else {
          throw new Error(`HTTP error! status: ${response.status}: ${errorText}`);
        }
      }

      const result = await response.json()
      
      if (result.success && result.combinedAudio) {
        // We got one combined audio file, need to create individual segments
        
        // For now, we'll use the same audio for all questions
        // In a more sophisticated implementation, we could split the audio by timing
        const urls = questions.map(() => `data:audio/mpeg;base64,${result.audio}`)
        
        setAudioUrls(urls)
        setHasGeneratedAudio(true)
        setIsLoading(false)
        
        // Update progress to show completion
        setAudioProgress(questions.length)
        
        // Auto-play first question
        setTimeout(() => {
          playQuestionAudio()
        }, 500)
      } else {
        throw new Error('Batch generation failed');
      }
      
    } catch (error) {
      // Check if it's a quota exceeded error
      if (error instanceof Error && error.message === 'QUOTA_EXCEEDED') {
        // Fallback mode activated
      }
      
      // Fallback: create dummy audio URLs and show questions immediately
      const dummyUrls = questions.map(() => 'dummy-audio')
      setAudioUrls(dummyUrls)
      setHasGeneratedAudio(true)
      setIsLoading(false)
      setAudioProgress(questions.length)
      
      // Show first question immediately without audio
      setShowAnswers(true)
      
      // Force a re-render and ensure state is properly set
      setTimeout(() => {
        setShowAnswers(true)
      }, 100)
    }
  }

  // Check for saved audio files when component mounts
  useEffect(() => {
    console.log('=== QuizPlayer useEffect triggered ===')
    console.log('Questions:', questions)
    console.log('SelectedVoice:', selectedVoice)
    console.log('StudySetId:', studySetId)
    console.log('HasGeneratedAudio:', hasGeneratedAudio)
    console.log('IsLoading:', isLoading)
    
    // Safety timeout: if we're stuck loading for more than 10 seconds, force show quiz
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ Safety timeout triggered, forcing quiz to show')
        setIsLoading(false)
        setHasGeneratedAudio(true)
        if (audioUrls.length === 0) {
          const dummyUrls = questions.map(() => 'dummy-audio')
          setAudioUrls(dummyUrls)
        }
      }
    }, 10000)
    
    if (questions && questions.length > 0 && selectedVoice) {
      console.log('QuizPlayer: Checking for saved audio files...')
      
      // Priority 1: Check if questions have audioUrl attached (for retakes)
      if (questions[0] && (questions[0] as any).audioUrl) {
        console.log('✅ Found audioUrl in questions, using saved audio files')
        const audioUrlsFromQuestions = questions.map((q: any) => q.audioUrl || 'dummy-audio')
        console.log('Audio URLs from questions:', audioUrlsFromQuestions)
        setAudioUrls(audioUrlsFromQuestions)
        setHasGeneratedAudio(true)
        setIsLoading(false)
        console.log('✅ Set audio URLs and marked as generated')
        // Force immediate state update
        setTimeout(() => {
          setHasGeneratedAudio(true)
          setIsLoading(false)
        }, 0)
        return
      }
      
      // Priority 2: Check sessionStorage for savedAudioFiles
      const savedAudioData = sessionStorage.getItem('savedAudioFiles')
      console.log('Saved audio data from sessionStorage:', savedAudioData)
      if (savedAudioData) {
        try {
          const parsed = JSON.parse(savedAudioData)
          console.log('Parsed saved audio data:', parsed)
          if (parsed && Array.isArray(parsed) && parsed.length === questions.length) {
            console.log('✅ Found savedAudioFiles in sessionStorage, using saved audio files')
            console.log('Saved audio files:', parsed)
            setAudioUrls(parsed)
            setHasGeneratedAudio(true)
            setIsLoading(false)
            console.log('✅ Set audio URLs and marked as generated')
            // Force immediate state update
            setTimeout(() => {
              setHasGeneratedAudio(true)
              setIsLoading(false)
            }, 0)
            return
          } else {
            console.log('❌ Saved audio data length mismatch or invalid format')
            console.log('Expected length:', questions.length, 'Got length:', parsed?.length)
          }
        } catch (error) {
          console.error('Error parsing saved audio files:', error)
        }
      }
      
      // No saved audio files found
      console.log('❌ No saved audio files found')
      console.log('StudySetId exists:', !!studySetId)
      console.log('HasGeneratedAudio:', hasGeneratedAudio)
      
      if (!hasGeneratedAudio) {
        // Check if this is a retake (has studySetId) - if so, use dummy audio
        if (studySetId) {
          console.log('✅ This is a retake but no audio files found, using dummy audio')
          const dummyUrls = questions.map(() => 'dummy-audio')
          setAudioUrls(dummyUrls)
          setHasGeneratedAudio(true)
          setIsLoading(false)
          setShowAnswers(true)
          console.log('✅ Set dummy audio URLs and marked as generated')
          // Force immediate state update
          setTimeout(() => {
            setHasGeneratedAudio(true)
            setIsLoading(false)
          }, 0)
        } else {
          console.log('🔄 New quiz, generating audio...')
          // New quiz, generate audio
          generateVoiceAudio()
        }
      } else {
        console.log('✅ Audio already generated, skipping')
      }
    } else {
      console.log('❌ Missing required data for audio check')
      console.log('Questions exist:', !!questions)
      console.log('Questions length:', questions?.length)
      console.log('SelectedVoice exists:', !!selectedVoice)
    }
    
    // Cleanup timeout on unmount or dependency change
    return () => clearTimeout(safetyTimeout)
  }, [questions, selectedVoice, hasGeneratedAudio, studySetId, isLoading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentAudio()
    }
  }, [])

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
    }

    // No more auto-advance - user clicks Next Question button
  }

  const handleNext = () => {
    // Stop current audio before moving to next question
    stopCurrentAudio()
    
    const nextQuestionIndex = currentQuestionIndex + 1
    setCurrentQuestionIndex(nextQuestionIndex)
    setAnsweredCurrentQuestion(false)
    setCurrentQuestionCorrect(false)
    setSubtitleProgress(0)
    setCurrentSubtitle('')
    setVisibleWords([])
    
    // For dummy audio (fallback mode), show answers immediately
    // For real audio, hide answers temporarily and play audio
    if (audioUrls[nextQuestionIndex] === 'dummy-audio') {
      setShowAnswers(true)
    } else {
      setShowAnswers(false)
      // Auto-play the next question's audio after a short delay
      setTimeout(() => {
        playQuestionAudio()
      }, 500)
    }
  }

  const handleFinishQuiz = () => {
    console.log('=== handleFinishQuiz called ===');
    console.log('Current question correct:', currentQuestionCorrect);
    console.log('Current score ref:', scoreRef.current);
    
    // The scoreRef already includes all questions answered correctly
    // No need to add 1 for the last question since it's already counted
    const finalScoreValue = scoreRef.current
    console.log('Final score calculated:', finalScoreValue);
    
    setFinalScore(finalScoreValue)
    setQuizCompleted(true)
    console.log('Quiz completion state set to true');
    
    // If this is a retake (has studySetId), automatically update the existing study set
    if (studySetId) {
      updateExistingStudySet(finalScoreValue)
    }
    
    onQuizComplete(finalScoreValue, questions.length)
  }

  // Function to update existing study set with new score
  const updateExistingStudySet = async (newScore: number) => {
    try {
      console.log('Updating existing study set with new score:', newScore)
      
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No session found, cannot update study set')
        return
      }

      // Extract the base title without any previous score
      let baseTitle = quizTitle || 'Quiz'
      
      // Remove any existing score suffix (e.g., "Quiz - 30% Score" becomes "Quiz")
      if (baseTitle.includes(' - ') && baseTitle.includes('% Score')) {
        baseTitle = baseTitle.split(' - ')[0]
      }
      
      // Create new title with current score only
      const newTitle = `${baseTitle} - ${Math.round((newScore / questions.length) * 100)}% Score`
      
      console.log('Updating title from:', quizTitle, 'to:', newTitle)

      // Update the existing study set with the new score
      const response = await fetch('/api/save-study-set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: newTitle,
          quizData: {
            questions: questions,
            score: newScore,
            total_questions: questions.length,
            completed_at: new Date().toISOString()
          },
          backgroundVideo: backgroundVideo,
          voiceSelection: selectedVoice,
          score: newScore,
          totalQuestions: questions.length,
          audioFiles: audioUrls
        })
      })

      if (response.ok) {
        console.log('✅ Study set updated with new score')
      } else {
        console.error('❌ Failed to update study set')
      }
    } catch (error) {
      console.error('Error updating study set:', error)
    }
  }

  // Debug logging for quiz completion
  console.log('Quiz state:', {
    currentQuestionIndex,
    questionsLength: questions.length,
    isLastQuestion,
    quizCompleted,
    finalScore
  });

  // Only show loading screen if we're actually generating audio AND don't have audio files yet
  if (isLoading && (!hasGeneratedAudio || audioUrls.length === 0)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5CA4F6] mx-auto mb-4"></div>

          <p className="text-lg text-gray-700 mb-2">Generating AI voices for your quiz...</p>
          <p className="text-sm text-gray-500">
            {audioProgress > 0 ? `${audioProgress}/${questions.length} questions processed` : 'Starting...'}
          </p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mt-4 mx-auto">
            <div 
              className="bg-[#5CA4F6] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(audioProgress / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Subtle glass overlay for the entire quiz */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-[2px] pointer-events-none"></div>
      
      <UsageMonitor characterUsage={characterUsage} />
      <div className="max-w-md mx-auto relative h-screen">
        {/* Background Video - Phone Frame */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-192 bg-white rounded-2xl overflow-hidden shadow-2xl">
            <video
              src={backgroundVideo}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Video overlay for better text readability */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="max-w-md mx-auto">
            <div className="bg-white/40 backdrop-blur-md p-3 mx-8 mt-9 rounded-2xl border border-white/50 shadow-2xl">
              <div className="flex justify-between items-center text-gray-800 text-sm font-medium">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="w-full bg-white/40 rounded-full h-2 mt-3">
                <div 
                  className="bg-[#5CA4F6] h-2 rounded-full transition-all duration-300 shadow-lg"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* TikTok-style word-by-word subtitles */}
        {isPlayingAudio && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
            <div className="w-full max-w-2xl">
              {/* Word-by-word subtitle display */}
              <div className="text-center">
                <div className="inline-block bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-2xl">
                  {visibleWords.map((word, index) => (
                    <span
                      key={index}
                      className="inline-block text-2xl font-bold text-gray-800 mx-1 animate-fadeIn"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Content - Show questions when we have audio files and are ready */}
        {(() => {
          const shouldShowQuestions = showAnswers || (hasGeneratedAudio && audioUrls.length > 0)
          console.log('Question display logic:', {
            showAnswers,
            hasGeneratedAudio,
            audioUrlsLength: audioUrls.length,
            currentQuestion: !!currentQuestion,
            shouldShowQuestions
          })
          return shouldShowQuestions && currentQuestion
        })() && (
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
        )}
        


        {/* Quiz Completion Screen */}
        {quizCompleted && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <div className="bg-white/25 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl text-center">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Quiz Complete! 🎉</h2>
                  
                  {/* Current Score */}
                  <div className="text-5xl font-bold text-[#5CA4F6] mb-3">
                    {Math.round((finalScore / questions.length) * 100)}%
                  </div>
                  <div className="text-lg text-white/80 mb-4">
                    {finalScore} out of {questions.length} questions correct
                  </div>
                  
                  {/* Score Improvement Display */}
                  {previousScore !== undefined && (
                    <ScoreImprovement 
                      currentScore={Math.round((finalScore / questions.length) * 100)}
                      previousScore={previousScore}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  {/* Only show Save to Collection for new quizzes, not retakes */}
                  {!studySetId && (
                    <button
                      onClick={async () => {
                        try {
                          // Get the current session for authentication
                          const { data: { session } } = await supabase.auth.getSession()
                          
                          if (!session) {
                            alert('Please log in to save your quiz results.');
                            return;
                          }

                          // Save to collection
                          const response = await fetch('/api/save-study-set', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${session.access_token}`
                            },
                            body: JSON.stringify({
                              title: quizTitle ? `${quizTitle} - ${Math.round((finalScore / questions.length) * 100)}% Score` : `Quiz - ${Math.round((finalScore / questions.length) * 100)}% Score`,
                              quizData: {
                                questions: questions,
                                score: finalScore,
                                total_questions: questions.length,
                                completed_at: new Date().toISOString()
                              },
                              backgroundVideo: backgroundVideo,
                              voiceSelection: selectedVoice,
                              score: finalScore,
                              totalQuestions: questions.length,
                              audioFiles: audioUrls
                            })
                          });

                          if (response.ok) {
                            alert('Quiz saved to collection! 🎉');
                            // Navigate back to dashboard
                            window.location.href = '/dashboard';
                          } else {
                            const errorData = await response.json();
                            alert(`Failed to save quiz: ${errorData.error || 'Unknown error'}`);
                          }
                        } catch (error) {
                          console.error('Error saving quiz:', error);
                          alert('Error saving quiz. Please try again.');
                        }
                      }}
                      className="w-full px-6 py-4 bg-[#5CA4F6] text-white rounded-xl hover:bg-[#4A90E2] transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-lg"
                    >
                      💾 Save to Collection
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      // Navigate back to dashboard
                      window.location.href = '/dashboard'
                    }}
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/40 shadow-lg hover:shadow-xl font-medium text-lg"
                  >
                    {studySetId ? '🏠 Back to Dashboard' : '🎯 Generate New Quiz'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
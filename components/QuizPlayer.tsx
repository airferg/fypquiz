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
  const [audioProgress, setAudioProgress] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [subtitleProgress, setSubtitleProgress] = useState(0)
  const [currentSubtitle, setCurrentSubtitle] = useState('')
  const [visibleWords, setVisibleWords] = useState<string[]>([])
  const [hasGeneratedAudio, setHasGeneratedAudio] = useState(false)
  const scoreRef = useRef(0)
  const lastPlayedQuestionRef = useRef(-1)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  // Play audio for current question with real-time subtitles
  const playQuestionAudio = () => {
    console.log('playQuestionAudio called');
    console.log('audioUrls:', audioUrls);
    console.log('currentQuestionIndex:', currentQuestionIndex);
    console.log('audioUrls[currentQuestionIndex]:', audioUrls[currentQuestionIndex]);
    console.log('isPlayingAudio:', isPlayingAudio);
    
    if (audioUrls[currentQuestionIndex] && !isPlayingAudio) {
      console.log('Creating audio element');
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
        console.log('Audio play event fired');
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
      
      audio.addEventListener('timeupdate', () => {
        if (audio.duration > 0) {
          const progress = (audio.currentTime / audio.duration) * 100
          setSubtitleProgress(progress)
        }
      })
      
      audio.addEventListener('ended', () => {
        console.log('Audio ended event fired');
        setIsPlayingAudio(false)
        setSubtitleProgress(100)
        
        // 1-second delay before showing answers
        setTimeout(() => {
          console.log('Showing answers after delay');
          setShowAnswers(true)
        }, 1000)
      })
      
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setIsPlayingAudio(false)
        setShowAnswers(true)
      })
      
      console.log('Attempting to play audio');
      audio.play().then(() => {
        console.log('Audio play promise resolved');
      }).catch((error) => {
        console.error('Audio play failed:', error);
        setIsPlayingAudio(false)
        setShowAnswers(true)
      })
      setCurrentAudio(audio)
    } else if (!audioUrls[currentQuestionIndex]) {
      // If no audio, show answers immediately
      console.log('No audio URL found, showing answers immediately');
      setShowAnswers(true)
    } else {
      console.log('Audio is already playing or no audio available');
    }
  }

  // Stop current audio
  const stopCurrentAudio = () => {
    if (currentAudio) {
      // Clear word timer if it exists
      if ((currentAudio as any).wordTimer) {
        clearInterval((currentAudio as any).wordTimer)
      }
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
    }
    setIsPlayingAudio(false)
    setVisibleWords([])
  }

  const handleCancelQuiz = () => {
    if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
      stopCurrentAudio()
      router.push('/dashboard')
    }
  }

  const saveAudioFile = async (audioBlob: Blob, fileName: string): Promise<string> => {
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))
      
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

  // Generate audio for a single question
  const generateSingleAudio = async (questionText: string, questionIndex: number): Promise<string> => {
    try {
      console.log(`🎵 Generating audio for question ${questionIndex + 1}: "${questionText.substring(0, 50)}..."`);
      console.log(`Voice ID: ${selectedVoice}`);
      
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: questionText,
          voiceId: selectedVoice,
        }),
      });

      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        const audioBlob = await response.blob();
        console.log(`Audio blob size: ${audioBlob.size} bytes`);
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log(`✅ Audio generated for question ${questionIndex + 1}, URL: ${audioUrl}`);
        return audioUrl;
      } else {
        const errorText = await response.text();
        console.warn(`❌ Failed to generate audio for question ${questionIndex + 1}:`, errorText);
        return '';
      }
    } catch (error) {
      console.error(`Error generating audio for question ${questionIndex + 1}:`, error);
      return '';
    }
  }

  useEffect(() => {
    console.log('🔄 Audio generation useEffect triggered');
    console.log('Questions:', questions.length);
    console.log('Selected voice:', selectedVoice);
    
    // Check for saved audio files first
    const savedAudioFilesStr = sessionStorage.getItem('savedAudioFiles')
    const savedAudioFiles = savedAudioFilesStr ? JSON.parse(savedAudioFilesStr) : {}
    console.log('Saved audio files found:', Object.keys(savedAudioFiles).length);
    
    // Check if we already have audio URLs or have generated audio (prevent regeneration)
    if (audioUrls.length > 0 || hasGeneratedAudio) {
      console.log('Audio URLs already exist or audio already generated, skipping generation');
      setIsLoading(false)
      return
    }
    
    if (Object.keys(savedAudioFiles).length > 0) {
      // Use saved audio files
      console.log('Using saved audio files:', savedAudioFiles)
      setSavedAudioFiles(savedAudioFiles)
      
      // Convert saved base64 data to blob URLs for playback
      const audioUrls = questions.map((_, index) => {
        const savedAudioData = savedAudioFiles[`question-${index + 1}`]
        if (savedAudioData && savedAudioData.url) {
          // Convert base64 to blob URL
          const base64Data = savedAudioData.url.split(',')[1]
          const audioBlob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: 'audio/mpeg' })
          const audioUrl = URL.createObjectURL(audioBlob)
          console.log(`Converted saved audio for question ${index + 1} to URL: ${audioUrl}`)
          return audioUrl
        }
        return ''
      }).filter(url => url !== '')
      
      console.log('Converted audio URLs:', audioUrls)
      setAudioUrls(audioUrls)
      setIsLoading(false)
      return
    }

    // Generate audio in parallel with progress tracking
    const generateAudioParallel = async () => {
      try {
        console.log('🔄 Generating audio in parallel...');
        console.log('Selected voice:', selectedVoice);
        console.log('Number of questions:', questions.length);
        
        // Start with first 3 questions immediately, then lazy load the rest
        const initialBatch = Math.min(3, questions.length);
        const remainingQuestions = questions.slice(initialBatch);
        
        // Generate first batch in parallel
        const initialPromises = questions.slice(0, initialBatch).map((question, index) =>
          generateSingleAudio(question.question, index)
        );
        
        const initialResults = await Promise.all(initialPromises);
        console.log('Initial audio results:', initialResults);
        setAudioUrls(initialResults);
        setAudioProgress(initialBatch);
        
        // If we have more questions, generate them in the background
        if (remainingQuestions.length > 0) {
          const remainingPromises = remainingQuestions.map((question, index) =>
            generateSingleAudio(question.question, initialBatch + index)
          );
          
          // Process remaining questions in batches of 2 for better performance
          for (let i = 0; i < remainingPromises.length; i += 2) {
            const batch = remainingPromises.slice(i, i + 2);
            const batchResults = await Promise.all(batch);
            
            setAudioUrls(prev => [...prev, ...batchResults]);
            setAudioProgress(initialBatch + i + batch.length);
            
            // Small delay to prevent overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        setIsLoading(false);
        setHasGeneratedAudio(true);
        console.log('🎉 All audio generated!');
        console.log('Final audioUrls:', audioUrls);
      } catch (error) {
        console.error('❌ Error generating audio:', error);
        setIsLoading(false);
      }
    };

    generateAudioParallel();
  }, [questions, selectedVoice])

  useEffect(() => {
    if (isLoading) return

    // Reset states for new question
    setAnsweredCurrentQuestion(false)
    setCurrentQuestionCorrect(false)
    setShowAnswers(false)
    setSubtitleProgress(0)
    setCurrentSubtitle('')
    setVisibleWords([])
    
    // Stop any currently playing audio
    stopCurrentAudio()
    
    // Check if we have audio for this question
    if (audioUrls.length > 0 && audioUrls[currentQuestionIndex] && audioUrls[currentQuestionIndex] !== '') {
      console.log(`🎵 Playing audio for question ${currentQuestionIndex + 1}`);
      setTimeout(() => {
        playQuestionAudio()
      }, 500)
    } else {
      // If no audio, show answers immediately
      console.log('No audio available, showing answers immediately');
      console.log('audioUrls length:', audioUrls.length);
      console.log('currentQuestionIndex:', currentQuestionIndex);
      console.log('audioUrls[currentQuestionIndex]:', audioUrls[currentQuestionIndex]);
      setShowAnswers(true)
    }
    
    lastPlayedQuestionRef.current = currentQuestionIndex;
  }, [currentQuestionIndex, isLoading, audioUrls])

  // Cleanup audio when component unmounts
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
      console.log(`Score updated: ${score} -> ${newScore}`)
    }
  }

  const handleNext = () => {
    console.log(`Moving to next question: ${currentQuestionIndex + 1} -> ${currentQuestionIndex + 2}`)
    console.log(`Resetting state for next question`)
    
    // Stop current audio before moving to next question
    stopCurrentAudio()
    
    setCurrentQuestionIndex(currentQuestionIndex + 1)
    setAnsweredCurrentQuestion(false)
    setCurrentQuestionCorrect(false)
    setShowAnswers(false)
    setSubtitleProgress(0)
    setCurrentSubtitle('')
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
          <p className="text-lg text-gray-300 mb-2">Generating AI voices for your quiz...</p>
          <p className="text-sm text-gray-400">
            {audioProgress > 0 ? `${audioProgress}/${questions.length} questions processed` : 'Starting...'}
          </p>
          <div className="w-64 bg-white/20 rounded-full h-2 mt-4 mx-auto">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${(audioProgress / questions.length) * 100}%` }}
            ></div>
          </div>
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

        {/* TikTok-style word-by-word subtitles */}
        {isPlayingAudio && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
            <div className="w-full max-w-2xl">
              {/* Word-by-word subtitle display */}
              <div className="text-center">
                <div className="inline-block">
                  {visibleWords.map((word, index) => (
                    <span
                      key={index}
                      className="inline-block text-2xl font-bold text-white mx-1 animate-fadeIn"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Skip button */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={() => {
                    stopCurrentAudio()
                    // 1-second delay before showing answers (same as audio end)
                    setTimeout(() => {
                      setShowAnswers(true)
                    }, 1000)
                  }}
                  className="px-4 py-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all text-sm backdrop-blur-sm"
                >
                  Skip Audio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Question Content - TikTok Style */}
        {showAnswers && (
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
      </div>
    </div>
  )
} 
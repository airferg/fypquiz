'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, Send, CheckCircle, Star, Heart, Zap, Target, Award, Trophy, BookOpen, Home, LogOut } from 'lucide-react'

export default function FeedbackPage() {
  const router = useRouter()
  const [feedback, setFeedback] = useState('')
  const [category, setCategory] = useState('general')
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedback.trim(),
          category,
          rating,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFeedback('')
        setCategory('general')
        setRating(0)
      } else {
        throw new Error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h1>
            <p className="text-gray-600 mb-6">
              Your feedback has been submitted successfully. We appreciate your input!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full bg-[#5CA4F6] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#5CA4F6]/90 transition-all"
              >
                Submit More Feedback
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </button>
              <button
                onClick={() => router.push('/blog')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Study Tips</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-[#5CA4F6]" />
              <h1 className="text-2xl font-bold">Feedback</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Help Us Improve FYPQuiz</h2>
          <p className="text-lg text-gray-600">
            Your feedback helps us create a better study experience for students like you
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20"
              >
                <option value="general">General Feedback</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="ui">UI/UX Improvement</option>
                <option value="performance">Performance Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you rate your experience?
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-lg transition-all ${
                      star <= rating
                        ? 'text-yellow-500 bg-yellow-50'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className={`h-6 w-6 ${star <= rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {rating === 0 && 'Click to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                placeholder="Tell us what you think, what you'd like to see, or any issues you've encountered..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#5CA4F6] focus:ring-2 focus:ring-[#5CA4F6]/20 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!feedback.trim() || isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                !feedback.trim() || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#5CA4F6] text-white hover:bg-[#5CA4F6]/90'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/')}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Back to Home</h4>
                <p className="text-sm text-gray-600">Return to landing page</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/blog')}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Study Tips</h4>
                <p className="text-sm text-gray-600">Learn better strategies</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Dashboard</h4>
                <p className="text-sm text-gray-600">Create new quizzes</p>
              </div>
            </div>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            We read every piece of feedback and use it to improve FYPQuiz for all students.
          </p>
        </div>
      </div>
    </div>
  )
}

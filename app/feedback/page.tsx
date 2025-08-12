'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, Star, Send, CheckCircle } from 'lucide-react'

export default function FeedbackPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    overallRating: 0,
    easeOfUse: 0,
    featureRating: 0,
    wouldRecommend: '',
    newFeatures: '',
    additionalFeedback: '',
    contactEmail: ''
  })

  const handleRatingChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Submit feedback to the API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit feedback')
      }

      const result = await response.json()
      console.log('Feedback submitted successfully:', result)
      
      setIsSubmitted(true)
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          overallRating: 0,
          easeOfUse: 0,
          featureRating: 0,
          wouldRecommend: '',
          newFeatures: '',
          additionalFeedback: '',
          contactEmail: ''
        })
      }, 3000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">
              Thank You!
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Your feedback has been submitted successfully. We appreciate your input!
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-accent" />
              <h1 className="text-2xl font-bold">Feedback</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <MessageSquare className="h-16 w-16 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Help Us Improve FYPQuiz</h2>
          <p className="text-xl text-gray-300">
            Your feedback helps us create a better learning experience for students like you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* New Features - First Question */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">What new features could we add that would help your studying ability?</h3>
            <textarea
              value={formData.newFeatures}
              onChange={(e) => setFormData(prev => ({ ...prev, newFeatures: e.target.value }))}
              placeholder="Tell us about features that would help you study better... (e.g., spaced repetition, study timer, progress tracking, etc.)"
              className="w-full h-32 p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
          </div>

          {/* Overall Rating */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">How would you rate your overall experience with FYPQuiz?</h3>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange('overallRating', rating)}
                  className={`p-3 rounded-lg transition-all ${
                    formData.overallRating >= rating
                      ? 'text-yellow-400 bg-yellow-400/20'
                      : 'text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  <Star className={`h-8 w-8 ${formData.overallRating >= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <div className="text-center mt-2 text-sm text-gray-400">
              {formData.overallRating === 0 && 'Click to rate'}
              {formData.overallRating > 0 && `${formData.overallRating} out of 5 stars`}
            </div>
          </div>

          {/* Ease of Use */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">How easy is FYPQuiz to use?</h3>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange('easeOfUse', rating)}
                  className={`p-3 rounded-lg transition-all ${
                    formData.easeOfUse >= rating
                      ? 'text-blue-400 bg-blue-400/20'
                      : 'text-gray-400 hover:text-blue-400'
                  }`}
                >
                  <Star className={`h-8 w-8 ${formData.easeOfUse >= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <div className="text-center mt-2 text-sm text-gray-400">
              {formData.easeOfUse === 0 && 'Click to rate'}
              {formData.easeOfUse > 0 && `${formData.easeOfUse} out of 5 stars`}
            </div>
          </div>

          {/* Feature Rating */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">How would you rate the quiz generation features?</h3>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange('featureRating', rating)}
                  className={`p-3 rounded-lg transition-all ${
                    formData.featureRating >= rating
                      ? 'text-green-400 bg-green-400/20'
                      : 'text-gray-400 hover:text-green-400'
                  }`}
                >
                  <Star className={`h-8 w-8 ${formData.featureRating >= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <div className="text-center mt-2 text-sm text-gray-400">
              {formData.featureRating === 0 && 'Click to rate'}
              {formData.featureRating > 0 && `${formData.featureRating} out of 5 stars`}
            </div>
          </div>

          {/* Would Recommend */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Would you recommend FYPQuiz to other students?</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Yes, definitely!', 'Yes, probably', 'Maybe', 'Probably not', 'No, definitely not'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: option }))}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.wouldRecommend === option
                      ? 'border-accent bg-accent/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>



          {/* Additional Feedback */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Any additional feedback or suggestions?</h3>
            <textarea
              value={formData.additionalFeedback}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalFeedback: e.target.value }))}
              placeholder="Tell us what you think, what you'd like to see, or any issues you've encountered..."
              className="w-full h-32 p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
          </div>

          {/* Contact Email (Optional) */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Contact Email (Optional)</h3>
            <p className="text-gray-400 mb-4 text-sm">
              If you'd like us to follow up on your feedback, please provide your email address.
            </p>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              placeholder="your.email@example.com"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting || formData.overallRating === 0}
              className={`
                px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center space-x-2 mx-auto
                ${isSubmitting || formData.overallRating === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-accent text-white hover:bg-accent/90'
                }
              `}
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
          </div>
        </form>
      </div>

      {/* Footer with Navigation Links */}
      <div className="bg-white/5 border-t border-white/20 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/quiz')}
                  className="block text-white hover:text-accent transition-colors"
                >
                  Take Quiz
                </button>
                <button
                  onClick={() => router.push('/collection')}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  My Collection
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Learn More</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/blog')}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Blog
                </button>
                <button
                  onClick={() => router.push('/videos')}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Video Library
                </button>
                <a
                  href="/"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/feedback')}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Submit Feedback
                </button>
                <a
                  href="mailto:support@fypquiz.com"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="/auth"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 FYPQuiz. Helping students focus and learn better.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

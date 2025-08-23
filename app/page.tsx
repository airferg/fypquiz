'use client'

import { ArrowRight, Menu, X, BookOpen, MessageSquare, Trophy, Heart, Star, Flame, Gamepad2, Sparkles, AlertCircle, Play, Users, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Logo from '@/components/Logo'
import LandingFileUpload from '@/components/LandingFileUpload'
import LandingVideo from '@/components/LandingVideo'

export default function LandingPage() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleGetStarted = () => {
    router.push('/auth')
  }

  const handleFileUpload = (content: string, fileName: string) => {
    // Store the content in session storage for the quiz page
    sessionStorage.setItem('uploadedContent', content)
    sessionStorage.setItem('fileName', fileName)
    // Redirect to auth page to get started
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-30 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Logo size={32} />
            <span className="text-xl font-bold">fypquiz</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="hover:text-[#5CA4F6] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#5CA4F6] transition-colors">How it Works</a>
            <a href="/blog" className="hover:text-[#5CA4F6] transition-colors">Blog</a>
            <a href="/feedback" className="hover:text-[#5CA4F6] transition-colors">Feedback</a>
            <a
              href="/auth"
              className="bg-[#5CA4F6] text-white px-6 py-2 rounded-full hover:bg-[#5CA4F6]/90 transition-all flex items-center space-x-2 shadow-lg"
            >
              <span>Generate Quiz Free</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md bg-white/10 hover:bg-white/20"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute top-0 left-0 h-full w-72 bg-white/20 backdrop-blur-md border-r border-white/30 shadow-xl p-6 flex flex-col">
              <div className="flex items-center space-x-2 mb-6">
                <Logo size={28} />
                <span className="text-lg font-bold">fypquiz</span>
              </div>
              <button
                className="inline-flex items-center justify-center p-2 rounded-md bg-white/10 hover:bg-white/20"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <a href="#features" className="py-3 border-b border-white/20 text-white hover:text-[#5CA4F6] transition-colors" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="py-3 border-b border-white/20 text-white hover:text-[#5CA4F6] transition-colors" onClick={() => setIsMenuOpen(false)}>How it Works</a>
            <a href="/blog" className="py-3 border-b border-white/20 text-white hover:text-[#5CA4F6] transition-colors" onClick={() => setIsMenuOpen(false)}>Blog</a>
            <a href="/feedback" className="py-3 border-b border-white/20 text-white hover:text-[#5CA4F6] transition-colors" onClick={() => setIsMenuOpen(false)}>Feedback</a>
            <a
              href="/auth"
              className="mt-6 bg-[#5CA4F6] text-white px-4 py-3 rounded-full text-center shadow-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Generate Quiz Free
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Motivational Stickers - Left Side */}
        <div className="hidden lg:block absolute left-4 top-20 transform -rotate-12">
          <div className="bg-pink-100 border-2 border-pink-300 rounded-2xl p-4 shadow-lg max-w-48 hover:scale-110 hover:shadow-2xl hover:shadow-pink-300/50 transition-all duration-300 cursor-pointer">
            <p className="text-sm font-medium text-pink-800 text-center">🎯 <strong>Crush your SATs!</strong></p>
          </div>
        </div>
        
        <div className="hidden lg:block absolute left-8 top-96 transform rotate-6">
          <div className="bg-purple-100 border-2 border-purple-300 rounded-2xl p-4 shadow-lg max-w-48 hover:scale-110 hover:shadow-2xl hover:shadow-purple-300/50 transition-all duration-300 cursor-pointer">
            <p className="text-sm font-medium text-purple-800 text-center">📚 <strong>Master your APs!</strong></p>
          </div>
        </div>
        
        <div className="hidden lg:block absolute left-16 top-[32rem] transform -rotate-8">
          <div className="bg-blue-100 border-2 border-blue-300 rounded-2xl p-4 shadow-lg max-w-48 hover:scale-110 hover:shadow-2xl hover:shadow-blue-300/50 transition-all duration-300 cursor-pointer">
            <p className="text-sm font-medium text-blue-800 text-center">🏆 <strong>Conquer finals!</strong></p>
          </div>
        </div>
        
        {/* Motivational Stickers - Right Side */}
        <div className="hidden lg:block absolute right-4 top-16 transform rotate-12">
          <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-4 shadow-lg max-w-48 hover:scale-110 hover:shadow-2xl hover:shadow-green-300/50 transition-all duration-300 cursor-pointer">
            <p className="text-sm font-medium text-green-800 text-center">🌟 <strong>Excel in your ACT!</strong></p>
          </div>
        </div>
        
        <div className="hidden lg:block absolute right-8 top-80 transform -rotate-6">
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4 shadow-lg max-w-48 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-300/50 transition-all duration-300 cursor-pointer">
            <p className="text-sm font-medium text-yellow-800 text-center">💪 <strong>Own your midterms!</strong></p>
          </div>
        </div>
        
        <div className="hidden lg:block absolute right-16 top-[36rem] transform rotate-8">
          <div className="bg-orange-100 border-2 border-orange-300 rounded-2xl p-4 shadow-lg max-w-48 hover:scale-110 hover:shadow-2xl hover:shadow-orange-300/50 transition-all duration-300 cursor-pointer">
            <p className="text-sm font-medium text-orange-800 text-center">🚀 <strong>Level up your GPA!</strong></p>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="text-center px-6 max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#5CA4F6] to-blue-600 bg-clip-text text-transparent">
            Study like it's TikTok.
          </h1>
          <p className="text-base md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Paste a link or drop your notes — we turn them into fun, scroll-style quizzes that actually stick.
          </p>
          
          {/* YouTube Captions Notice */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                <strong>YouTube videos:</strong> Make sure to turn on captions/CC for best results! 🎥
              </span>
            </div>
          </div>
          
          {/* Trust & Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
              <Heart className="h-5 w-5 text-pink-500" />
              <span className="text-xs font-medium text-gray-700">10K+ students already studying smarter</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-xs font-medium text-gray-700">4.9/5 ⭐</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-xs font-medium text-gray-700">Built for Gen Z learners</span>
            </div>
          </div>
          

          
          {/* File Upload Component */}
          <LandingFileUpload onFileUpload={handleFileUpload} />
          
          {/* Demo Video */}
          <div className="mt-8 flex flex-col items-center">
            <LandingVideo />
            <p className="text-sm text-gray-500 mt-4 text-center max-w-md">
              See how fast it works in action! Watch the magic happen in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50 relative">
        {/* Motivational Stickers - Features Section */}
        <div className="hidden lg:block absolute left-6 top-1/5 transform rotate-12">
          <div className="bg-pink-100 border-2 border-pink-300 rounded-2xl p-3 shadow-lg max-w-40 hover:scale-110 hover:shadow-2xl hover:shadow-pink-300/50 transition-all duration-300 cursor-pointer">
            <p className="text-xs font-medium text-pink-800 text-center">✨ <strong>You've got this!</strong></p>
          </div>
        </div>
        
        <div className="hidden lg:block absolute right-6 top-2/5 transform -rotate-8">
          <div className="bg-purple-100 border-2 border-purple-300 rounded-2xl p-3 shadow-lg max-w-40 hover:scale-110 hover:shadow-2xl hover:shadow-purple-300/50 transition-all duration-300 cursor-pointer">
            <p className="text-xs font-medium text-purple-800 text-center">💫 <strong>Study smarter!</strong></p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Why Students Love Us</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're not just another study app. We're the TikTok-style study hack that Gen Z actually wants to use.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <Logo size={64} className="mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Turn boring notes into TikTok-style quizzes</h3>
              <p className="text-gray-600 text-base">
                Upload your boring lecture videos, textbooks, or canvas pages, and let our AI create study sets that actually stick in your brain
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <Gamepad2 className="h-16 w-16 text-[#5CA4F6] mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Choose your vibe: Rachel, Josh, Emily & more</h3>
                              <p className="text-gray-600 text-base">
                  Pick from professional ElevenLabs voices that match your study mood. From encouraging to educational, find the perfect voice to keep you engaged.
                </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <Sparkles className="h-16 w-16 text-[#5CA4F6] mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Background focus hacks: Minecraft parkour, Subway Surfers, more</h3>
              <p className="text-gray-600 text-base">
                Study with Minecraft parkour or Subway Surfers in the background = the ultimate focus hack. Your brain stays engaged while you learn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-white relative">
        {/* Motivational Stickers - How It Works Section */}
        <div className="hidden lg:block absolute left-8 top-1/3 transform -rotate-12">
          <div className="bg-blue-100 border-2 border-blue-300 rounded-2xl p-3 shadow-lg max-w-40 hover:scale-110 hover:shadow-2xl hover:shadow-blue-300/50 transition-all duration-300 cursor-pointer">
            <p className="text-xs font-medium text-blue-800 text-center">🎓 <strong>Future ready!</strong></p>
          </div>
        </div>
        
        <div className="hidden lg:block absolute right-8 top-2/3 transform rotate-6">
          <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-3 shadow-lg max-w-40 hover:scale-110 hover:shadow-2xl hover:shadow-green-300/50 transition-all duration-300 cursor-pointer">
            <p className="text-xs font-medium text-green-800 text-center">🌟 <strong>Dream big!</strong></p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your study experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#5CA4F6] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Paste a link or upload notes</h3>
              <p className="text-gray-600 text-base">
                Copy a link to a webpage, YouTube video, or upload any PDF, video, or document. Our AI will analyze it and create engaging study sets.
              </p>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>💡 Pro tip:</strong> For YouTube videos, make sure captions/CC are turned on!
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-[#5CA4F6] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">AI makes a quiz in seconds</h3>
              <p className="text-gray-600 text-base">
                Our AI creates engaging study sets with your chosen voice and background. No more boring flashcards, just fun learning that sticks.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-[#5CA4F6] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>  
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Study while you scroll-style focus</h3>
              <p className="text-gray-600 text-base">
                Take the study set with your favorite background, laugh at the commentary, and actually remember what you learned.
              </p>
            </div>
          </div>
          
          {/* Microcopy for activation */}
          <div className="text-center mt-12">
            <p className="text-base text-gray-600 mb-4">
              See how fast it works? Try it on your notes in 10 seconds.
            </p>
            <button 
              onClick={handleGetStarted}
              className="bg-[#5CA4F6] text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-[#5CA4F6]/90 transition-all flex items-center justify-center space-x-2 mx-auto shadow-lg"
            >
              <Play className="h-5 w-5" />
              <span>Generate Your First Quiz Free</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#5CA4F6] mb-2">10K+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#5CA4F6] mb-2">50K+</div>
              <div className="text-gray-600">Quizzes Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#5CA4F6] mb-2">95%</div>
              <div className="text-gray-600">Say it helps them focus</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#5CA4F6] mb-2">4.9/5</div>
              <div className="text-gray-600">Student Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">Explore More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/blog" className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100">
              <BookOpen className="h-12 w-12 text-[#5CA4F6] mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Study Tips & Resources</h3>
              <p className="text-gray-600">Discover effective study strategies and learning resources</p>
            </a>
            
            <a href="/feedback" className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100">
              <MessageSquare className="h-12 w-12 text-[#5CA4F6] mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Share Your Feedback</h3>
              <p className="text-gray-600">Help us improve and suggest new features</p>
            </a>
            
            <a href="/auth" className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100">
              <Users className="h-12 w-12 text-[#5CA4F6] mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Join Our Community</h3>
              <p className="text-gray-600">Connect with other students and start learning</p>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#5CA4F6]/10 to-blue-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Stop rereading. Start scrolling your way to better grades.</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of students who are already studying smarter with fypquiz
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-[#5CA4F6] text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-[#5CA4F6]/90 transition-all flex items-center justify-center space-x-2 mx-auto shadow-lg"
          >
            <Award className="h-5 w-5" />
            <span>Generate Your Quiz Free</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-base font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#features" className="block hover:text-[#5CA4F6] transition-colors">Features</a>
                <a href="#how-it-works" className="block hover:text-[#5CA4F6] transition-colors">How it Works</a>
                <a href="/blog" className="block hover:text-[#5CA4F6] transition-colors">Blog</a>
                <a href="/feedback" className="block hover:text-[#5CA4F6] transition-colors">Feedback</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-semibold mb-4">Resources</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="/blog" className="block hover:text-[#5CA4F6] transition-colors">Study Tips</a>
                <a href="/blog" className="block hover:text-[#5CA4F6] transition-colors">Learning Resources</a>
                <a href="/feedback" className="block hover:text-[#5CA4F6] transition-colors">Feature Requests</a>
                <a href="/blog" className="block hover:text-[#5CA4F6] transition-colors">Success Stories</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="/blog" className="block hover:text-[#5CA4F6] transition-colors">About Us</a>
                <a href="/feedback" className="block hover:text-[#5CA4F6] transition-colors">Contact</a>
                <a href="#" className="block hover:text-[#5CA4F6] transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-[#5CA4F6] transition-colors">Terms of Service</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-semibold mb-4">Get Started</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="/auth" className="block hover:text-[#5CA4F6] transition-colors">Sign Up</a>
                <a href="/auth" className="block hover:text-[#5CA4F6] transition-colors">Login</a>
                <a href="/feedback" className="block hover:text-[#5CA4F6] transition-colors">Demo Request</a>
                <a href="/blog" className="block hover:text-[#5CA4F6] transition-colors">Tutorial</a>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Logo size={24} />
              <span className="text-lg font-bold">fypquiz</span>
            </div>
            
            {/* Social Media Links */}
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <a 
                href="https://www.instagram.com/fypquizapp/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-[#5CA4F6] transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.059 1.649-.07 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>
              
              <a 
                href="https://www.tiktok.com/@fypquizapp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-[#5CA4F6] transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 4.2 15.64a6.34 6.34 0 0 0 10.48-4.96v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span>TikTok</span>
              </a>
            </div>
            
            <div className="text-sm text-gray-500">
              © 2024 fypquiz. Helping students focus and learn better.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 
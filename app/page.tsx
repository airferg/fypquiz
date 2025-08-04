'use client'

import { useRouter } from 'next/navigation'
import { Brain, Sparkles, Users, BookOpen, Trophy, ArrowRight, Play, Zap, Target, Award } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-accent" />
          <span className="text-2xl font-bold">fypquiz</span>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#features" className="hover:text-accent transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-accent transition-colors">How it Works</a>
          <button 
            onClick={handleGetStarted}
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90 transition-all flex items-center space-x-2"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/landingpagebackground.mp4" type="video/mp4" />
          </video>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
            <span className="text-white">The
            </span> ADHD Study Solution 
            <br />
            <span className="text-white">For College Students</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your boring study materials into retention-focused quiz experiences with AI-generated commentary
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-accent text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent/90 transition-all flex items-center justify-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Learning</span>
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-all flex items-center justify-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Us?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're not just another study app. We're the ADHD study solution that Gen Z actually wants to use.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
              <Brain className="h-16 w-16 text-accent mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">AI-Powered Study Sets</h3>
              <p className="text-gray-300 text-lg">
                Upload your boring lecture videos, textbooks, or canvas pages, and let our AI create study sets that actually stick in your brain
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
              <Sparkles className="h-16 w-16 text-accent mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">AI-Generated Commentary</h3>
              <p className="text-gray-300 text-lg">
                Get entertained by AI-generated commentary that makes learning fun and engaging
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
              <Users className="h-16 w-16 text-accent mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Retention? Checked.</h3>
              <p className="text-gray-300 text-lg">
                Chaotic edutainment designed for the TikTok generation. No more boring flashcards, we prefer brainrot when we study.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three simple steps to transform your study experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Upload Your Content</h3>
              <p className="text-gray-300 text-lg">
                Upload any PDF, video, or document. Our AI will analyze it and create engaging study sets.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">AI Generates Study Sets</h3>
              <p className="text-gray-300 text-lg">
                Our AI creates engaging study sets with entertaining commentary that makes learning fun
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>  
              <h3 className="text-2xl font-semibold mb-4">Study Without Losing Focus</h3>
              <p className="text-gray-300 text-lg">
                Take the study set, laugh at the commentary, and actually remember what you learned.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">10K+</div>
              <div className="text-gray-300">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">50K+</div>
              <div className="text-gray-300">Quizzes Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-gray-300">Retention Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">4.9/5</div>
              <div className="text-gray-300">Student Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-accent/20 to-purple-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of students who are already studying smarter with fypquiz
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-accent text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent/90 transition-all flex items-center justify-center space-x-2 mx-auto"
          >
            <Award className="h-5 w-5" />
            <span>Click Here to Get Started</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold">fypquiz</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-gray-500">
            © 2024 fypquiz. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 
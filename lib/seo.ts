import { DefaultSeoProps } from 'next-seo'

export const defaultSEO: DefaultSeoProps = {
  titleTemplate: '%s | FYPQuiz',
  defaultTitle: 'FYPQuiz - Best Quiz App for Students | TikTok-Style Study Quizzes',
  description: 'FYPQuiz helps students study smarter by turning notes into TikTok-style quizzes. The best quiz app for Gen Z students. Try it for free.',
  canonical: 'https://fypquiz.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fypquiz.com',
    siteName: 'FYPQuiz',
    title: 'FYPQuiz - Best Quiz App for Students | TikTok-Style Study Quizzes',
    description: 'FYPQuiz helps students study smarter by turning notes into TikTok-style quizzes. The best quiz app for Gen Z students. Try it for free.',
    images: [
      {
        url: 'https://fypquiz.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FYPQuiz - Best Quiz App for Students',
      },
    ],
  },
  twitter: {
    handle: '@fypquiz',
    site: '@fypquiz',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'quiz apps for studying, gen z, college, study tools, quizlet, kahoot, multiple choice, study methods, best study apps, learning app, online e learning platforms, study with app, flashcard digital, apps for studying, how to study for exams, best ways to study, good study habits, studying techniques, gen z years, gen z generation, online platform for learning, language study app, quizletcom, learning app, quizlet app, make a quizlet, best study apps, multiple choice questions, best study methods',
    },
    {
      name: 'author',
      content: 'FYPQuiz',
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.svg',
    },
  ],
}

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: 'FYPQuiz - Best Quiz App for Students | TikTok-Style Study Quizzes',
    description: 'FYPQuiz helps students study smarter by turning notes into TikTok-style quizzes. The best quiz app for Gen Z students. Try it for free.',
    keywords: 'quiz apps for studying, gen z, college, study tools, quizlet, kahoot, multiple choice, study methods, best study apps',
  },
  dashboard: {
    title: 'Dashboard | FYPQuiz - Create Your Study Quizzes',
    description: 'Create TikTok-style study quizzes from your notes. Upload PDFs, videos, or text and generate engaging quizzes instantly.',
    keywords: 'create quiz, study quiz, quiz maker, multiple choice questions, study tools',
  },
  quiz: {
    title: 'Take Quiz | FYPQuiz - Interactive Study Experience',
    description: 'Experience TikTok-style quiz learning with AI-generated commentary. Study smarter with interactive quizzes.',
    keywords: 'take quiz, interactive learning, study experience, multiple choice questions',
  },
  collection: {
    title: 'My Quizzes | FYPQuiz - Study Collection',
    description: 'Access all your created study quizzes. Review and retake quizzes to reinforce learning.',
    keywords: 'my quizzes, study collection, quiz history, learning progress',
  },
  videos: {
    title: 'Choose Background Video | FYPQuiz - Customize Your Study Experience',
    description: 'Select from our library of engaging background videos for your study quizzes. Customize your learning environment.',
    keywords: 'background videos, study environment, quiz customization, learning experience',
  },
} 
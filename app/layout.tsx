import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { DefaultSeo } from 'next-seo'
import { defaultSEO } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FYPQuiz - Best Quiz App for Students | TikTok-Style Study Quizzes',
  description: 'FYPQuiz helps students study smarter by turning notes into TikTok-style quizzes. The best quiz app for Gen Z students. Try it for free.',
  keywords: 'quiz apps for studying, gen z, college, study tools, quizlet, kahoot, multiple choice, study methods, best study apps, learning app, online e learning platforms, study with app, flashcard digital, apps for studying, how to study for exams, best ways to study, good study habits, studying techniques, gen z years, gen z generation, online platform for learning, language study app, quizletcom, learning app, quizlet app, make a quizlet, best study apps, multiple choice questions, best study methods',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17448830764"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17448830764');
            `,
          }}
        />
        {/* Ahrefs Analytics */}
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="bUgcSNd8qR1FY2TljsirxA" async></script>
      </head>
      <body className={inter.className}>
        <DefaultSeo {...defaultSEO} />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 
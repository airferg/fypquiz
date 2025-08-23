import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FYPQuiz - Study Like TikTok',
  description: 'Turn your notes or YouTube videos into fun quizzes with AI voices + Minecraft/Subway Surfers backgrounds. The Gen Z study hack.',
  keywords: 'study like tiktok, gen z study app, quiz app for high school, minecraft parkour studying, subway surfers study hack, study app for teens, fun study app, ai quiz generator, youtube to quiz, study with background music, gen z learning, high school study tools, fun learning app, study hack, focus hack, study while gaming',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://fypquiz.com',
  },
  openGraph: {
    title: 'FYPQuiz - Study Like TikTok',
    description: 'Turn your notes or YouTube videos into fun quizzes with AI voices + Minecraft/Subway Surfers backgrounds. The Gen Z study hack.',
    url: 'https://fypquiz.com',
    siteName: 'FYPQuiz',
    images: [
      {
        url: '/fypquizlogo.png',
        width: 512,
        height: 512,
        alt: 'FYPQuiz logo',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FYPQuiz - Study Like TikTok',
    description: 'Turn your notes or YouTube videos into fun quizzes with AI voices + Minecraft/Subway Surfers backgrounds. The Gen Z study hack.',
    images: ['/fypquizlogo.png'],
    creator: '@fypquiz',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://fypquiz.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/android-chrome-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/android-chrome-512x512.png" type="image/png" sizes="512x512" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5CA4F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FYPQuiz" />
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
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 
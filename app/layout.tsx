import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'fypquiz - AI-Powered Study Quizzes for Gen Z',
  description: 'Transform your study materials into engaging, TikTok-style quiz experiences with AI-generated commentary.',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var ahrefs_analytics_script = document.createElement('script');
              ahrefs_analytics_script.async = true;
              ahrefs_analytics_script.src = 'https://analytics.ahrefs.com/analytics.js';
              ahrefs_analytics_script.setAttribute('data-key', 'bUgcSNd8qR1FY2TljsirxA');
              document.getElementsByTagName('head')[0].appendChild(ahrefs_analytics_script);
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 
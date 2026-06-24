import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import QueryProvider from '@/lib/query-provider'
import { assertEnv } from '@/lib/env'
import './globals.css'

// Validate environment variables at startup — throws in dev, logs in prod
if (typeof window === 'undefined') {
  try { assertEnv() } catch (e) { console.error(e) }
}

export const metadata: Metadata = {
  title: 'Devkalp Foundation — Empowering Communities',
  description: 'Devkalp Foundation works across matrimony, health campaigns, employment, and community volunteering to build stronger communities across India.',
  keywords: 'NGO, matrimony, donation, health, jobs, volunteer, India',
  openGraph: {
    title: 'Devkalp Foundation',
    description: 'Building communities, transforming lives.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#fafaf8]">
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: '"DM Sans", sans-serif',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
            success: { iconTheme: { primary: '#5d9e4c', secondary: 'white' } },
            error: { iconTheme: { primary: '#dc2626', secondary: 'white' } },
          }}
        />
      </body>
    </html>
  )
}

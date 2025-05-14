import Header from '@/components/Header'
import Footer from '@/components/ui/Footer'
import React, { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VoxActive - AI-Powered English Learning Platform',
  description: 'Master English naturally with AI-powered practice. Translate texts, answer questions, and have conversations with AI to improve your fluency.',
  keywords: ['English learning', 'AI language tutor', 'English practice', 'language fluency', 'AI translation'],
  openGraph: {
    title: 'VoxActive - AI-Powered English Learning',
    description: 'Practice and learn English naturally with AI-powered translation, Q&A, and conversation tools.',
    url: 'https://voxactive.huscor.tech',
    siteName: 'VoxActive',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://voxactive.huscor.tech',
  },
}

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="w-full max-w-[85rem] mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
import TalkAI from '@/components/TalkAI'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn English by speaking with AI',
  description: 'Experience advanced AI conversations with our AI',
  openGraph: {
    title: 'Learn English by speaking with AI',
    description: 'Experience advanced AI conversations with our AI',
    url: 'https://voxactive.huscor.tech/learn/talk',
    siteName: 'VoxActive',
    images: [
      {
        url: 'https://voxactive.huscor.tech/ai-avatar.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
}

const page = () => {
  return (
    <TalkAI/>
  )
}

export default page
import QuestionGenerator from '@/components/QuestionGenerator'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn by asking and answering',
  description: 'Learn to ask and answer questions with the help of AI',
  openGraph: {
    title: 'Learn by asking and answering',
    description: 'Learn to ask and answer questions with the help of AI',
    url: 'https://voxactive.huscor.tech/learn/practice',
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
    <div className='mx-5' >
      <QuestionGenerator/>
    </div>
  )
}

export default page
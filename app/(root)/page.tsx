import PanelMock from "@/components/PanelMock";
import { Sparkles } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VoxActive - AI-Powered English Learning Platform",
  description:
    "Master English naturally with AI-powered practice. Translate texts, answer questions, and have conversations with AI to improve your fluency.",
  keywords: [
    "English learning",
    "AI language tutor",
    "English practice",
    "language fluency",
    "AI translation",
  ],
  openGraph: {
    title: "VoxActive - AI-Powered English Learning",
    description:
      "Practice and learn English naturally with AI-powered translation, Q&A, and conversation tools.",
    url: "https://voxactive.huscor.tech",
    siteName: "VoxActive",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://voxactive.huscor.tech",
  },
};

export default function Home() {
  return (
    <div className="w-full min-h-screen  text-white">
      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-28 md:py-36 text-center overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl animate-float animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-zinc-800/50 text-blue-400 text-sm font-medium border border-zinc-700/50 hover:border-blue-500/30 transition-colors">
            <Sparkles className="w-4 h-4" /> AI-Powered English Learning
          </span>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Master English <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Naturally
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-300/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Practice and learn English by asking and answering questions,
            translating texts and engaging in conversation with AI - your path
            to language fluency.
          </p>
        </div>
      </section>

      {/* Features Sections */}
      <div className="space-y-16 pb-20">
        <section className="container mx-auto px-6 w-full">
          <PanelMock
            title="Translation Practice"
            innerText="Instantly translate between your native language and English with AI feedback to improve accuracy and natural phrasing."
            key={"translation_practice"}
            imagePath="/mock/translation_practice.png"
            imageAlt="Translation Practice UI"
          />
        </section>

        <section className="container mx-auto px-6 w-full">
          <PanelMock
            title="Reply to Questions"
            innerText="Improve your question answering skills by responding to various questions in English with AI guidance."
            key={"reply_practice"}
            imagePath="/mock/reply_practice.png"
            imageAlt="Reply to Question Practice UI"
          />
        </section>

        <section className="container mx-auto px-6 w-full">
          <PanelMock
            title="Talk With AI"
            innerText="Prepare for real-life conversations by talking with your AI friend about any topic at any level."
            key={"talk_ai"}
            imagePath="/mock/talk_ai.png"
            imageAlt="Talk With AI UI"
          />
        </section>
      </div>
    </div>
  );
}

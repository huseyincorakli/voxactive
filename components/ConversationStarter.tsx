"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Languages } from '@/lib/constants'
import React from 'react'

type ConversationParams = {
  UserLevel: string;
  Topic: string;
  UserLanguage: string;
}

type ConversationStarterProps = {
  loading: boolean;
  conversationParams: ConversationParams;
  onStart: () => void;
  onParamChange: (params: ConversationParams) => void;
}

const ConversationStarter = ({ 
  loading, 
  conversationParams, 
  onStart, 
  onParamChange 
}: ConversationStarterProps) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 border border-zinc-800/50 shadow-lg shadow-zinc-900/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/60">
        <CardHeader className="border-b border-zinc-800/50 pb-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xl font-semibold text-center bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              Conversation Settings
            </h2>
          </div>
          <p className="text-xs text-center text-zinc-400 mt-1">
            Customize your learning experience
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-300/90">Your Proficiency Level</label>
            <select 
              value={conversationParams.UserLevel}
              onChange={(e) => onParamChange({...conversationParams, UserLevel: e.target.value})}
              className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 hover:border-zinc-600"
            >
              <option value="A1" className="bg-zinc-800">A1 (Beginner)</option>
              <option value="A2" className="bg-zinc-800">A2 (Elementary)</option>
              <option value="B1" className="bg-zinc-800">B1 (Intermediate)</option>
              <option value="B2" className="bg-zinc-800">B2 (Upper Intermediate)</option>
              <option value="C1" className="bg-zinc-800">C1 (Advanced)</option>
              <option value="C2" className="bg-zinc-800">C2 (Proficient)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-300/90">
              Conversation Topic
              <span className="text-xs text-zinc-500 ml-1">(be specific)</span>
            </label>
            <input
              type="text"
              value={conversationParams.Topic}
              onChange={(e) => onParamChange({...conversationParams, Topic: e.target.value})}
              className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 hover:border-zinc-600"
              placeholder="e.g., Italian cuisine, space travel, AI ethics"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-300/90">Your Native Language
            <span className="text-xs text-zinc-500 ml-1">(for mistakes)</span>
            </label>
            <select 
              value={conversationParams.UserLanguage}
              onChange={(e) => onParamChange({...conversationParams, UserLanguage: e.target.value})}
              className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 hover:border-zinc-600"
            >
              {
                Languages.map((language:string)=>(
                  <option key={language} value={language} className="bg-zinc-800">{language}</option>
                ))
              }
            </select>
          </div>

          <Button 
            onClick={onStart}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/40 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="inline-block h-3 w-3 rounded-full bg-white mr-2 animate-pulse" />
                Starting Conversation...
              </span>
            ) : (
              <span className="text-white/95">Start Conversation</span>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-zinc-500">
          Tip: Be specific with topics for better conversations
        </p>
      </div>
    </div>
  )
}

export default ConversationStarter
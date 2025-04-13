"use client"
import AIResponse from '@/components/AIResponse'
import { UserResponse } from '@/components/UserResponse'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Volume2, MessageSquare, Lightbulb } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const TalkAI = () => {
    const [messages, setMessages] = useState([
      {
        id: 1,
        text: "Merhaba! Ben yapay zeka asistanınız. Size nasıl yardımcı olabilirim?",
        isAI: true
      },{
        id: 3,
        text: "Bugün nasıl yardımcı olabilirim?",
        isAI: false
      },
      {
        id: 2,
        text: "Bugün nasıl yardımcı olabilirim?",
        isAI: true
      },
      
    ])
    
    const messagesEndRef = useRef<HTMLDivElement>(null)
  
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  
    useEffect(() => {
      scrollToBottom()
    }, [messages])
  
    return (
      <div className="flex flex-col items-center w-full bg-gradient-to-br p-4">
        <Card className="bg-zinc-900/80 border-zinc-800 text-white w-full h-[70vh] flex flex-col backdrop-blur-sm">
          <CardHeader className="border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl font-semibold">AI Chat Assistant</h2>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800 hover:scrollbar-thumb-zinc-600">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.isAI ? (
                    <>
                      <AIResponse response={message.text} />
                      {message.id === messages.length && (
                        <div className="flex gap-2 mt-2 ml-12">
                          <Button 
                            size="sm" 
                            className="h-8 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-700 gap-1 transition-all hover:shadow-blue-500/30 hover:shadow-md"
                          >
                            <Volume2 size={14} />
                            Sesli Yanıt
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8 text-xs bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-700 gap-1 transition-all hover:shadow-purple-500/30 hover:shadow-md"
                          >
                            <MessageSquare size={14} />
                            Metin Yanıt
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8 text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-700 gap-1 transition-all hover:shadow-amber-500/30 hover:shadow-md"
                          >
                            <Lightbulb size={14} />
                            İpuçları
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <UserResponse message={message.text} />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <div className="p-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 text-center">
              AI asistan bazen hatalı bilgiler verebilir. Önemli konularda lütfen doğrulama yapın.
            </p>
          </div>
        </Card>  
      </div>
    )
}

export default TalkAI
"use client"
import AIResponse from '@/components/AIResponse'
import { UserResponse } from '@/components/UserResponse'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Volume2, MessageSquare, Lightbulb, Send, Type, AlertCircle } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { talkAI } from '@/app/action'

type ConversationParams = {
  UserLevel: string;
  Topic: string;
  UserLanguage: string;
}

const TalkAI = () => {
    const [conversationStarted, setConversationStarted] = useState(false)
    const [conversationParams, setConversationParams] = useState<ConversationParams>({
      UserLevel: "B1",
      Topic: "Foods",
      UserLanguage: "Turkish"
    })
    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [showInput, setShowInput] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const prepareHistory = (messages: any[]) => {
      return messages
        .map(msg => `${msg.isAI ? 'AI' : 'User'}: ${msg.text}`)
        .join('\n');
    };

    const startConversation = async () => {
      setLoading(true)
      try {
        const result = await talkAI({
          UserLevel: conversationParams.UserLevel,
          Topic: conversationParams.Topic,
          UserInput: "Start",
          History: "", 
          UserLanguage: conversationParams.UserLanguage,
          threadId: "session_" + Date.now()
        });

        if (result.data && result.success) {
          setMessages([{
            id: 1,
            text: result.data.AIOutput,
            isAI: true,
            audioBase64: result.data.SpeechOutput?.audioBase64 || null
          }])
          setConversationStarted(true)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    const handleReplyWithText = () => {
      setShowInput(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    }

    const handleSend = async () => {
      if (!input.trim() || loading) return

      setLoading(true)
      
      // Kullanıcı mesajını ekle
      const userMessage = {
        id: Date.now(),
        text: input,
        isAI: false
      }
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setInput("")
      setShowInput(false)

      try {
        // AI'dan yanıt al
        const result = await talkAI({
          UserLevel: conversationParams.UserLevel,
          Topic: conversationParams.Topic,
          UserInput: input,
          History: prepareHistory(updatedMessages),
          UserLanguage: conversationParams.UserLanguage,
          threadId: "user_session_" + Date.now()
        });

        if (result.data && result.success) {
          const aiMessage = {
            id: Date.now() + 1,
            text: result.data.AIOutput,
            isAI: true,
            audioBase64: result.data.SpeechOutput?.audioBase64 || null
          }
          setMessages(prev => [...prev, aiMessage])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

   
    useEffect(() => {
      scrollToBottom()
    }, [messages])

    if (!conversationStarted) {
      return (
        <div className="flex flex-col ">
          <Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800 text-white backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-xl font-semibold text-center">Conversation Settings</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Your level</label>
                <select 
                  value={conversationParams.UserLevel}
                  onChange={(e) => setConversationParams({...conversationParams, UserLevel: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white"
                >
                  <option value="A1">A1 (Beginner)</option>
                  <option value="A2">A2 (Elementary)</option>
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="B2">B2 (Upper Intermediate)</option>
                  <option value="C1">C1 (Advanced)</option>
                  <option value="C2">C2 (Proficient)</option>
                </select>
              </div>
    
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Topic</label>
                <input
                  type="text"
                  value={conversationParams.Topic}
                  onChange={(e) => setConversationParams({...conversationParams, Topic: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white"
                  placeholder="Example: Foods, Travel, Technology"
                />
              </div>
    
             
    
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Your Native Language</label>
                <select 
                  value={conversationParams.UserLanguage}
                  onChange={(e) => setConversationParams({...conversationParams, UserLanguage: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white"
                >
                  <option value="Turkish">Turkish</option>
                </select>
              </div>
    
              <Button 
                onClick={startConversation}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
              >
                {loading ? "Starting..." : "Start a Conversation"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
    const extractErrorCorrection = (text: string) => {
      const match = text.includes("<error-correction>");
      return match;
    };

    const renderMessageContent = (message: any) => {
      const errorCorrection = extractErrorCorrection(message.text);
    
      
      if (errorCorrection) {
        const clearMessage = message.text.replace(/<error-correction>|<\/error-correction>/g, '')
        return (
          <>
            <div className="bg-amber-900/50 border border-amber-700 text-amber-100 p-4 rounded-lg mb-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="flex-shrink-0 mt-0.5 text-amber-300" size={18} />
                <div>
                  <p className="text-sm">{clearMessage}</p>
                </div>
              </div>
            </div>
          </>
        );
      }

      return <AIResponse response={message.text} audioBase64={message.audioBase64} />;
    };

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
                      {renderMessageContent(message)}
                      {message.id === messages[messages.length - 1]?.id && (
                        <>
                          <div className="flex gap-2 mt-2 ml-12">
                            <Button 
                              size="sm" 
                              className="h-8 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-700 gap-1 transition-all hover:shadow-blue-500/30 hover:shadow-md"
                            >
                              <Volume2 size={14} />
                              Reply with Voice
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-8 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-700 gap-1 transition-all hover:shadow-blue-500/30 hover:shadow-md"
                              onClick={handleReplyWithText}
                            >
                              <Type size={14} />
                              Reply with Text
                            </Button>
                          </div>
                          {showInput && message.id === messages[messages.length - 1]?.id && (
                            <div className="flex gap-2 mt-4 ml-12">
                              <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Type your response..."
                                disabled={loading}
                              />
                              <Button 
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white  w-auto h-auto"
                              >
                                <Send size={30} />
                              </Button>
                            </div>
                          )}
                        </>
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
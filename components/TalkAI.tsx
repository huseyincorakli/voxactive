"use client";
import AIResponse from "@/components/AIResponse";
import { UserResponse } from "@/components/UserResponse";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, MessageSquare, Type, Send, Loader2, AlertCircle } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { talkAI } from "@/app/action";
import ConversationStarter from "./ConversationStarter";
import VoiceRecorder, { VoiceRecorderRef } from "./voiceRecorder";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ConversationParams = {
  UserLevel: string;
  Topic: string;
  UserLanguage: string;
};

const TalkAI = () => {
  // State declarations
  const [conversationStarted, setConversationStarted] = useState(false);
  const [conversationParams, setConversationParams] = useState<ConversationParams>({
    UserLevel: "B1",
    Topic: "Foods",
    UserLanguage: "Turkish",
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Refs
  const voiceRecorderRef = useRef<VoiceRecorderRef>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleReplyWithText();
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        toggleVoiceRecording();
      } else if (e.key === 'Escape' && isRecording) {
        e.preventDefault();
        voiceRecorderRef.current?.stopRecording(true);
        setIsRecording(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording]);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      voiceRecorderRef.current?.stopRecording();
      setIsRecording(false);
    } else {
      voiceRecorderRef.current?.startRecording();
      setIsRecording(true);
    }
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle recording complete
  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      setIsRecording(false);
      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.wav");

        const response = await fetch("/api/voice/stt", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Transcription failed");
        }

        if (result.succeded) {
          await handleSend(result.transcript);
        }
      } catch (error) {
        console.error("Transcription error:", error);
      } finally {
        setIsTranscribing(false);
      }
    },
    [conversationParams, messages]
  );

  // Prepare conversation history
  const prepareHistory = (messages: any[]) => {
    return messages
      .map((msg) => `${msg.isAI ? "AI" : "User"}: ${msg.text}`)
      .join("\n");
  };

  // Start conversation
  const startConversation = async () => {
    setLoading(true);
    try {
      const result = await talkAI({
        UserLevel: conversationParams.UserLevel,
        Topic: conversationParams.Topic,
        UserInput: "Start",
        History: "",
        UserLanguage: conversationParams.UserLanguage,
        threadId: "session_" + Date.now(),
      }) as any;

      if (result.data && result.success) {
        setMessages([
          {
            id: 1,
            text: result.data.AIOutput,
            isAI: true,
            audioBase64: result.data.SpeechOutput?.audioBase64 || null,
          },
        ]);
        setConversationStarted(true);
      }
      else{
        toast.error(result?.error?.message)
        if(result.redirect){
          router.push(`/${result.redirect}`)
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show text input
  const handleReplyWithText = () => {
    setInput("");
    setInputValue("");
    setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle send message
  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    setLoading(true);

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isAI: false,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setInput("");
    setInputValue("");
    setShowInput(false);

    try {
      const result = await talkAI({
        UserLevel: conversationParams.UserLevel,
        Topic: conversationParams.Topic,
        UserInput: messageText,
        History: prepareHistory(updatedMessages),
        UserLanguage: conversationParams.UserLanguage,
        threadId: "user_session_" + Date.now(),
      }) as any;

      if (result.data && result.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: result.data.AIOutput,
            isAI: true,
            audioBase64: result.data.SpeechOutput?.audioBase64 || null,
          },
        ]);
      }
      else{
        console.log(result);
        if(!result.success){
          toast.error(result?.error?.message)
          if(result.redirect){
            router.push(`/${result.redirect}`)
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Error correction detection
  const extractErrorCorrection = (text: string) => {
    return text.includes("<error-correction>");
  };

  // Format message content
  const renderMessageContent = (message: any) => {
    const hasErrorCorrection = extractErrorCorrection(message.text);

    if (hasErrorCorrection) {
      const cleanMessage = message.text.replace(/<error-correction>|<\/error-correction>/g, "");
      return (
        <div className="bg-amber-900/50 border border-amber-700 text-amber-100 p-4 rounded-lg mb-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="flex-shrink-0 mt-0.5 text-amber-300" size={18} />
            <div>
              <p className="text-sm">{cleanMessage}</p>
            </div>
          </div>
        </div>
      );
    }

    return <AIResponse userLang={conversationParams.UserLanguage} response={message.text} audioBase64={message.audioBase64} />;
  };

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!conversationStarted) {
    return (
      <div className="w-full p-4">
        <ConversationStarter
          loading={loading}
          conversationParams={conversationParams}
          onStart={startConversation}
          onParamChange={setConversationParams}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full p-2 sm:p-4">
      <div className="text-xs text-zinc-500 mb-2">
        Press <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded">T</kbd> for text,
        <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded ml-1">V</kbd> to {isRecording ? 'send' : 'start voice'}
        {isRecording && <>, <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded ml-1">ESC</kbd> to cancel</>}
      </div>

      <Card className="bg-zinc-900/80 border-zinc-800 text-white w-full h-[80vh] sm:h-[70vh] flex flex-col backdrop-blur-sm">
        <CardHeader className="border-b border-zinc-800 p-3 sm:p-4 sticky top-0 bg-zinc-900/80 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs sm:text-xl font-semibold">Talk With Voxy. Voxy is good friend</h2>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800 hover:scrollbar-thumb-zinc-600">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.isAI ? (
                  <>
                    {renderMessageContent(message)}
                    {message.id === messages[messages.length - 1]?.id && (
                      <div className="flex flex-row sm:flex-row gap-2 mt-2 sm:ml-12">
                        <VoiceRecorder
                          onRecordingComplete={handleRecordingComplete}
                          ref={voiceRecorderRef}
                          showAudio={false}
                        />
                        <Button
                           variant="outline" size="sm" className="h-8 bg-yellow-500 hover:bg-yellow-600 border-none text-white w-36"
                          onClick={handleReplyWithText}
                        >
                          <Type className="h-3 w-3  mr-1" />
                          <span className="text-xs">Reply with Text</span>
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <UserResponse message={message.text} />
                )}
              </div>
            ))}
            {showInput && (
              <div className="relative mt-4 sm:ml-12">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setInput(e.target.value);
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="block w-full pl-10 pr-12 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm sm:text-base placeholder-zinc-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Type your message..."
                  disabled={loading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    className={`p-1 rounded-full ${!input.trim() || loading ? 'text-zinc-500' : 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30'}`}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
            {(isTranscribing || loading) && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalkAI;
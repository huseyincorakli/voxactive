"use client"
import { Volume2, ThumbsUp, ThumbsDown } from "lucide-react";
import React, { useEffect } from "react";
import { Avatar,  AvatarImage } from "@/components/ui/avatar"

const AIResponse = ({ response, audioBase64 }: { response: string, audioBase64: string }) => {
  useEffect(() => {
    if (audioBase64) {
      playAudio(audioBase64);
    }
  }, [audioBase64]);

  const playAudio = (base64: string) => {
    if (!base64) return;
    
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);
    
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.error("Ses çalma hatası:", e));
    
    return () => {
      URL.revokeObjectURL(audioUrl);
    };
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 max-w-2xl text-white p-3 sm:p-6 rounded-lg sm:rounded-xl border border-zinc-700 w-full sm:max-w-2xl shadow-lg">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar - Smaller on mobile */}
        <div className="flex-shrink-0">
          <div className="border border-emerald-400/30 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex justify-center items-center bg-emerald-400/10">
          <Avatar className="h-11 w-12 border-2 border-orange-500">
          <AvatarImage src="/ai-avatar.png" alt="Kullanıcı" />
        </Avatar>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow */}
          <p className="text-zinc-100 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4 break-words">
            {response || "Merhaba! Size nasıl yardımcı olabilirim?"}
          </p>

          {/* Action Buttons - Adjusted spacing for mobile */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => playAudio(audioBase64)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-emerald-400"
              aria-label="Play audio"
              title="Seslendir"
            >
              <Volume2 size={16} className="sm:w-4 sm:h-4" />
            </button>
            
            {/* <div className="flex ml-auto gap-0.5 sm:gap-1">
              <button 
                className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-green-400"
                aria-label="Like"
                title="Beğen"
              >
                <ThumbsUp size={16} className="sm:w-4 sm:h-4" />
              </button>
              <button 
                className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-rose-400"
                aria-label="Dislike"
                title="Beğenme"
              >
                <ThumbsDown size={16} className="sm:w-4 sm:h-4" />
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResponse;
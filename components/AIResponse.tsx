"use client"
import { Volume2, ThumbsUp, ThumbsDown } from "lucide-react";
import React, { useEffect } from "react";

const AIResponse = ({ response, audioBase64 }: { response: string, audioBase64: string }) => {
  useEffect(() => {
    // Sadece yeni yanıt geldiğinde ve audioBase64 varsa otomatik çal
    if (audioBase64) {
      playAudio(audioBase64);
    }
  }, [audioBase64]); // Sadece audioBase64 değiştiğinde tetiklenir

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
    
    // Temizlik fonksiyonu
    return () => {
      URL.revokeObjectURL(audioUrl);
    };
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-6 rounded-xl border border-zinc-700 max-w-2xl shadow-lg">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="border border-emerald-400/30 rounded-full w-10 h-10 flex justify-center items-center bg-emerald-400/10">
            <span className="font-medium text-emerald-400">AI</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-zinc-100 leading-relaxed mb-4">
            {response || "Merhaba! Size nasıl yardımcı olabilirim?"}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => playAudio(audioBase64)}
              className="p-2 rounded-full hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-emerald-400"
              aria-label="Play audio"
              title="Seslendir"
            >
              <Volume2 size={18} />
            </button>
            
            <div className="flex ml-auto gap-1">
              <button className="p-2 rounded-full hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-green-400">
                <ThumbsUp size={18} />
              </button>
              <button className="p-2 rounded-full hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-rose-400">
                <ThumbsDown size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResponse;
"use client";
import { talkAI } from '@/app/action';
import React, { useState } from 'react';

const Deneme = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    
    try {
      const result = await talkAI({
        userLevel: "B1",
        topic: "Food",
        targetGrammarTopic: "Present Perfect",
        userInput: "I have eaten pizza",
        userLanguage: "Turkish",
        history: "",
        threadId: "test_thread_123"
      });
      
      if (result.success) {
        setResponse(result.data);
        
        // Base64'ü Blob'a çevir
        if (result.data.SpeechOutput?.audioBase64) {
          const byteCharacters = atob(result.data.SpeechOutput.audioBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'audio/mpeg' });
          setAudioUrl(URL.createObjectURL(blob));
        }
      } else {
        setError(result.error?.message);
      }
    } catch (err) {
      setError("API çağrısı başarısız");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <button 
        onClick={handleClick}
        disabled={loading}
        className={`px-4 py-2 rounded-md text-white ${
          loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'İşleniyor...' : 'Test Et'}
      </button>

      {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {response && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-bold">Yanıt:</h3>
            <p>{response.AIOutput}</p>
            {response.GrammarCorrection && (
              <div className="mt-2 p-2 bg-yellow-50">
                <p className="font-semibold">Düzeltme:</p>
                <div dangerouslySetInnerHTML={{ __html: response.GrammarCorrection }} />
              </div>
            )}
          </div>

          {audioUrl && (
            <button 
              onClick={playAudio}
              className="px-3 py-1 bg-green-500 text-white rounded-md"
            >
              Sesli Yanıtı Oynat
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Deneme;
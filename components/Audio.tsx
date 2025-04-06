"use client";
import { useState, useRef, useEffect } from 'react';

export enum Models {
    AMERICAN_FEMALE = 'aura-asteria-en',
    BRITISH_FEMALE = 'aura-athena-en',
    AMERICAN_MALE = 'aura-arcas-en',
    BRITISH_MALE = 'aura-helios-en'
}

export default function AudioPlayer({ text, title }: { text: string, title?: string }) {
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [playbackRate, setPlaybackRate] = useState<number>(1.0);
    const [selectedModel, setSelectedModel] = useState<Models>(Models.AMERICAN_FEMALE);
    
    const audioRef = useRef<HTMLAudioElement>(null);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
        };
        
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateTime);
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('ended', () => setIsPlaying(false));
        
        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateTime);
            audio.removeEventListener('play', () => setIsPlaying(true));
            audio.removeEventListener('pause', () => setIsPlaying(false));
            audio.removeEventListener('ended', () => setIsPlaying(false));
        };
    }, [audioUrl]);
    
    const generateSpeech = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/voice/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text,
                    model: selectedModel 
                }),
            });
            
            const audioBlob = await response.blob();
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;
        
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    };
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };
    
    const handleSpeedChange = (speed: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        
        setPlaybackRate(speed);
        audio.playbackRate = speed;
    };
    
    const handleModelChange = (model: Models) => {
        setSelectedModel(model);
        // Clear existing audio when changing model
        if (audioUrl) {
            setAudioUrl('');
        }
    };
    
    // Helper function to get friendly name for model
    const getModelDisplayName = (model: Models): string => {
        switch (model) {
            case Models.AMERICAN_FEMALE:
                return 'American Female';
            case Models.BRITISH_FEMALE:
                return 'British Female';
            case Models.AMERICAN_MALE:
                return 'American Male';
            case Models.BRITISH_MALE:
                return 'British Male';
            default:
                return 'Unknown';
        }
    };
    
    return (
        <div className="text-white p-4 my-4 max-w-md">
            {title && (
                <div className="flex items-center mb-2">
                    <div className="bg-green-500 text-black rounded p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="font-bold">{title}</div>
                </div>
            )}
            
            {/* Voice Model Selection */}
            <div className="mb-3 bg-gray-800 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2">
                    {Object.values(Models).map((model) => (
                        <button
                            key={model}
                            onClick={() => handleModelChange(model)}
                            className={`text-xs px-3 py-2 rounded-md transition-colors ${
                                selectedModel === model 
                                    ? 'bg-purple-700 text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {getModelDisplayName(model)}
                        </button>
                    ))}
                </div>
            </div>
            
            {isLoading ? (
                <div className="bg-gray-800 rounded-full p-3 flex items-center justify-center">
                    <div className="text-white text-sm">Generating...</div>
                </div>
            ) : audioUrl ? (
                <div className="flex flex-col gap-2">
                    <div className="bg-purple-700 rounded-full p-2 flex items-center">
                        <button 
                            onClick={handlePlayPause} 
                            className="w-8 h-8 flex items-center justify-center text-white rounded-full hover:bg-gray-700 focus:outline-none"
                        >
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                        
                        <div className="text-xs text-white mx-2">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                        
                        <input 
                            type="range" 
                            min="0" 
                            max={duration || 0} 
                            value={currentTime} 
                            step="0.01"
                            onChange={handleSliderChange}
                            className="flex-grow mx-2 h-1 bg-white rounded-full appearance-none cursor-pointer"
                        />
                        
                        <audio ref={audioRef} src={audioUrl} preload="metadata" />
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-800 rounded-full p-2">
                        <span className="text-xs ml-2">Hız:</span>
                        <div className="flex space-x-1">
                            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`text-xs px-2 py-1 rounded-full ${
                                        playbackRate === speed ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {speed === 1.0 ? 'Normal' : speed + 'x'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={generateSpeech}
                    className="bg-green-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Generate Speech
                </button>
            )}
        </div>
    );
}
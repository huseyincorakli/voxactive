import { TooltipProvider } from "./ui/tooltip";
import { WordBadge } from "./WordBadge";
import { useState, useEffect } from "react";

export const DisplayQuestion = ({ htmlContent,questionType,userlang }: { htmlContent: any,questionType:string,userlang:string }) => {
    const [translatedWords, setTranslatedWords] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    const extractText = (html:any) => {
        if (!html) return { textContent: '', words: [] };
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        const words = textContent.split(/\s+/).filter(word => word.length > 0);
        
        return { textContent, words };
    };
    
    const { textContent, words } = extractText(htmlContent);

    useEffect(() => {
        if (!htmlContent || !words.length || isLoading) return;

        let isMounted = true;
        
        const fetchTranslations = async () => {
            setIsLoading(true);
            
            try {
                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ word: textContent,userlang:userlang}),
                });
                
                const data = await response.json();
                
                if (isMounted) {
                    if (data.success && data.response && data.response.translation) {
                        setTranslatedWords(data.response.translation);
                    }
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Translation error:', error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        
        fetchTranslations();
        
        return () => {
            isMounted = false;
        };
    }, [htmlContent]);

    if (!htmlContent) return null;
    

    return (
        <TooltipProvider>
            <div className="flex flex-wrap">
                {words.map((word, index) => {
                    const cleanWord = word.replace(/[.,;:!?""''\(\)]/g, '');
                    
                    const translations = translatedWords[word] || translatedWords[cleanWord] || [];
                    
                    return (
                        <WordBadge 
                            key={index} 
                            word={word} 
                            index={index} 
                            word_translate={translations}
                            isLoading={isLoading}
                        />
                    );
                })}
            </div>
        </TooltipProvider>
    );
};
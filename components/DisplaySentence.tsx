import { TooltipProvider } from "./ui/tooltip";
import { SentenceBadge } from "./SentenceBadge";
import { useState, useEffect } from "react";

export const DisplaySentence = ({ 
    htmlContent, 
    questionType, 
    userlang 
}: { 
    htmlContent: any, 
    questionType: string, 
    userlang: string 
}) => {
    const [translatedSentences, setTranslatedSentences] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    const extractSentences = (html: any) => {
        if (!html) return { textContent: '', sentences: [] };
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        
        // Basic sentence splitting
        const sentences = textContent.split(/(?<=[.!?])\s+/).filter(sentence => sentence.length > 0);
        
        return { textContent, sentences };
    };
    
    const { textContent, sentences } = extractSentences(htmlContent);

    useEffect(() => {
        if (!htmlContent || !sentences.length || isLoading) return;

        let isMounted = true;
        
        const fetchTranslations = async () => {
            setIsLoading(true);
            
            try {
                const response = await fetch('/api/translate-s', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        sentences: sentences,
                        userlang: userlang 
                    }),
                });
                
                const data = await response.json();
                
                if (isMounted) {
                    if (data.success && data.response && data.response.translations) {
                        setTranslatedSentences(data.response.translations);
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
            <div className="flex flex-wrap gap-2">
                {sentences.map((sentence, index) => {
                    const cleanSentence = sentence.replace(/\s+/g, ' ').trim();
                    const translations = translatedSentences[sentence] || translatedSentences[cleanSentence] || [];
                    
                    // Alternate between two colors
                    const colorClass = index % 2 === 0 
                        ? "bg-blue-100 hover:bg-blue-200 border-blue-300" 
                        : "bg-green-100 hover:bg-green-200 border-green-300";
                    
                    return (
                        <SentenceBadge 
                            key={index} 
                            sentence={sentence} 
                            index={index} 
                            sentence_translate={translations}
                            isLoading={isLoading}
                            colorClass={colorClass}
                        />
                    );
                })}
            </div>
        </TooltipProvider>
    );
};
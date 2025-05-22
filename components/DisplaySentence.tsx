import { TooltipProvider } from "./ui/tooltip";
import { SentenceBadge } from "./SentenceBadge";
import { useState, useEffect } from "react";

export const DisplaySentence = ({
  htmlContent,
  questionType,
  userlang,
  fontSize,
}: {
  htmlContent: any;
  questionType: string;
  userlang: string;
  fontSize?: string;
}) => {
  const [translatedSentences, setTranslatedSentences] = useState<
    Record<string, string[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  const extractSentences = (html: any) => {
    if (!html) return { textContent: "", sentences: [] };

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText;

    // Basic sentence splitting
    const sentences = textContent
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => sentence.length > 0);

    return { textContent, sentences };
  };

  const { textContent, sentences } = extractSentences(htmlContent);

  // Normalize function to handle whitespace differences
  const normalizeText = (text: string) => {
    return text.replace(/\s+/g, " ").trim();
  };

  // Function to calculate string similarity
  const calculateSimilarity = (str1: string, str2: string) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 1;

    // Simple character-by-character comparison
    let matches = 0;
    const minLen = Math.min(len1, len2);

    for (let i = 0; i < minLen; i++) {
      if (str1[i] === str2[i]) matches++;
    }

    return matches / maxLen;
  };

  // Function to find best matching translation key
  const findBestMatch = (sentence: string, availableKeys: string[]) => {
    const normalizedSentence = normalizeText(sentence.toLowerCase());

    // First try exact match
    const exactMatch = availableKeys.find(
      (key) => normalizeText(key.toLowerCase()) === normalizedSentence
    );
    if (exactMatch) return exactMatch;

    // Then try similarity matching
    let bestMatch = "";
    let bestScore = 0;

    availableKeys.forEach((key) => {
      const normalizedKey = normalizeText(key.toLowerCase());
      const score = calculateSimilarity(normalizedSentence, normalizedKey);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = key;
      }
    });

    // Return match if similarity is above 80%
    return bestScore > 0.8 ? bestMatch : null;
  };

  useEffect(() => {
    if (!htmlContent || !sentences.length || isLoading) return;

    let isMounted = true;

    const fetchTranslations = async () => {
      setIsLoading(true);

      // Normalize sentences before sending to API
      const normalizedSentences = sentences.map(normalizeText);

      try {
        const response = await fetch("/api/translate-s", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sentences: normalizedSentences, // Send normalized sentences
            userlang: userlang,
          }),
        });

        const data = await response.json();
        console.log("Translation response:", data);
        if (!data.success) {
          setApiMessage(data.error.message);
        }

        if (isMounted) {
          if (data.success && data.response && data.response.translations) {
            // Store translations with normalized keys
            const normalizedTranslations: Record<string, string[]> = {};

            Object.entries(data.response.translations).forEach(
              ([key, value]) => {
                const normalizedKey = normalizeText(key);
                normalizedTranslations[normalizedKey] = value as string[];
              }
            );

            setTranslatedSentences(normalizedTranslations);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Translation error:", error);
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
          const availableKeys = Object.keys(translatedSentences);
          const matchingKey = findBestMatch(sentence, availableKeys);
          const translations = matchingKey
            ? translatedSentences[matchingKey]
            : [];

          const colorClass =
            index % 2 === 0
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
              fontSize={fontSize}
              message={apiMessage}
            />
          );
        })}
      </div>
    </TooltipProvider>
  );
};

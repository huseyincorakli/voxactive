"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

type PronunciationScoreProps = {
  scoreData: {
    real_transcript: string;
    ipa_transcript: string;
    pronunciation_accuracy: string;
    real_transcripts: string;
    matched_transcripts: string;
    real_transcripts_ipa: string;
    matched_transcripts_ipa: string;
    pair_accuracy_category: string;
    start_time: string;
    end_time: string;
    is_letter_correct_all_words: string;
  } | null;
};

export function PronunciationFeedback({ scoreData }: PronunciationScoreProps) {
  const [wordBreakdown, setWordBreakdown] = useState<
    {
      targetWord: string;
      userWord: string;
      accuracy: number;
      isCorrect: boolean[];
    }[]
  >([]);

  useEffect(() => {
    if (!scoreData) return;

    // Parse the pair accuracy categories
    const accuracyCategories = scoreData.pair_accuracy_category
      .split(" ")
      .map(Number);

    // Split the target phrase and what the user actually said
    const targetWords = scoreData.matched_transcripts.split(" ");
    const userWords = scoreData.real_transcripts.split(" ");
    const correctnessData = scoreData.is_letter_correct_all_words
      .trim()
      .split(" ");

    // Create word breakdown
    const breakdown = targetWords.map((targetWord, index) => {
      // Find corresponding user word if available
      const userWord = index < userWords.length ? userWords[index] : "";

      let isCorrectArray: boolean[] = [];

      // Only try to get correctness data if it exists for this index
      if (index < correctnessData.length && correctnessData[index]) {
        isCorrectArray = correctnessData[index]
          .split("")
          .map((char) => char === "1");
      }

      // Calculate word accuracy (percentage of correct letters)
      const correctCount = isCorrectArray.filter((val) => val).length;
      const accuracy =
        isCorrectArray.length > 0
          ? (correctCount / isCorrectArray.length) * 100
          : 0;

      return {
        targetWord,
        userWord,
        accuracy,
        isCorrect: isCorrectArray,
      };
    });

    setWordBreakdown(breakdown);
  }, [scoreData]);

  if (!scoreData) return null;

  const accuracyScore = parseInt(scoreData.pronunciation_accuracy);

  // Determine feedback based on accuracy score
  const getFeedbackMessage = (score: number) => {
    if (score >= 90)
      return (
        <p className="text-green-500 text-sm sm:text-base font-bold">
          Excellent pronunciation!
        </p>
      );
    if (score >= 75)
      return (
        <p className="text-blue-500 text-sm sm:text-base font-bold">
          Good job! Keep practicing.
        </p>
      );
    if (score >= 60)
      return (
        <p className="text-yellow-500 text-sm sm:text-base font-bold">
          Not bad, but needs improvement.
        </p>
      );
    return (
      <p className="text-red-500 text-sm sm:text-base font-bold">
        Keep practicing to improve your pronunciation.
      </p>
    );
  };

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Progress bar color
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="mt-2 bg-zinc-900 rounded-lg p-3 sm:p-4 border-l-4 border-indigo-500 shadow-md">
      {/* Score section - flex column on mobile, row on larger screens */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <div className={`text-lg font-bold ${getScoreColor(accuracyScore)}`}>
            {accuracyScore}%
          </div>
          <div className="h-5 w-full sm:w-48 md:w-64 lg:w-80 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(
                accuracyScore
              )} transition-all duration-300`}
              style={{ width: `${accuracyScore}%` }}
            />
          </div>
        </div>
        {getFeedbackMessage(accuracyScore)}
      </div>

      {/* Word breakdown section */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          Word Breakdown
        </h4>
        <div className="flex flex-wrap gap-2">
          {wordBreakdown.map((item, idx) => (
            <div
              key={idx}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors ${
                item.accuracy === 100
                  ? "bg-green-600/20 border border-green-600/40"
                  : item.accuracy >= 75
                  ? "bg-blue-600/20 border border-blue-600/40"
                  : item.accuracy >= 50
                  ? "bg-yellow-600/20 border border-yellow-600/40"
                  : "bg-red-600/20 border border-red-600/40"
              }`}
            >
              <div className="flex items-center gap-1">
                <div className="text-sm">
                  {item.targetWord.split("").map((letter, i) => (
                    <span
                      key={i}
                      className={
                        i < item.isCorrect.length && item.isCorrect[i]
                          ? "text-white"
                          : "text-red-400"
                      }
                    >
                      {letter}
                    </span>
                  ))}
                </div>
                {item.accuracy === 100 && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
              {item.userWord !== item.targetWord && (
                <div className="text-xs text-gray-400 mt-1">
                  {item.userWord || "(söylenmedi)"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recording details section */}
      <div className="pt-2 text-xs text-gray-400 border-t border-zinc-700 mt-4 space-y-2 sm:space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-medium">Your recording:</span>
          <span className="break-words">{scoreData.real_transcript}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-medium">Target phrase:</span>
          <span className="break-words">{scoreData.real_transcripts}</span>
        </div>
      </div>
    </div>
  );
}

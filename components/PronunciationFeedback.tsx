"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Progress } from "./ui/progress";

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
        targetWord, // The target word from matched_transcripts
        userWord, // The corresponding user word from real_transcripts
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
    if (score >= 90) return "Excellent pronunciation!";
    if (score >= 75) return "Good job! Keep practicing.";
    if (score >= 60) return "Not bad, but needs improvement.";
    return "Keep practicing to improve your pronunciation.";
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
    <div className="mt-2 bg-zinc-900 rounded-lg p-4 border-l-4 border-indigo-500 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
          Pronunciation Score
        </h3>
        <div className={`text-2xl font-bold ${getScoreColor(accuracyScore)}`}>
          {accuracyScore}%
        </div>
      </div>

      <Progress
        value={accuracyScore}
        className="h-2 mt-0"
        indicatorClassName={getProgressColor(accuracyScore)}
      />

      <p className="text-gray-300 text-sm">
        {getFeedbackMessage(accuracyScore)}
      </p>

      <div className="mt-2">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">
          Word Breakdown
        </h4>
        <div className="flex flex-wrap gap-2">
          {wordBreakdown.map((item, idx) => (
            <div
              key={idx}
              className={`px-3 py-1 rounded border ${
                item.accuracy === 100
                  ? "border-green-600 bg-green-600/20"
                  : item.accuracy >= 75
                  ? "border-blue-600 bg-blue-600/20"
                  : item.accuracy >= 50
                  ? "border-yellow-600 bg-yellow-600/20"
                  : "border-red-600 bg-red-600/20"
              }`}
            >
              <div className="text-sm font-medium">
                <div className="flex flex-col">
                  <div>
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
                  {item.userWord !== item.targetWord && (
                    <div className="text-xs text-gray-400 mt-1">
                      {item.userWord || "(söylenmedi)"}
                    </div>
                  )}
                </div>
              </div>
              {item.accuracy === 100 ? (
                <div className="flex items-center justify-center mt-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 text-xs text-gray-400 border-t border-zinc-700 mt-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Your recording:</span>
          <span>{scoreData.real_transcript}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold">Target phrase:</span>
          <span>{scoreData.real_transcripts}</span>
        </div>
      </div>
    </div>
  );
}

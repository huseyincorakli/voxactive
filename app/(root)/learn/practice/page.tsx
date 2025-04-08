"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Text, RefreshCw } from "lucide-react";
import { AnalyzeQuestion, analyzeQuestion, analyzeResponse, generateQuestion, generateResponseQuestion } from "@/app/action";
import VoiceRecorder, { VoiceRecorderRef } from "@/components/voiceRecorder";
import { toast } from "sonner";
import TipsDrawer from "@/components/TipsDrawer";
import { DisplayQuestion } from "@/components/DisplayQuestion";
import ShowAnalyse from "@/components/ShowAnalyse";
import QuestionForm from "@/components/QuestionForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { debounce } from "lodash";

export type QuestionType = "translation" | "response";

export default function QuestionGenerator() {
  // State declarations
  const [question, setQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [questionType, setQuestionType] = useState<QuestionType>("translation");
  const [formData, setFormData] = useState({
    userLevel: "A1",
    topic: "General",
    targetGrammarTopic: "Simple Present Tense",
    difficulty: "EASY",
    userLanguage: "Turkish",
  });
  const [title, setTitle] = useState<string>("In this context, your task is to translate the text created in your own language into English");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showText, setShowText] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const voiceRecorderRef = useRef<VoiceRecorderRef>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranscribed, setIsTranscribed] = useState(false);
  const [tips, setTips] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);
  const [lastAnalyzedKey, setLastAnalyzedKey] = useState<string | null>(null);

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setAudioBlob(blob);
    setIsTranscribed(false);
    setTranscriptionError(null);
    // Don't reset transcript here as it clears the textarea prematurely
  }, []);

  const handleReset = useCallback(() => {
    setPreviousQuestions([]);
    setQuestion(null);
    setTips(null);
    setAudioBlob(null);
    setTranscript("");
    setShowText(false);
    setLastAnalyzedKey(null);
    setAnalysisResult(null);
    toast.success("History reset successfully");
  }, []);

  const handleTranscript = useCallback(async () => {
    if (!audioBlob) return;
    
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await fetch('/api/voice/stt', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Transcription failed');
      }

      if (result.succeded) {
        // Update transcript state and also update the textarea directly
        setTranscript(result.transcript);
        if (textareaRef.current) {
          textareaRef.current.value = result.transcript;
        }
        setShowText(true);
        setIsTranscribed(true);
        // Reset analysis state when a new transcript is received
        setLastAnalyzedKey(null);
        setAnalysisResult(null);
      } else {
        setTranscriptionError(result.message || 'Transcription failed');
      }
    } catch (error: any) {
      console.error('Error transcribing audio:', error);
      setTranscriptionError(error.message || 'Ses dönüştürme sırasında bir hata oluştu');
    } finally {
      setIsTranscribing(false);
    }
  }, [audioBlob]);

  // Debounced transcript update
  const debouncedSetTranscript = useCallback(
    debounce((value: string) => {
      setTranscript(value);
      if (lastAnalyzedKey) {
        setLastAnalyzedKey(null);
        setAnalysisResult(null);
      }
    }, 400),
    [lastAnalyzedKey]
  );

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Update transcript state with the new value
    debouncedSetTranscript(value);
  };

  const handleAnalyze = useCallback(async () => {
    if (!textareaRef.current) return;
    
    const userAnswer = textareaRef.current.value;
    if (!userAnswer) {
      toast.error("Please enter your answer before analyzing.");
      return;
    }
    if (!question) {
      toast.error("Please generate a question before analyzing.");
      return;
    }

    const analysisKey = `${question}:${userAnswer}`;
    if (lastAnalyzedKey === analysisKey && analysisResult) {
      setIsAnalysisDrawerOpen(true);
      return;
    }

    setAnalysing(true);
    try {
      const AnalyzeQuestionData: AnalyzeQuestion = {
        generatedQuestion: question,
        userResponse: userAnswer,
        userLevel: formData.userLevel,
        userLanguage: formData.userLanguage
      };

      const response = questionType === "translation" 
        ? await analyzeQuestion(AnalyzeQuestionData)
        : await analyzeResponse(AnalyzeQuestionData);

      if (response) {
        setAnalysisResult(response);
        setLastAnalyzedKey(analysisKey);
        setIsAnalysisDrawerOpen(true);
        toast.success("Analysis completed!");
      } else {
        toast.error("Failed to analyze response");
      }
    } catch (error) {
      console.error("Error analyzing answer:", error);
      toast.error("Error analyzing your answer. Please try again.");
    } finally {
      setAnalysing(false);
    }
  }, [question, formData, lastAnalyzedKey, analysisResult, questionType]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAudioBlob(null);
    setTranscript("");
    setShowText(false);
    setIsTranscribed(false);
    setTranscriptionError(null);
    setLastAnalyzedKey(null);
    setAnalysisResult(null);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    if (question) {
      formDataObj.append("previousQuestion", question);
    }
    formDataObj.append("previousQuestions", JSON.stringify(previousQuestions));

    try {
      const result = questionType === "translation"
        ? await generateQuestion(formDataObj)
        : await generateResponseQuestion(formDataObj);

      if (!result.success) {
        toast.error(result.message?.error?.message || "An error occurred");
        return;
      }

      setQuestion(result.data);
      setTips(result.tips);
      
      if (result.data) {
        setPreviousQuestions(prev => [...prev, result.data].slice(-10)); // Keep only last 10 questions
      }
    } catch (error) {
      console.error("Error generating question:", error);
      toast.error("Failed to generate question");
    } finally {
      setIsLoading(false);
    }
  }, [formData, question, previousQuestions, questionType]);

  const handleChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setQuestion(null);
    setTips(null);
    setTranscript("");
    setShowText(false);
    setLastAnalyzedKey(null);
    setAnalysisResult(null);
  }, []);

  const handleQuestionTypeChange = useCallback((value: QuestionType) => {
    setQuestionType(value);
    setTitle(value === "translation" 
      ? "In this context, your task is to translate the text created in your own language into English" 
      : "In this context, your task is to answer the question posed in English in English");
    setQuestion(null);
    setTips(null);
    setTranscript("");
    setShowText(false);
    setLastAnalyzedKey(null);
    setAnalysisResult(null);
  }, []);

  // Effect for warning about long history
  useEffect(() => {
    if (previousQuestions.join().length > 1000) {
      toast.warning(
        "Question history is getting long. This might affect the system's performance and memory usage. Consider resetting the history.",
        {
          duration: 6000,
          action: {
            label: "Reset Now",
            onClick: handleReset
          }
        }
      );
    }
  }, [previousQuestions, handleReset]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetTranscript.cancel();
    };
  }, [debouncedSetTranscript]);

  return (
    <div className="text-white">
      <ShowAnalyse 
        isOpen={isAnalysisDrawerOpen} 
        onClose={() => setIsAnalysisDrawerOpen(false)} 
        analysisResult={analysisResult} 
      />

      <div className="container mx-auto py-10 px-4">
        <Card className="text-3xl font-bold mb-10 text-center">
          <p className="text-2xl p-4">{title}</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Side */}
          <Card className="bg-zinc-900 border-zinc-800 text-white h-fit">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl">Set Question Parameters</CardTitle>
                <p className="text-sm text-zinc-400 mt-1">
                  Fill in the fields below to generate a question suitable for your level and needs
                </p>
              </div>
              <div className="flex space-x-2">
                {previousQuestions.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
                    onClick={handleReset}
                    title="Reset question history"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset History
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Question Type
                </label>
                <Select 
                  value={questionType} 
                  onValueChange={handleQuestionTypeChange}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="translation">Translation Question</SelectItem>
                    <SelectItem value="response">Response Question</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500 mt-1">
                  {questionType === "translation" 
                    ? "Generate questions for translation practice" 
                    : "Generate questions for answering practice"}
                </p>
              </div>
              <QuestionForm 
                formData={formData} 
                handleChange={handleChange} 
                handleSubmit={handleSubmit} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>

          {/* Question Display Side */}
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              {question && (
                <div className="flex flex-wrap gap-2">
                  <VoiceRecorder 
                    onRecordingComplete={handleRecordingComplete} 
                    ref={voiceRecorderRef} 
                    key={audioBlob ? "recording" : "empty"} 
                  />
                  {audioBlob && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 bg-zinc-700 hover:bg-zinc-600 border-none"
                      onClick={handleTranscript}
                      disabled={isTranscribing || isTranscribed}
                    >
                      {isTranscribing ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          <span>Transcribing...</span>
                        </>
                      ) : isTranscribed ? (
                        "Transcribed"
                      ) : (
                        "Transcript"
                      )}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 bg-zinc-700 hover:bg-zinc-600 border-none text-white"
                    onClick={() => setShowText(!showText)}
                  >
                    <Text className="h-3 w-3 mr-1" />
                    <span className="text-xs">Reply with Text</span>
                  </Button>
                  {tips && (
                    <TipsDrawer 
                      markdownContent={tips} 
                      title={questionType === "translation" 
                        ? "✨💡🌟 TRANSLATION TIPS ✨💡🌟" 
                        : "✨💡🌟 ANSWER TIPS ✨💡🌟"} 
                      triggerButton={
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 bg-zinc-700 hover:bg-zinc-600 border-none text-white"
                        >
                          Show Tips
                        </Button>
                      } 
                    />
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {question ? (
                <div className="bg-white rounded-md p-2 text-black min-h-[100px] max-h-[600px] overflow-y-auto">
                  <DisplayQuestion 
                    htmlContent={question} 
                    questionType={questionType} 
                    userlang={formData.userLanguage} 
                  />
                </div>
              ) : (
                <div className="bg-zinc-800 rounded-md p-2 text-zinc-400 min-h-[400px] flex items-center justify-center">
                  <p className="text-center">
                    {questionType === "translation" 
                      ? "Your translation question will appear here" 
                      : "Your question to answer will appear here"}
                  </p>
                </div>
              )}
            </CardContent>

            {showText && (
              <CardFooter>
                <div className="grid w-full gap-4">
                  <Textarea 
                    placeholder={questionType === "translation" 
                      ? "Type your translation here." 
                      : "Type your answer here."}
                    defaultValue={transcript}
                    onChange={handleTextareaChange}
                    ref={textareaRef}
                    className="min-h-[150px]"
                  />
                  {transcriptionError && (
                    <p className="text-red-500 text-sm">{transcriptionError}</p>
                  )}
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={analysing}
                    className={lastAnalyzedKey ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {analysing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : lastAnalyzedKey && analysisResult ? (
                      "Show Analysis Results"
                    ) : (
                      "Analyze it"
                    )}
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
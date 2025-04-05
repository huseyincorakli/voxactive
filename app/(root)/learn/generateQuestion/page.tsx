"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Text, RefreshCw } from "lucide-react";
import { AnalyzeQuestion, analyzeQuestion, generateQuestion } from "@/app/action";
import VoiceRecorder, { VoiceRecorderRef } from "@/components/voiceRecorder";
import { toast } from "sonner";
import TipsDrawer from "@/components/TipsDrawer";
import { DisplayQuestion } from "@/components/DisplayQuestion";
import ShowAnalyse from "@/components/ShowAnalyse";

export default function QuestionGenerator() {
    const [question, setQuestion] = useState(null);
    const [processedQuestion, setProcessedQuestion] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysing, setAnalysing] = useState(false);
    const [formData, setFormData] = useState({
        userLevel: "C1",
        topic: "General",
        targetGrammerTopic: "Simple Present Tense",
        difficulty: "EXPERT",
        userLanguage: "Turkish",
    });
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [showText, setShowText] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string | null>(null);
    const voiceRecorderRef = useRef<VoiceRecorderRef>(null);
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isTranscribed, setIsTranscribed] = useState(false);
    const [tips, setTips] = useState(null)
    const textareaRef = useRef(null);
    const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);
    const [lastAnalyzedKey, setLastAnalyzedKey] = useState<string | null>(null);

    const handleRecordingComplete = (blob: Blob) => {
        setAudioBlob(blob);
        setIsTranscribed(false);
        console.log("Recording completed:", blob);
    };

    const handleReset = () => {
        setPreviousQuestions([]);
        setQuestion(null);
        setTips(null);
        setAudioBlob(null);
        setTranscript(null);
        setShowText(false);
        if (textareaRef.current) {
            (textareaRef.current as any).value = "";
        }
        toast.success("History reset successfully");
    };

    const handleTranscript = async () => {
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
                setTranscript(result.transcript);
                setShowText(true);
                setIsTranscribed(true);
            } else {
                setTranscriptionError(result.message || 'Transcription failed');
            }

        } catch (error: any) {
            console.error('Error transcribing audio:', error);
            setTranscriptionError(error.message || 'Ses dönüştürme sırasında bir hata oluştu');
        } finally {
            setIsTranscribing(false);
        }
    };


    const handleAnalyze = async () => {
        if (textareaRef.current) {
            const userAnswer = (textareaRef?.current as any).value;
            if (!userAnswer) {
                toast.error("Please enter your answer before analyzing.");
                return;
            }
            if (!question) {
                toast.error("Please generate a question before analyzing.");
                return;
            }

            // Create a key to track this specific analysis
            const analysisKey = `${question}:${userAnswer}`;

            // Check if we already have this exact analysis
            if (lastAnalyzedKey === analysisKey && analysisResult) {
                // Just open the drawer if we already have this analysis
                setIsAnalysisDrawerOpen(true);
                return;
            }

            setAnalysing(true); // Show loading state

            try {
                const AnalyzeQuestionData: AnalyzeQuestion = {
                    generatedQuestion: question ? question : "",
                    userResponse: userAnswer,
                    userLevel: formData.userLevel,
                    userLanguage: formData.userLanguage
                };

                const response = await analyzeQuestion(AnalyzeQuestionData);
                console.log("Analysis response:", response);

                // Pass the response directly to the drawer component
                if (response) {
                    setAnalysisResult(response);
                    setLastAnalyzedKey(analysisKey); // Store the key of what we analyzed
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
        }
    };
    useEffect(() => {
        // Clear previous analysis when question changes
        setAnalysisResult(null);
        setLastAnalyzedKey(null);
    }, [question]);

    // Reset analysis when form data changes
    useEffect(() => {
        // Clear previous analysis when any form parameter changes
        setAnalysisResult(null);
        setLastAnalyzedKey(null);
    }, [formData]);

    // Also update the textareaRef change effect to reset analysis
    useEffect(() => {
        if (textareaRef.current) {
            const textareaElement = textareaRef.current as HTMLTextAreaElement;

            // Create a function to handle textarea changes
            const handleTextareaChange = () => {
                // If the content changes, we need to reset the analysis
                setLastAnalyzedKey(null);
            };

            // Add event listener
            textareaElement.addEventListener('input', handleTextareaChange);

            // Cleanup
            return () => {
                textareaElement.removeEventListener('input', handleTextareaChange);
            };
        }
    }, [textareaRef.current]);

    useEffect(() => {
        if (question) {

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = question;

            const textContent = tempDiv.textContent || tempDiv.innerText;

            const words = textContent.match(/\S+/g) || [];

            // Create badges for each word
            const wordBadges = words.map((word, index) => {
                return (
                    `<TooltipProvider key="${index}">
                <Tooltip>
                <TooltipTrigger asChild>
                    <Badge 
                    variant="outline" 
                    className="m-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-black border-gray-300"
                    >
                    ${word}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Part of speech: Noun</p>
                    <p>Definition: ${word}</p>
                </TooltipContent>
                </Tooltip>
            </TooltipProvider>`
                );
            }).join(' ');

            setProcessedQuestion(wordBadges);
        }
    }, [question]);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsLoading(true);

        const formDataObj = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            formDataObj.append(key, value);
        });

        if (question) {
            formDataObj.append("previousQuestion", question);
        }

        formDataObj.append("previousQuestions", JSON.stringify(previousQuestions));

        try {
            const result = await generateQuestion(formDataObj);
            if (!result.success) {
                toast.error(result.message?.error?.message || "An error occurred");
                return;
            }

            // Set the new question
            setQuestion(result.data);
            setTips(result.tips);

            // Update previous questions array
            if (result.data) {
                setPreviousQuestions(prev => [...prev, result.data]);
            }

        } catch (error) {
            console.error("Error generating question:", error);
            toast.error("Failed to generate question");
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (name: any, value: any) => {
        setPreviousQuestions([]);
        setQuestion(null);
        setTips(null);
        setTranscript(null);
        setShowText(false);
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
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
    }, [previousQuestions]);
    return (
        <div className="text-white">
            <ShowAnalyse
                isOpen={isAnalysisDrawerOpen}
                onClose={() => setIsAnalysisDrawerOpen(false)}
                analysisResult={analysisResult}
            />
            <div className="container mx-auto py-10 px-4">
                <Card className="text-3xl font-bold mb-10 text-center">
                    <p className="text-2xl p-4">This tool generates a question for you to translate into English.</p>
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
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="userLevel" className="text-zinc-400">English Level</Label>
                                        <Select
                                            value={formData.userLevel}
                                            onValueChange={(value) => handleChange("userLevel", value)}
                                        >
                                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                                <SelectItem value="A1">A1</SelectItem>
                                                <SelectItem value="A2">A2</SelectItem>
                                                <SelectItem value="B1">B1</SelectItem>
                                                <SelectItem value="B2">B2</SelectItem>
                                                <SelectItem value="C1">C1 - Advanced</SelectItem>
                                                <SelectItem value="C2">C2</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="topic" className="text-zinc-400">Topic / Subject</Label>
                                        <Input
                                            id="topic"
                                            value={formData.topic}
                                            onChange={(e) => handleChange("topic", e.target.value)}
                                            className="bg-zinc-800 border-zinc-700 text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="targetGrammerTopic" className="text-zinc-400">Target Grammar Topic</Label>
                                        <Input
                                            id="targetGrammerTopic"
                                            value={formData.targetGrammerTopic}
                                            onChange={(e) => handleChange("targetGrammerTopic", e.target.value)}
                                            className="bg-zinc-800 border-zinc-700 text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="difficulty" className="text-zinc-400">Difficulty Level</Label>
                                        <Select
                                            value={formData.difficulty}
                                            onValueChange={(value) => handleChange("difficulty", value)}
                                        >
                                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                                <SelectValue placeholder="Select difficulty" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                                <SelectItem value="EASY">Easy</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HARD">Hard</SelectItem>
                                                <SelectItem value="EXPERT">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="userLanguage" className="text-zinc-400">Native Language</Label>
                                        <Input
                                            id="userLanguage"
                                            value={formData.userLanguage}
                                            onChange={(e) => handleChange("userLanguage", e.target.value)}
                                            className="bg-zinc-800 border-zinc-700 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex space-x-2">
                                    <Button
                                        type="submit"
                                        className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            "Generate Question"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    {/* Question Display Side */}
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader className="pb-2">
                            {question && (
                                <div className="flex flex-wrap gap-2">
                                    <VoiceRecorder
                                        onRecordingComplete={handleRecordingComplete}
                                        ref={voiceRecorderRef}
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
                                        onClick={() => {
                                            setShowText(!showText)
                                        }}
                                    >
                                        <Text className="h-3 w-3 mr-1" />
                                        <span className="text-xs">Reply with Text</span>
                                    </Button>
                                    {
                                        tips &&
                                        <TipsDrawer
                                            markdownContent={tips}
                                            title="✨💡🌟 TIPS ✨💡🌟"
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
                                    }
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            {question ? (
                                <div className="bg-white rounded-md p-2 text-black min-h-[100px] max-h-[600px] overflow-y-auto">
                                    <DisplayQuestion htmlContent={question} />
                                </div>
                            ) : (
                                <div className="bg-zinc-800 rounded-md p-2 text-zinc-400 min-h-[400px] flex items-center justify-center">
                                    <p className="text-center">Your generated question will appear here</p>
                                </div>
                            )}
                        </CardContent>

                        {showText && (
                            <CardFooter>
                                <div className="grid w-full gap-4">
                                    <Textarea
                                        placeholder="Type your answer here."
                                        defaultValue={transcript ? transcript : ""}
                                        ref={textareaRef}
                                    />
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
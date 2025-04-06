"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Text, RefreshCw } from "lucide-react";
import { AnalyzeQuestion, analyzeQuestion, generateQuestion } from "@/app/action";
import VoiceRecorder, { VoiceRecorderRef } from "@/components/voiceRecorder";
import { toast } from "sonner";
import TipsDrawer from "@/components/TipsDrawer";
import { DisplayQuestion } from "@/components/DisplayQuestion";
import ShowAnalyse from "@/components/ShowAnalyse";
import QuestionForm from "@/components/QuestionForm";

export default function QuestionGenerator() {
    const [question, setQuestion] = useState(null);
    const [processedQuestion, setProcessedQuestion] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysing, setAnalysing] = useState(false);
    const [formData, setFormData] = useState({
        userLevel: "C1",
        topic: "General",
        targetGrammarTopic: "Simple Present Tense",
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

            const analysisKey = `${question}:${userAnswer}`;

            if (lastAnalyzedKey === analysisKey && analysisResult) {
                setIsAnalysisDrawerOpen(true);
                return;
            }

            setAnalysing(true);

            try {
                const AnalyzeQuestionData: AnalyzeQuestion = {
                    generatedQuestion: question ? question : "",
                    userResponse: userAnswer,
                    userLevel: formData.userLevel,
                    userLanguage: formData.userLanguage
                };

                const response = await analyzeQuestion(AnalyzeQuestionData);
                console.log("Analysis response:", response);

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
        }
    };
    useEffect(() => {
        setAnalysisResult(null);
        setLastAnalyzedKey(null);
    }, [question]);

    useEffect(() => {
        setAnalysisResult(null);
        setLastAnalyzedKey(null);
    }, [formData]);

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

            setQuestion(result.data);
            setTips(result.tips);

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
                    <p className="text-2xl p-4">TITLE</p>
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
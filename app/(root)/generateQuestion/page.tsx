"use client";

import { useState, useEffect, useRef } from "react";
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
import { Loader2, RefreshCw, Text } from "lucide-react";
import { generateQuestion } from "@/app/action";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import VoiceRecorder, { VoiceRecorderRef } from "@/components/voiceRecorder";

export default function QuestionGenerator() {
    const [question, setQuestion] = useState(null);
    const [processedQuestion, setProcessedQuestion] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        userLevel: "C1",
        topic: "General",
        targetGrammerTopic: "Simple Present Tense",
        difficulty: "EXPERT",
        userLanguage: "Turkish",
    });
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [showText, setShowText] = useState<boolean>(false);

    const voiceRecorderRef = useRef<VoiceRecorderRef>(null);

    const handleRecordingComplete = (blob: Blob) => {
        setAudioBlob(blob);
        // İsterseniz burada ses kaydını API'ye gönderebilirsiniz
        console.log("Recording completed:", blob);
    };

    const handleTranscript = async () => { }


    // Process the HTML content to extract plain text and wrap words in badges
    useEffect(() => {
        if (question) {
            // Create a temporary div to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = question;

            // Extract the text content
            const textContent = tempDiv.textContent || tempDiv.innerText;

            // Split text into words
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

    async function handleSubmit(event: any) {
        event.preventDefault();
        setIsLoading(true);

        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataObj.append(key, value);
        });

        try {
            const result = await generateQuestion(formDataObj);
            setQuestion(result.data);
        } catch (error) {
            console.error("Error generating question:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (name: any, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const regenerateQuestion = () => {
        handleSubmit({ preventDefault: () => { } });
    };

    // Function to wrap each word in a badge with tooltip
    const WordBadge = ({ word, index }: { word: any, index: any }) => {
        return (
            <TooltipProvider key={index}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge
                            variant="outline"
                            className="text-[13px] m-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-black border-gray-300"
                        >
                            {word}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue-950">
                        <p className="text-white">Part of speech: Noun</p>
                        <p className="text-white">Definition: {word}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    // Function to process HTML and extract words
    const DisplayQuestion = ({ htmlContent }: { htmlContent: any }) => {
        if (!htmlContent) return null;

        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Extract the text content
        const textContent = tempDiv.textContent || tempDiv.innerText;

        // Split text into words by spaces while preserving punctuation
        const words = textContent.split(/\s+/).filter(word => word.length > 0);

        return (
            <div className="flex flex-wrap">
                {words.map((word, index) => (
                    <WordBadge key={index} word={word} index={index} />
                ))}
            </div>
        );
    };



    return (
        <div className=" text-white">
            <div className="container mx-auto py-10 px-4">
                <Card className="text-3xl font-bold mb-10 text-center">
                    <p className="text-2xl p-4">This tool generates a question for you to translate into English.</p>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left side - Form */}
                    <Card className="bg-zinc-900 border-zinc-800 text-white h-fit">
                        <CardHeader>
                            <CardTitle className="text-xl">Set Question Parameters</CardTitle>
                            <p className="text-sm text-zinc-400 mt-1">
                                Fill in the fields below to generate a question suitable for your level and needs
                            </p>
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

                                <div className="pt-4">
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

                    {/* Right side - Generated Question */}
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xl">Generated Question</CardTitle>
                            {question && (
                                <div className="flex gap-2">
                                    <VoiceRecorder
                                        onRecordingComplete={handleRecordingComplete}
                                        ref={voiceRecorderRef} // Eğer bu ref'i oluşturduysan
                                    />
                                    {audioBlob && ( // Ses kaydı yapıldıysa Transcript butonu göster
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 bg-zinc-700 hover:bg-zinc-600 border-none"
                                            onClick={handleTranscript} // Transcript işlemini başlatan fonksiyon
                                        >
                                            Transcript
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 bg-zinc-700 hover:bg-zinc-600 border-none text-white"
                                        onClick={()=>{
                                            setShowText(!showText)
                                        }}
                                    >
                                        <Text className="h-3 w-3 mr-1" />
                                        <span className="text-xs">Reply with Text</span>
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            {question ? (
                                <div className="bg-white rounded-md p-2 text-black min-h-[100px] max-h-[600px] overflow-y-auto">
                                    <TooltipProvider>
                                        <DisplayQuestion htmlContent={question} />
                                    </TooltipProvider>
                                </div>
                            ) : (
                                <div className="bg-zinc-800 rounded-md p-2 text-zinc-400 min-h-[400px] flex items-center justify-center">
                                    <p className="text-center">Your generated question will appear here</p>
                                </div>
                            )}
                        </CardContent>

                        {
                            showText && <CardFooter>
                                <div className="grid w-full gap-4">
                                    <Textarea  placeholder="Type your message here." />
                                    <Button>Analyze it</Button>
                                </div>
                            </CardFooter>
                        }
                    </Card>
                </div>
            </div>
        </div>
    );
}
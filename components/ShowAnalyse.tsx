"use client";

import React from 'react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FeedbackData {
    GrammerFeedback?: string;
    VocabularyFeedback?: string;
    ComprehensionFeedback?: string;
}

interface AnalysisResult {
    success?: boolean;
    data?: {
        FeedBack?: FeedbackData;
        CorrectedResponse?: string;
    };
    Content?: string; // For backward compatibility
}

interface ShowAnalyseProps {
    isOpen: boolean;
    onClose: () => void;
    analysisResult: AnalysisResult | null;
}

const ShowAnalyse: React.FC<ShowAnalyseProps> = ({ isOpen, onClose, analysisResult }) => {
    // Function to check if we have valid data to display
    const hasValidData = () => {
        if (!analysisResult) return false;

        // Check for new data structure
        if (analysisResult.data?.FeedBack || analysisResult.data?.CorrectedResponse) {
            return true;
        }

        // Check for old data structure (Content field)
        if (analysisResult.Content) {
            return true;
        }

        return false;
    };

    // Get sections from new data structure
    const getFeedbackSections = () => {
        const sections = [
            {
                title: "Grammar Feedback",
                content: analysisResult?.data?.FeedBack?.GrammerFeedback || "",
                icon: "📝",
                color: "bg-blue-900/20 border-blue-700"
            },
            {
                title: "Vocabulary Feedback",
                content: analysisResult?.data?.FeedBack?.VocabularyFeedback || "",
                icon: "📚",
                color: "bg-purple-900/20 border-purple-700"
            },
            {
                title: "Comprehension Feedback",
                content: analysisResult?.data?.FeedBack?.ComprehensionFeedback || "",
                icon: "🧠",
                color: "bg-amber-900/20 border-amber-700"
            },
            {
                title: "Corrected Translation",
                content: analysisResult?.data?.CorrectedResponse || "",
                icon: "✅",
                color: "bg-green-900/20 border-green-700"
            }
        ];

        return sections;
    };

    // Parse content sections from the old data structure (Content string)
    const parseContentString = (content: string) => {
        const sectionDefinitions = [
            {
                key: "GRAMMAR FEEDBACK",
                title: "Grammar Feedback",
                icon: "📝",
                color: "bg-blue-900/20 border-blue-700"
            },
            {
                key: "VOCABULARY FEEDBACK",
                title: "Vocabulary Feedback",
                icon: "📚",
                color: "bg-purple-900/20 border-purple-700"
            },
            {
                key: "COMPREHENSION FEEDBACK",
                title: "Comprehension Feedback",
                icon: "🧠",
                color: "bg-amber-900/20 border-amber-700"
            },
            {
                key: "CORRECTED TRANSLATION",
                title: "Corrected Translation",
                icon: "✅",
                color: "bg-green-900/20 border-green-700"
            }
        ];

        // Initialize the sections with empty content
        const sections = sectionDefinitions.map(def => ({
            title: def.title,
            content: "",
            icon: def.icon,
            color: def.color
        }));

        // Extract content for each section
        sectionDefinitions.forEach((def, index) => {
            const regex = new RegExp(`${def.key}:\\s*(.+?)(?=\\b[A-Z]+ FEEDBACK:|CORRECTED TRANSLATION:|$)`, 's');
            const match = content.match(regex);
            if (match && match[1]) {
                sections[index].content = match[1].trim();
            }
        });

        return sections;
    };

    // Choose which data structure to use
    const contentSections = analysisResult?.data?.FeedBack
        ? getFeedbackSections()
        : analysisResult?.Content
            ? parseContentString(analysisResult.Content)
            : [];

    // Calculate a simple score based on positive language in feedback


    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md md:max-w-lg border-l border-zinc-700 p-0 bg-zinc-900"
            >
                <SheetHeader className="border-b border-zinc-700 p-6 bg-zinc-900">
                    <SheetTitle className="text-xl flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <span className="text-2xl">🎯</span> Translation Analysis
                        </span>

                    </SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        Review the feedback on your translation and learn how to improve
                    </SheetDescription>
                </SheetHeader>



                <div className="p-6 pb-20 overflow-y-auto max-h-[calc(100vh-220px)] bg-zinc-900 text-zinc-100">
                    {contentSections.map((section, index) => (
                        section.content ? (
                            <div key={index} className={`mb-6 rounded-lg border ${section.color} p-4`}>
                                <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <span className="mr-2 text-xl">{section.icon}</span>
                                    <span>{section.title}</span>
                                </h3>
                                <div className="text-zinc-200 font-medium">
                                    {section.content}
                                </div>

                            </div>
                        ) : null
                    ))}

                    {!hasValidData() && (
                        <div className="py-12 text-center text-zinc-400 flex flex-col items-center">
                            <AlertCircle className="h-12 w-12 mb-3 text-zinc-500" />
                            <p className="text-lg font-medium">No analysis results available</p>
                            <p className="text-sm mt-1 max-w-md mx-auto">Please submit your answer to receive feedback on your translation</p>
                        </div>
                    )}
                </div>


            </SheetContent>
        </Sheet>
    );
};

export default ShowAnalyse;
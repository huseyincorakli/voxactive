import React, { useState, useEffect } from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { GRAMMAR_TOPICS_BY_LEVEL, Languages } from '@/lib/constants';
import { LevelType } from '@/types/init';
import { Separator } from './ui/separator';

interface FormDataType {
    userLevel: string;
    topic: string;
    targetGrammarTopic: string;
    targetGrammerTopic?: string; 
    difficulty: string;
    userLanguage: string;
}

const isValidLevel = (level: string): level is LevelType => {
    return Object.keys(GRAMMAR_TOPICS_BY_LEVEL).includes(level as LevelType);
};

interface QuestionFormProps {
    handleSubmit: (event: React.FormEvent) => Promise<void>;
    formData: FormDataType;
    handleChange: (name: string, value: string) => void;
    isLoading: boolean;
}

const QuestionForm = ({ handleSubmit, formData, handleChange, isLoading }: QuestionFormProps) => {
    const [availableGrammarTopics, setAvailableGrammarTopics] = useState<string[]>([]);

    useEffect(() => {
        if (formData.userLevel && isValidLevel(formData.userLevel)) {
            setAvailableGrammarTopics(GRAMMAR_TOPICS_BY_LEVEL[formData.userLevel]);
            
            const topicsForLevel = GRAMMAR_TOPICS_BY_LEVEL[formData.userLevel];
            const currentTopic = formData.targetGrammarTopic || formData.targetGrammerTopic;
            if (currentTopic && !topicsForLevel.includes(currentTopic)) {
                handleChange("targetGrammarTopic", "");
            }
        } else {
            setAvailableGrammarTopics([]);
        }
    }, [formData.userLevel]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="userLevel" className="text-zinc-300 font-medium">
                            English Level
                        </Label>
                        <Select
                            value={formData.userLevel}
                            onValueChange={(value) => handleChange("userLevel", value)}
                        >
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectItem value="A1">A1 - Beginner</SelectItem>
                                <SelectItem value="A2">A2 - Elementary</SelectItem>
                                <SelectItem value="B1">B1 - Intermediate</SelectItem>
                                <SelectItem value="B1+">B1+ - Upper Intermediate</SelectItem>
                                <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                                <SelectItem value="C1">C1 - Advanced</SelectItem>
                                <SelectItem value="C2">C2 - Proficient</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-zinc-500 mt-1">
                            Select your current English proficiency level
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="difficulty" className="text-zinc-300 font-medium">
                            Difficulty
                        </Label>
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
                        <p className="text-xs text-zinc-500 mt-1">
                            Choose how challenging the question should be
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="userLanguage" className="text-zinc-300 font-medium">
                            Your Language
                        </Label>
                        <Select
                            value={formData.userLanguage}
                            onValueChange={(value) => handleChange("userLanguage", value)}
                        >
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectValue placeholder="Select native language" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-60">
                                {Languages.map((language) => (
                                    <SelectItem key={language} value={language}>
                                        {language}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-zinc-500 mt-1">
                            Tips will be provided in this language
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* <div className="space-y-2">
                        <Label htmlFor="topic" className="text-zinc-300 font-medium">
                            Topic / Subject
                        </Label>
                        <Input
                            disabled
                            id="topic"
                            value={formData.topic}
                            onChange={(e) => handleChange("topic", e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white max-w-[17rem]"
                            placeholder="e.g. Travel, Family, Work, etc."
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            What would you like the question to be about?
                        </p>
                    </div> */}

                    <div className="space-y-2">
                        <Label htmlFor="targetGrammarTopic" className="text-zinc-300 font-medium">
                            Grammar Focus
                        </Label>
                        {availableGrammarTopics.length > 0 ? (
                            <Select
                                value={formData.targetGrammarTopic || formData.targetGrammerTopic || ""}
                                onValueChange={(value) => handleChange("targetGrammarTopic", value)}
                            >
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white max-w-[17rem]">
                                    <SelectValue placeholder="Select grammar topic" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-60 ">
                                    {availableGrammarTopics.map((topic) => (
                                        <SelectItem key={topic} value={topic}>
                                            {topic}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                id="targetGrammarTopic"
                                value={formData.targetGrammarTopic || formData.targetGrammerTopic || ""}
                                onChange={(e) => handleChange("targetGrammarTopic", e.target.value)}
                                placeholder="Please select an English level first"
                                className="bg-zinc-800 border-zinc-700 text-white "
                                disabled={!formData.userLevel}
                            />
                        )}
                        <p className="text-xs text-zinc-500 mt-1">
                            The specific grammar structure to practice
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <Separator className="mb-6 bg-zinc-700" />
                <Button
                    type="submit"
                    disabled={isLoading || !formData.userLevel || !(formData.targetGrammarTopic || formData.targetGrammerTopic)}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating Question...
                        </>
                    ) : (
                        "Generate New Question"
                    )}
                </Button>
            </div>
        </form>
    );
};

export default QuestionForm;
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export const WordBadge = ({ 
    word, 
    index, 
    word_translate = [],
    isLoading = false
}: { 
    word: string, 
    index: number, 
    word_translate?: string[],
    isLoading?: boolean
}) => {
    return (
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
                {isLoading ? (
                    <p className="text-white">Loading translation...</p>
                ) : word_translate && word_translate.length > 0 ? (
                    <>
                        <p className="text-white font-medium">Translation:</p>
                        <p className="text-white">
                            {word_translate.join(", ")}
                        </p>
                    </>
                ) : (
                    <p className="text-white">
                        No translation available for "{word}"
                    </p>
                )}
            </TooltipContent>
        </Tooltip>
    );
};
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";


export  const  WordBadge = ({ word, index }: { word: any, index: any }) => {
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
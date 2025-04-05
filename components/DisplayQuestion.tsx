import { TooltipProvider } from "./ui/tooltip";
import { WordBadge } from "./WordBadge";

export const DisplayQuestion = ({ htmlContent }: { htmlContent: any }) => {
        if (!htmlContent) return null;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        const textContent = tempDiv.textContent || tempDiv.innerText;

        const words = textContent.split(/\s+/).filter(word => word.length > 0);

        return (
            <TooltipProvider>

            <div className="flex flex-wrap">
                {words.map((word, index) => (
                    <WordBadge key={index} word={word} index={index} />
                ))}
            </div>
            </TooltipProvider>

        );
    };

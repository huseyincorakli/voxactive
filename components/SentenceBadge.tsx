import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const SentenceBadge = ({
  sentence,
  index,
  sentence_translate = [],
  isLoading = false,
  colorClass = "bg-gray-100 hover:bg-gray-200 border-gray-300",
  fontSize,
  message,
}: {
  sentence: string;
  index: number;
  sentence_translate?: string[];
  isLoading?: boolean;
  colorClass?: string;
  fontSize?: string;
  message?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (window.innerWidth <= 768) {
      // Check if mobile
      setIsOpen(!isOpen);
    }
  };

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={`text-[13px] ${
            fontSize ? fontSize : ""
          } p-1 m-0 cursor-pointer ${colorClass} text-black whitespace-normal`}
          onClick={handleClick}
        >
          {sentence}
        </Badge>
      </TooltipTrigger>
      <TooltipContent
        className="bg-blue-950 max-w-md"
        side="bottom"
        avoidCollisions={true}
      >
        {isLoading ? (
          <p className="text-white">Loading translation...</p>
        ) : sentence_translate && sentence_translate.length > 0 ? (
          <>
            <p className="text-white font-medium mb-1">Translation:</p>
            <div className="max-h-60 overflow-y-auto">
              {sentence_translate.map((t, idx) => (
                <p key={idx} className="text-white py-1">
                  • {t}
                </p>
              ))}
            </div>
          </>
        ) : (
          <p className="text-white">
            {message ? message : "No translation available for this sentence."}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

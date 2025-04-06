"use client";

import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const TipsDrawer = ({ 
  markdownContent, 
  triggerButton,
  title 
}:{markdownContent:string, triggerButton:any, title:string}) => {
    const processBoldText = (text:string) => {
        // Split the text by ** markers
        const parts = text.split(/(\*\*.*?\*\*)/g);
        
        return parts.map((part, i) => {
          // Check if this part is surrounded by ** markers
          if (part.startsWith('**') && part.endsWith('**')) {
            // Remove the ** markers and return as bold text
            return <strong key={i} className="text-emerald-300">{part.substring(2, part.length - 2)}</strong>;
          }
          // Return regular text
          return <span key={i}>{part}</span>;
        });
      };
    
      // Function to manually parse basic markdown
      const renderMarkdown = (markdown:string) => {
        if (!markdown) return null;
    
        // Split the content into lines
        const lines = markdown.split('\n');
        
        // Process the markdown content
        return (
          <div className="space-y-4">
            {lines.map((line, index) => {
              // Header level 1 (# )
              if (line.startsWith('# ')) {
                return <h1 key={index} className="text-2xl font-bold mt-6 mb-2 text-emerald-200 border-b border-emerald-700 pb-2">{processBoldText(line.substring(2))}</h1>;
              }
              // Header level 2 (## )
              else if (line.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-bold mt-5 mb-2 text-emerald-300">{processBoldText(line.substring(3))}</h2>;
              }
              // Header level 3 (### )
              else if (line.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-semibold mt-4 mb-1 text-emerald-400">{processBoldText(line.substring(4))}</h3>;
              }
              // Header level 4 (#### )
              else if (line.startsWith('#### ')) {
                return <h4 key={index} className="text-base font-semibold mt-3 mb-1 text-emerald-500">{processBoldText(line.substring(5))}</h4>;
              }
              // Unordered list item (- )
              else if (line.trim().startsWith('- ')) {
                return (
                  <div key={index} className="flex pl-2 border-l-2 border-emerald-700">
                    <span className="mr-2 text-emerald-400">•</span>
                    <p className="text-zinc-200">{processBoldText(line.trim().substring(2))}</p>
                  </div>
                );
              }
              // Empty line
              else if (line.trim() === '') {
                return <div key={index} className="h-2"></div>;
              }
              // Regular paragraph
              else {
                return <p key={index} className="text-zinc-300">{processBoldText(line)}</p>;
              }
            })}
          </div>
        );
      };
    
      return (
        <Drawer>
          <DrawerTrigger asChild>
            {triggerButton}
          </DrawerTrigger>
          <DrawerContent className="bg-zinc-900 text-white border-t border-emerald-700">
            <div className="mx-auto w-full max-w-3xl">
              <DrawerHeader className="relative">
                <DrawerTitle className="text-white text-xl font-bold text-center ">
                  {title}
                </DrawerTitle>
                <div className="absolute right-2 top-2">
                  <DrawerClose asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                      <X className="h-4 w-4 text-emerald-400 hover:text-emerald-300" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </DrawerClose>
                </div>
                <div className="h-1 w-24 bg-emerald-700 mx-auto mt-2 rounded-full"></div>
              </DrawerHeader>
              <div className="p-6 overflow-y-auto max-h-[60vh] w-full scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-zinc-800">
                <div className="bg-zinc-800 p-4 rounded-lg shadow-inner border border-zinc-700">
                  {renderMarkdown(markdownContent)}
                </div>
              </div>
              <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white border-none">
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      );
    };
    
    export default TipsDrawer;
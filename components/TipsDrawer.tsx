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

const TipsDrawer = ({ 
  markdownContent, 
  triggerButton,
  title 
}:{markdownContent:string,triggerButton:any,title:string}) => {
    const processBoldText = (text:string) => {
        // Split the text by ** markers
        const parts = text.split(/(\*\*.*?\*\*)/g);
        
        return parts.map((part, i) => {
          // Check if this part is surrounded by ** markers
          if (part.startsWith('**') && part.endsWith('**')) {
            // Remove the ** markers and return as bold text
            return <strong key={i}>{part.substring(2, part.length - 2)}</strong>;
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
                return <h1 key={index} className="text-2xl font-bold mt-6 mb-2">{processBoldText(line.substring(2))}</h1>;
              }
              // Header level 2 (## )
              else if (line.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-bold mt-5 mb-2">{processBoldText(line.substring(3))}</h2>;
              }
              // Header level 3 (### )
              else if (line.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-semibold mt-4 mb-1">{processBoldText(line.substring(4))}</h3>;
              }
              // Header level 4 (#### )
              else if (line.startsWith('#### ')) {
                return <h4 key={index} className="text-base font-semibold mt-3 mb-1">{processBoldText(line.substring(5))}</h4>;
              }
              // Unordered list item (- )
              else if (line.trim().startsWith('- ')) {
                return (
                  <div key={index} className="flex">
                    <span className="mr-2">•</span>
                    <p>{processBoldText(line.trim().substring(2))}</p>
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
          <DrawerContent className="bg-zinc-900 text-white">
            <DrawerHeader>
              <DrawerTitle className="text-white">{title}</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto max-h-[30vh]">
              {renderMarkdown(markdownContent)}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    };
    
    export default TipsDrawer;
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createLLM } from "./llm";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

const llm = createLLM("google/gemini-2.0-flash-lite-001", "https://openrouter.ai/api/v1", 0.2);

// Define schema for sentence translations
const translate = z.object({
  translations: z.record(z.array(z.string())).describe("The translated sentences with original as key")
});

const parser = StructuredOutputParser.fromZodSchema(translate);
const formatInstructions = parser.getFormatInstructions();

const prompt = ChatPromptTemplate.fromMessages([
  ["system", `
You are a professional translator specializing in translating complete sentences between English and {userlang}.
For each input sentence, provide the most accurate and natural translation in the target language.

IMPORTANT: The response must be in the following format:
{format}

Translation Guidelines:
1. Preserve the original meaning while making it sound natural in the target language
2. Maintain proper grammar and syntax
3. Keep the same tone (formal/informal) as the original
4. For idiomatic expressions, provide the equivalent in the target language
5. If the sentence is already in the target language, provide alternative phrasings

Target Language: {userlang}
Sentences to translate: {sentences}
  `]
]);

const chain = prompt.pipe(llm).pipe(parser);

const translateSentences = async (sentences: string | string[], userlang: string) => {
  try {
    // Ensure sentences is always an array
    const sentencesArray = Array.isArray(sentences) ? sentences : [sentences];
    
    const response = await chain.invoke({ 
      sentences: sentencesArray.join("\n"), // Combine multiple sentences with newlines
      userlang, 
      format: formatInstructions 
    });
    
    return {
      response,
      success: true
    };
  } catch (error) {
    console.error("Translation error:", error);
    
    return {
      error: "An error occurred while translating the sentences.",
      success: false
    };
  }
};

export { translateSentences };
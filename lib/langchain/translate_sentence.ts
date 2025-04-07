import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createLLM } from "./llm";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
const llm = createLLM("meta-llama/llama-4-maverick:free", "https://openrouter.ai/api/v1", 0);

const translate = z.object({
  translation: z.record(z.array(z.string())).describe("The translated words with original as key")
});

const parser = StructuredOutputParser.fromZodSchema(translate);
const formatInstructions = parser.getFormatInstructions();

const prompt = ChatPromptTemplate.fromMessages([
  ["system", `
You are a translator who specializes in translating the given sentence into English, word for word.
For each word in the original sentence, provide possible English translations.

IMPORTANT The response must be in the following format:
{format}

IMPORTANT If the sentence is already in English, translate it into the {userlang} in the same way 

Here is the sentence to translate: {sentence}
  `]
]);

const chain = prompt.pipe(llm).pipe(parser);

const translateSentence = async (sentence: string,userlang:string) => {
  try {
    const response = await chain.invoke({ 
      sentence,
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
      error: "An error occurred while translating the sentence.",
      success: false
    };
  }
};



export { translateSentence };
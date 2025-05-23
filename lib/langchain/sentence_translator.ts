import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createLLM } from "./llm";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { TranslateSentencesPrompt_Constant } from "../prompts";

const llm = createLLM(
  process.env.NEXT_DEFAULT_MODEL,
  process.env.NEXT_MODEL_BASEURL,
  0.2
);

// Define schema for sentence translations
const translate = z.object({
  translations: z
    .record(z.array(z.string()))
    .describe("The translated sentences with original as key"),
});

const parser = StructuredOutputParser.fromZodSchema(translate);
const formatInstructions = parser.getFormatInstructions();

const prompt = ChatPromptTemplate.fromMessages([
  ["system", TranslateSentencesPrompt_Constant],
]);

const chain = prompt.pipe(llm).pipe(parser);

const translateSentences = async (
  sentences: string | string[],
  userlang: string
) => {
  try {
    // Ensure sentences is always an array
    const sentencesArray = Array.isArray(sentences) ? sentences : [sentences];

    const response = await chain.invoke({
      sentences: sentencesArray.join("\n"), // Combine multiple sentences with newlines
      userlang,
      format: formatInstructions,
    });

    return {
      response,
      success: true,
    };
  } catch (error) {
    console.error("Translation error:", error);

    return {
      error: "An error occurred while translating the sentences.",
      success: false,
    };
  }
};

export { translateSentences };

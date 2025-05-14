import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createLLM } from "./llm";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { TranslateSentencesPrompt_Constant_2 } from "../prompts";
const llm = createLLM(
  process.env.NEXT_DEFAULT_MODEL,
  process.env.NEXT_MODEL_BASEURL,
  0.2
);

const translate = z.object({
  translation: z
    .record(z.array(z.string()))
    .describe("The translated words with original as key"),
});

const parser = StructuredOutputParser.fromZodSchema(translate);
const formatInstructions = parser.getFormatInstructions();

const prompt = ChatPromptTemplate.fromMessages([
  ["system", TranslateSentencesPrompt_Constant_2],
]);

const chain = prompt.pipe(llm).pipe(parser);

const translateSentence = async (sentence: string, userlang: string) => {
  try {
    const response = await chain.invoke({
      sentence,
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
      error: "An error occurred while translating the sentence.",
      success: false,
    };
  }
};

export { translateSentence };

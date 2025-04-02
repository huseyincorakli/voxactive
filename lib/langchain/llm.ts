import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";

dotenv.config();

let tokenUsage = 0;

const createLLM = (
  modelName = "google/gemini-2.0-flash-lite-001",
  baseURL = "https://openrouter.ai/api/v1",
  temperature = 0
) => {
  return new ChatOpenAI({
    modelName,
    temperature,
    configuration: {
      baseURL
    },
    callbacks: [
      {
        async handleLLMEnd(output) {
          const tokensUsed = output.llmOutput?.tokenUsage.totalTokens || 0;
          if (typeof tokenUsage !== 'number') tokenUsage = 0;
          tokenUsage += tokensUsed;
          console.log(`Added ${tokensUsed} tokens. Total: ${tokenUsage}`);
        },
      },
    ],
  });
};

const defaultLLM = createLLM(
  "google/gemini-2.0-flash-lite-001",
  "https://openrouter.ai/api/v1"
);

export { createLLM, defaultLLM, tokenUsage };
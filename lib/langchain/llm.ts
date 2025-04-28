import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { cookies } from "next/headers";
import { createUsage } from "../db/db";

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
      baseURL,
    },
    callbacks: [
      {
        async handleLLMEnd(output) {
          const cookieStore = cookies();
          const userIp = (await cookieStore).get("user")?.value;
          console.log("cookie ip in llm", userIp);
          const tokensUsed = output.llmOutput?.tokenUsage.totalTokens || 0;
          if (typeof tokenUsage !== "number") tokenUsage = 0;
          tokenUsage += tokensUsed;
          console.log(`Added ${tokensUsed} tokens. Total: ${tokenUsage}`);
          await createUsage(userIp, tokensUsed);
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

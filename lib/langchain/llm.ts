import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { cookies } from "next/headers";
import { createUsage } from "../db/db";

dotenv.config();

let tokenUsage = 0;

const createLLM = (
  modelName = process.env.NEXT_DEFAULT_MODEL,
  baseURL = process.env.NEXT_MODEL_BASEURL,
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
  process.env.NEXT_DEFAULT_MODEL,
  process.env.NEXT_MODEL_BASEURL
);

export { createLLM, defaultLLM, tokenUsage };

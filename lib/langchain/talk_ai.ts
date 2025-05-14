import { Annotation, MemorySaver, StateGraph } from "@langchain/langgraph";
import { createLLM } from "./llm";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TTS_DG } from "../deepgram/tts";
import { randomUUID } from "crypto";
import {
  TalkAIGrammarCheck_Constant,
  TalkAIGrammarCorrectionPrompt_Constant,
  TalkAIPrompt_Constant,
} from "../prompts";

const llm = createLLM(
  process.env.NEXT_DEFAULT_MODEL,
  process.env.NEXT_MODEL_BASEURL,
  1
);

const TalkAIPrompt = ChatPromptTemplate.fromMessages([
  ["system", TalkAIPrompt_Constant],
  ["human", "{UserInput}"],
]);

const GrammarCheckPrompt = ChatPromptTemplate.fromMessages([
  ["system", TalkAIGrammarCheck_Constant],
]);

const GrammarCorrectionPrompt = ChatPromptTemplate.fromMessages([
  ["system", TalkAIGrammarCorrectionPrompt_Constant],
]);

const TalkAIState = Annotation.Root({
  UserLevel: Annotation<string>(),
  Topic: Annotation<string>(),
  UserInput: Annotation<string>(),

  AIOutput: Annotation<string>(),
  History: Annotation<string>(),
  HasGrammarError: Annotation<boolean>(),
  GrammarCorrection: Annotation<string>(),
  UserLanguage: Annotation<string>(),
  SpeechOutput: Annotation<any>(),
  HasSpeechOutput: Annotation<boolean>(),
});

// Ana konuşma zinciri
const talkChain = RunnableSequence.from([
  {
    UserLevel: (input) => input.UserLevel,
    Topic: (input) => input.Topic,
    UserInput: (input) => input.UserInput,
    History: (input) => input.History || "",
  },
  TalkAIPrompt,
  llm,
  new StringOutputParser(),
]);

// Gramer kontrolü zinciri
const grammarCheckChain = RunnableSequence.from([
  {
    UserLevel: (input) => input.UserLevel,
    UserInput: (input) => input.UserInput,
  },
  GrammarCheckPrompt,
  llm,
  new StringOutputParser(),
]);

// Gramer düzeltme zinciri
const grammarCorrectionChain = RunnableSequence.from([
  {
    UserLevel: (input) => input.UserLevel,
    UserInput: (input) => input.UserInput,
    UserLanguage: (input) => input.UserLanguage,
  },
  GrammarCorrectionPrompt,
  llm,
  new StringOutputParser(),
]);

const callModel = async (state: typeof TalkAIState.State) => {
  const msg = await talkChain.invoke(state);

  const newHistoryEntry = `User: ${state.UserInput}\nAI: ${msg}\n`;
  const updatedHistory = state.History
    ? `${state.History}${newHistoryEntry}`
    : newHistoryEntry;

  return {
    ...state,
    AIOutput: msg,
    History: updatedHistory,
  };
};

const checkGrammar = async (state: typeof TalkAIState.State) => {
  const result = await grammarCheckChain.invoke(state);
  const hasError = result.trim().toUpperCase().includes("YES");

  return {
    ...state,
    HasGrammarError: hasError,
  };
};

// Gramer düzeltmesi yapan fonksiyon
const correctGrammar = async (state: typeof TalkAIState.State) => {
  const correction = await grammarCorrectionChain.invoke(state);

  return {
    ...state,
    GrammarCorrection: correction,
    AIOutput: correction,
  };
};

// Ses dönüşümü
const textToSpeech = async (text: string) => {
  const uuid = randomUUID();
  try {
    const audioContent = await TTS_DG(text);
    return { success: true, audio: audioContent };
  } catch (error: any) {
    console.error("TTS error:", error);
    return { success: false, error: error.message };
  }
};

const convertToSpeech = async (state: typeof TalkAIState.State) => {
  if (state.AIOutput && !state.AIOutput.includes("<error-correction>")) {
    const speechResult = (await textToSpeech(state.AIOutput)) as any;

    return {
      ...state,
      SpeechOutput: speechResult.success ? speechResult.audio : null,
      HasSpeechOutput: speechResult.success,
    };
  } else {
    return {
      ...state,
      SpeechOutput: null,
      HasSpeechOutput: false,
    };
  }
};

// Graph
const workflow = new StateGraph(TalkAIState)
  .addNode("grammarCheck", checkGrammar)
  .addNode("model", callModel)
  .addNode("grammarCorrection", correctGrammar)
  .addNode("speechConverter", convertToSpeech)

  // Başlangıçta her zaman gramer kontrolü yapılacak
  .addEdge("__start__", "grammarCheck")

  // Koşullu yönlendirme için router fonksiyonu
  .addConditionalEdges("grammarCheck", (state) => {
    return state.HasGrammarError ? "grammarCorrection" : "model";
  })

  // Her iki nodedan da çıktığında ses dönüşüm node'una git
  .addEdge("grammarCorrection", "speechConverter")
  .addEdge("model", "speechConverter")

  // Ses dönüşümünden sonra bitir
  .addEdge("speechConverter", "__end__");

const memory = new MemorySaver();
const TalkAIApp = workflow.compile({ checkpointer: memory });

export { TalkAIApp };

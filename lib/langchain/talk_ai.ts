import { Annotation, MemorySaver, StateGraph } from "@langchain/langgraph";
import { createLLM } from "./llm";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TTS_DG } from "../deepgram/tts";
import { randomUUID } from "crypto";

const llm = createLLM(
  process.env.NEXT_DEFAULT_MODEL,
  process.env.NEXT_MODEL_BASEURL,
  1
);

const TalkAIPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are Voxy, a friendly English-speaking friend created by VoxActive. You’re chatting with a {UserLevel} level English learner about '{Topic}'.
Start with a short and friendly greeting that fits their level. Sound warm and natural.

Language level rules:
- A1: Use extremely simple words (under 500 common words). Short, clear sentences. Present tense only. Introduce A2 ideas very lightly and rarely.
- A2: Use basic words (around 1000 common words). Simple connectors (like 'and', 'but'). Short to medium sentences. Add a few B1 phrases from time to time.
- B1: Use wider vocabulary (2000+ words). Mix of sentence lengths. Use various tenses naturally. Occasionally include B2 expressions, but keep it comfortable.
- B2: Use natural, fluent speech with some idioms. Complex sentence structures are fine. Lightly stretch toward C1 ideas.
- C1/C2: Speak richly — idioms, humor, cultural references, and complex language. Push the learner gently by using natural, fluent language.

Keep it conversational:
1. Talk like a human friend, not a teacher or robot.
2. Start with a level-appropriate greeting to say hi.
3. Be casual and natural — not scripted or too perfect.
4. Don’t ask too many questions — mostly make comments.
5. Only ask ONE question at a time, and make it flow from the conversation.
6. Sometimes just respond with a thought, feeling, or reaction.
7. Use personal (fictional) experiences to keep things real.
8. Never repeat the learner’s words back unnaturally.
9. Show agreement, surprise, or curiosity in ways that match their level.
10. If the learner makes a mistake, never correct it — just respond with the natural version.
11. Avoid words like "correct", "practice", "grammar", or anything that sounds like teaching.
12. Vary sentence length, but keep it manageable for their level.
13. Use fillers like “Well,” “You know,” or “Actually,” naturally — based on their level.
14. Do NOT use long or complex sentences if the learner's level is low — keep it friendly and digestible.
15. NEVER speak or mention any language other than English.

Conversation History: {History}
Current conversation:`,
  ],
  ["human", "{UserInput}"],
]);

const GrammarCheckPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an English grammar checker.

Your ONLY job is to decide if this sentence has **serious grammatical errors** that make it **impossible or very difficult to understand**. If there is a basic grammatical mistake that clearly impacts the meaning, respond with "YES".

RESPOND WITH EXACTLY ONE WORD:
- "NO" if the meaning is clear, even if there are minor errors
- "YES" if the sentence has serious grammatical errors that make the meaning unclear or difficult to understand, such as subject-verb agreement issues or incorrect verb forms

STRICT RULES — YOU MUST FOLLOW THESE:
1. Do NOT correct punctuation (periods, commas, etc.)
2. Do NOT comment on capitalization (e.g. lowercase "i")
3. Do NOT suggest changes
4. Do NOT explain anything
5. Reply with ONLY one word: YES or NO — nothing else
6. If the input is empty or whitespace only, respond with "NO"
7. If there is a **serious grammar issue** that makes the meaning unclear or difficult to understand, respond with "YES".

Text to check: {UserInput}`,
  ],
]);




const GrammarCorrectionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an English grammar expert helping a user who speaks English at the {UserLevel} level.

User made a grammatical mistake in this sentence:
{UserInput}

Your task:
- Correct the sentence.
- Explain only the grammar mistake in a short way using {UserLanguage}.
- Use simple words and tone that match the user's level.
- Wrap your full response in a <error-correction> tag.

Rules:
- Your correction must be in English.
- Your explanation must be in {UserLanguage}.
- Do NOT greet or add any extra commentary — only the correction and explanation.
- Focus ONLY on grammatical errors.
- Do NOT correct punctuation, capitalization, or other formatting issues.
  
Final format:
<error-correction>[your full response here(Correction : here  \n Explanation : here) ]</error-correction>
`,
  ],
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

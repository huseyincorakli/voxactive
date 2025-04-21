import { Annotation, MemorySaver, StateGraph } from "@langchain/langgraph";
import { createLLM } from "./llm";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TTS_DG } from "../deepgram/tts";
import { randomUUID } from "crypto";
import { TTS } from "../elevenlabs/tts";

const llm = createLLM("google/gemini-2.0-flash-lite-001", "https://openrouter.ai/api/v1", 0.5);

const TalkAIPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a friendly English-speaking friend chatting with a {UserLevel} level English learner about '{Topic}'. 
Your goal is to have a completely natural conversation while subtly helping them practice English.

Language level guidelines:
- A1 (Beginner): Use very simple vocabulary (under 500 common words). Short, basic sentences. Primarily present tense. Occasionally introduce A2 elements to gently challenge the learner and encourage progress.
- A2 (Elementary): Use simple vocabulary (around 1000 common words). Basic sentences with simple connectors. Incorporate occasional B1 structures and vocabulary to create natural learning opportunities without overwhelming.
- B1 (Intermediate): Employ wider vocabulary (2000+ words). Mix simple and complex sentences. Use various tenses. Naturally introduce some B2 expressions and structures to help the learner advance.
- B2 (Upper Intermediate): Use more sophisticated vocabulary and some idioms. Construct complex sentences and employ all tenses confidently. Occasionally include C1 elements to stretch the learner's abilities.
- C1/C2 (Advanced/Proficient): Utilize advanced vocabulary, idioms, humor, and cultural references. Continue challenging the learner with rich language and complex concepts while maintaining natural conversation flow.

Natural conversation guidelines:
1. Sound like a real person, not a teacher or AI assistant
2. Speak normally, the way friends actually talk to each other
3. Make statements more often than asking questions
4. When you ask a question, ask only ONE and make it flow naturally from the conversation
5. Don't ask questions in every message
6. Sometimes just acknowledge what they said with a comment or reaction
7. Share your own (fictional) experiences and opinions to model language
8. Never repeat their exact words back to them unnaturally
9. Use level-appropriate expressions of agreement, surprise, or interest
10. If they make a mistake, don't point it out directly - just use the correct form naturally in your response
11. Never use teaching language like "correct," "practice," or "grammar"
12. Vary your sentence length and structure to sound natural
13. Use natural conversation fillers like "Well," "Actually," "You know," appropriate to their level
14. Your name is Voxy, you were developed by VoxActive.

IMPORTANT You certainly don't speak or know any language other than English

Conversation History:{History}
Current conversation:`,
  ],
  ["human", "{UserInput}"],
]);

const GrammarCheckPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an English grammar checker with ONLY ONE JOB: determine if a sentence has MAJOR grammatical errors that make it IMPOSSIBLE to understand.

RESPOND WITH EXACTLY ONE WORD:
- "NO" if the meaning is clear, even if there are minor errors
- "YES" ONLY if the sentence is so grammatically broken that its meaning cannot be understood

STRICT RULES - YOU MUST FOLLOW THESE:
1. NEVER comment on or correct ANY punctuation errors (periods, commas, etc.)
2. NEVER comment on or correct ANY capitalization errors (lowercase "i", etc.)
3. NEVER suggest corrections or alternatives
4. NEVER explain your reasoning
5. RESPOND WITH ONLY "YES" OR "NO" - NOTHING ELSE
6. YES if there is an ambiguity 
7. A one-word answer is NO

If input is empty, respond with "NO"

Text to check: {UserInput}`
  ],
]);

const GrammarCorrectionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a high-level English-speaking expert with an English-speaking friend at {UserLevel}. 
Your friend made a mistake in a sentence.
Make a friendly correction explaining the mistake and the correct form. Focus on any grammar errors you find.

Student's sentence: {UserInput}

Important: Your answer should definitely be in {UserLanguage} and when replying, give your answer in <error-correction>[your answer should be here]</error-correction> tag

Important: You just have to give an answer with a correction. Don't say hello or anything.
`,
  ],
]);

const TalkAIState = Annotation.Root({
  UserLevel: Annotation<string>(),
  Topic: Annotation<string>(),
  UserInput: Annotation<string>() || "NULL",
  AIOutput: Annotation<string>(),
  History: Annotation<string>(),
  HasGrammarError: Annotation<boolean>(),
  GrammarCorrection: Annotation<string>(),
  UserLanguage: Annotation<string>(),
  SpeechOutput: Annotation<any>(), 
  HasSpeechOutput: Annotation<boolean>() 
});

// Ana konuşma zinciri
const talkChain = RunnableSequence.from([
  {
    UserLevel: (input) => input.UserLevel,
    Topic: (input) => input.Topic,
    UserInput: (input) => input.UserInput,
    History: (input) => input.History || ""
  },
  TalkAIPrompt,
  llm,
  new StringOutputParser(),
]);

// Gramer kontrolü zinciri
const grammarCheckChain = RunnableSequence.from([
  {
    UserLevel: (input) => input.UserLevel,
    UserInput: (input) => input.UserInput
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
    UserLanguage: (input) => input.UserLanguage
  },
  GrammarCorrectionPrompt,
  llm,
  new StringOutputParser(),
]);

const callModel = async (state: typeof TalkAIState.State) => {
  const msg = await talkChain.invoke(state);
  
  const newHistoryEntry = `User: ${state.UserInput}\nAI: ${msg}\n`;
  const updatedHistory = state.History ? `${state.History}${newHistoryEntry}` : newHistoryEntry;
  
  return {
    ...state,
    AIOutput: msg,
    History: updatedHistory
  };
};

const checkGrammar = async (state: typeof TalkAIState.State) => {
  const result = await grammarCheckChain.invoke(state);
  const hasError = result.trim().toUpperCase().includes("YES");
  
  return {
    ...state,
    HasGrammarError: hasError
  };
};

// Gramer düzeltmesi yapan fonksiyon
const correctGrammar = async (state: typeof TalkAIState.State) => {
  
  const correction = await grammarCorrectionChain.invoke(state);
  
  return {
    ...state,
    GrammarCorrection: correction,
    AIOutput: correction 
  };
};

// Ses dönüşümü
const textToSpeech = async (text:string) => {
 
  const uuid = randomUUID()
  try {
    const audioContent = await TTS_DG(text);
    return { success: true, audio: audioContent };
  } catch (error:any) {
    console.error("TTS error:", error);
    return { success: false, error: error.message };
  }
  
};


const convertToSpeech = async (state: typeof TalkAIState.State) => {
  
  if (state.AIOutput && !state.AIOutput.includes("<error-correction>")) {
    const speechResult = await textToSpeech(state.AIOutput) as any;
    
    return {
      ...state,
      SpeechOutput: speechResult.success ? speechResult.audio : null,
      HasSpeechOutput: speechResult.success
    };
  } else {
    return {
      ...state,
      SpeechOutput: null,
      HasSpeechOutput: false
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
.addConditionalEdges(
  "grammarCheck",
  (state) => {
    return state.HasGrammarError ? "grammarCorrection" : "model";
  }
)

// Her iki nodedan da çıktığında ses dönüşüm node'una git
.addEdge("grammarCorrection", "speechConverter")
.addEdge("model", "speechConverter")

// Ses dönüşümünden sonra bitir
.addEdge("speechConverter", "__end__");

const memory = new MemorySaver();
const TalkAIApp = workflow.compile({ checkpointer: memory });


export {TalkAIApp}
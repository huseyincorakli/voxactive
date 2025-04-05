import { ChatPromptTemplate } from "@langchain/core/prompts"
import { Annotation, StateGraph } from "@langchain/langgraph"
import { createLLM } from "./llm"


const QuestionGeneratorState = Annotation.Root({
  UserLevel: Annotation<string>,
  UserLanguage: Annotation<string>,
  Topic: Annotation<string>,
  TargetGrammerTopic: Annotation<string>,
  Difficulty: Annotation<string>,
  GeneratedQuestion: Annotation<string>,
  Tips: Annotation<string>,
  PreviousQuestions: Annotation<string[]>
})

const QuestionGeneratorPrompt = ChatPromptTemplate.fromTemplate(`
  Generate a single question in {UserLanguage} about {Topic} that:
  - Uses the {TargetGrammerTopic} grammar concept
  - Matches {UserLevel} CEFR level
  - Contains EXACTLY ONE question mark at the end
  - Asks only ONE thing from the user
  - Difficulty :{Difficulty}

  DIFFICULTY LEVELS (must follow these guidelines):
  - Easy: Simple, basic vocabulary with 1 short sentence. Max 5-6 words.
  - Medium: 1 sentence with slightly more vocabulary. Max 8-10 words.
  - Hard: 2-3 sentences that provide context before asking the question. Use more specific vocabulary.
  - Expert: 3-4 sentences with complex structure, connecting ideas and providing detailed context.

  IMPORTANT: Generate ONLY ONE QUESTION. Do not use multiple question marks or create multiple questions.
  IMPORTANT: Always try to create different questions each time. Previous question to the user is: {PreviousQuestions}
  Response format: Return ONLY the question with no additional text.
`)

const TranslationTipsPrompt = ChatPromptTemplate.fromTemplate(`
   You are a good English teacher and ;
{UserLanguage} for the following question:
  
  “{GeneratedQuestion}”
  
  Create useful translation tips in {UserLanguage} to guide the user to translate this question into English on their own.
  
  The question uses the grammar concept {TargetGrammerTopic} and is designed for {UserLevel}. It is designed for CEFR level.
  
  1. DO NOT give the full translated sentence - help the user to solve it on their own
  2. Give a brief reminder specific to the {TargetGrammerTopic} grammatical structure in the question. Briefly explain the relevant grammar rule. 
  3. Add explanations that guide the learner through the translation process, not too long but easy for the learner to understand [maximum 5 tips]
  4. Focus on explaining HOW to translate, not WHAT to translate
  5. Write everything in {UserLanguage}
  6. Keep explanations short but educational
  7. Emphasize analyzing sentence structure (subject-predicate-object)
  8. Pay attention to verb tenses
  9. Draw attention to the use of auxiliary verbs, prepositions, definitions (the, a, an) that may be omitted or misused
  10. Use Markdown format (for headings: “###”, for articles: “-”)
  11. Help them recognize idiomatic expressions
  12. Just give tips, don't add anything else
`)
const llm =  createLLM("google/gemini-2.0-flash-lite-001",
  "https://openrouter.ai/api/v1",
  1.5)
const questionGeneratorChain = QuestionGeneratorPrompt.pipe(llm)
const translationTipsChain = TranslationTipsPrompt.pipe(llm)

async function generateQuestion(state: typeof QuestionGeneratorState.State) {
  // Initialize state variables if they don't exist
  const previousQuestions = state.PreviousQuestions || [];
  
  // Format previous questions as a formatted list for the prompt
  const formattedPreviousQuestions = previousQuestions.map((q, i) => `${i+1}. "${q}"`).join("\n");
  
  const msg = await questionGeneratorChain.invoke({
    Difficulty: state.Difficulty,
    TargetGrammerTopic: state.TargetGrammerTopic,
    Topic: state.Topic,
    UserLanguage: state.UserLanguage,
    UserLevel: state.UserLevel,
    PreviousQuestions: formattedPreviousQuestions,
  });

  const newQuestion = msg.content as string;
  
 
  
  return { 
    GeneratedQuestion: newQuestion,
    PreviousQuestions: [...previousQuestions, newQuestion],
  };
}
async function generateTranslationTips(state: typeof QuestionGeneratorState.State) {
  const msg = await translationTipsChain.invoke({
    GeneratedQuestion: state.GeneratedQuestion,
    UserLanguage: state.UserLanguage,
    UserLevel: state.UserLevel,
    TargetGrammerTopic: state.TargetGrammerTopic
  })

  return { Tips: msg.content }
}

const createQuestionGraph = new StateGraph(QuestionGeneratorState)
  .addNode("generateQuestion", generateQuestion)
  .addNode("generateTranslationTips", generateTranslationTips)
  .addEdge("__start__", "generateQuestion")
  .addEdge("generateQuestion", "generateTranslationTips")
  .addEdge("generateTranslationTips", "__end__")
  .compile();

export { createQuestionGraph };
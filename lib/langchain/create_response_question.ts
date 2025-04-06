import { ChatPromptTemplate } from "@langchain/core/prompts"
import { Annotation, StateGraph } from "@langchain/langgraph"
import { createLLM } from "./llm"

const ResponseQuestionState = Annotation.Root({
  UserLevel: Annotation<string>,
  UserLanguage: Annotation<string>,
  Topic: Annotation<string>,
  TargetGrammarTopic: Annotation<string>,
  Difficulty: Annotation<string>,
  GeneratedQuestion: Annotation<string>,
  AnswerTips: Annotation<string>,
  PreviousQuestions: Annotation<string[]>
})

const QuestionGeneratorPrompt = ChatPromptTemplate.fromTemplate(`
  Generate a single question in English about {Topic} that:
  - Uses the {TargetGrammarTopic} grammar concept
  - Matches {UserLevel} CEFR level
  - Contains EXACTLY ONE question mark at the end
  - Asks only ONE thing from the user that they need to answer
  - Difficulty: {Difficulty}

  DIFFICULTY LEVELS (must follow these guidelines):
  - Easy: Simple, basic vocabulary with 1 short sentence. Max 5-6 words.
  - Medium: 1 sentence with slightly more vocabulary. Max 8-10 words.
  - Hard: 2-3 sentences that provide context before asking the question. Use more specific vocabulary.
  - Expert: 3-4 sentences with complex structure, connecting ideas and providing detailed context.

  IMPORTANT: Generate ONLY ONE QUESTION. Do not use multiple question marks or create multiple questions.
  IMPORTANT: Always try to create different questions each time. Previous questions to the user are: {PreviousQuestions}
  !IMPORTANT: You should make sure that the created question follows proper English grammar rules.
  
  The question must be something that requires a personal response from the user, like "What is your job?" or "How do you spend your free time?"
  
  Response format: Return ONLY the question with no additional text.
`)

const AnswerTipsPrompt = ChatPromptTemplate.fromTemplate(`
  You are an excellent English teacher helping a user whose native language is {UserLanguage} to answer the following question in English:
  
  "{GeneratedQuestion}"
  
  Create useful tips in {UserLanguage} to guide the user on how to properly answer this question in English.
  
  The question uses the grammar concept {TargetGrammarTopic} and is designed for {UserLevel} CEFR level.
  
  1. DO NOT give a complete sample answer - help the user to formulate their own response
  2. Give a brief reminder specific to the {TargetGrammarTopic} grammatical structure they should use in their answer
  3. Provide sentence starters or useful phrases they can incorporate
  4. Explain what verb tense would be appropriate for their answer
  5. Suggest vocabulary that might be useful (3-5 relevant words/phrases)
  6. Mention any common mistakes to avoid when answering this type of question
  7. Write everything in {UserLanguage}
  8. Keep explanations short but educational
  9. Use Markdown format (for headings: "###", for bullet points: "-")
  10. Just give tips, don't add anything else
`)

const llm = createLLM("google/gemini-2.0-flash-lite-001",
  "https://openrouter.ai/api/v1",
  1.5)

const questionGeneratorChain = QuestionGeneratorPrompt.pipe(llm)
const answerTipsChain = AnswerTipsPrompt.pipe(llm)

async function generateQuestion(state: typeof ResponseQuestionState.State) {
  const previousQuestions = state.PreviousQuestions || [];
  
  const formattedPreviousQuestions = previousQuestions.map((q, i) => `${i+1}. "${q}"`).join("\n");
  
  const msg = await questionGeneratorChain.invoke({
    Difficulty: state.Difficulty,
    TargetGrammarTopic: state.TargetGrammarTopic,
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

async function generateAnswerTips(state: typeof ResponseQuestionState.State) {
  const msg = await answerTipsChain.invoke({
    GeneratedQuestion: state.GeneratedQuestion,
    UserLanguage: state.UserLanguage,
    UserLevel: state.UserLevel,
    TargetGrammarTopic: state.TargetGrammarTopic
  })

  return { AnswerTips: msg.content }
}

const createResponseQuestionGraph = new StateGraph(ResponseQuestionState)
  .addNode("generateQuestion", generateQuestion)
  .addNode("generateAnswerTips", generateAnswerTips)
  .addEdge("__start__", "generateQuestion")
  .addEdge("generateQuestion", "generateAnswerTips")
  .addEdge("generateAnswerTips", "__end__")
  .compile();

export { createResponseQuestionGraph };
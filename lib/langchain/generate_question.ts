import { ChatPromptTemplate } from "@langchain/core/prompts"
import { Annotation, StateGraph } from "@langchain/langgraph"
import { defaultLLM } from "./llm"

 const QuestionGeneratorState = Annotation.Root({
    UserLevel:Annotation<string>,
    UserLanguage:Annotation<string>,
    Topic:Annotation<string>,
    TargetGrammerTopic:Annotation<string>,
    Difficulty:Annotation<string>,
    GeneratedQuestion : Annotation<string>
  
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
    
  
    Response format: Return ONLY the question with no additional text.
  `)
  const questionGeneratorChain = QuestionGeneratorPrompt.pipe(defaultLLM)
  
  
  async function generateQuestion(state:typeof QuestionGeneratorState.State){
  const msg = await questionGeneratorChain.invoke({
    Difficulty:state.Difficulty,
    TargetGrammerTopic:state.TargetGrammerTopic,
    Topic:state.Topic,
    UserLanguage:state.UserLanguage,
    UserLevel:state.UserLevel
  })
  
  return {GeneratedQuestion:msg.content}
  }
  
  
  const createQuestionGraph = new StateGraph(QuestionGeneratorState)
  .addNode("generateQuestion",generateQuestion)
  .addEdge("__start__","generateQuestion")
  .addEdge("generateQuestion","__end__")
  .compile();
  
  
export {createQuestionGraph };
    
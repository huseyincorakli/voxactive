import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { defaultLLM } from "./llm";

const ResponseAnalysisState = Annotation.Root({
    GeneratedQuestion: Annotation<string>,   
    UserResponse: Annotation<string>,         
    UserLevel: Annotation<string>,
    UserLanguage: Annotation<string>,
    TargetGrammarTopic: Annotation<string>,
    
    GrammarFeedback: Annotation<string>,      
    VocabularyFeedback: Annotation<string>,   
    ContentFeedback: Annotation<string>,
    CorrectedResponse: Annotation<string>,
    ImprovedResponse: Annotation<string>
})

const ResponseAnalysisPrompt = ChatPromptTemplate.fromTemplate(`
  Analyze the following user's response to an English question.

  ENGLISH QUESTION: {GeneratedQuestion}
  USER LEVEL: {UserLevel}
  TARGET GRAMMAR CONCEPT: {TargetGrammarTopic}
  USER'S RESPONSE: {UserResponse}

  Important: The user is learning English and was asked to provide a response to the question.

  Please evaluate the response based on the following criteria:
  
  1. Grammar:
     - Identify any grammatical errors in the response
     - Provide specific feedback on grammar usage
     - Pay special attention to the use of {TargetGrammarTopic} in their response
  
  2. Vocabulary:
     - Evaluate the vocabulary used in the response
     - Comment on appropriateness and accuracy of word choice
     - Suggest alternative or additional vocabulary they could have used
  
  3. Content:
     - Determine if the user responded appropriately to the question
     - Assess if the response is complete and addresses all aspects of the question
     - Comment on the organization and clarity of their response
  
  VERY IMPORTANT: Provide ALL your feedback in {UserLanguage}, not in English!
  
  Provide your analysis in the following format:
  
  GRAMMAR FEEDBACK: [Detailed feedback on grammar usage in {UserLanguage}]
  
  VOCABULARY FEEDBACK: [Feedback on vocabulary usage in {UserLanguage}]
  
  CONTENT FEEDBACK: [Feedback on how well the user responded to the question, in {UserLanguage}]
  
  CORRECTED RESPONSE: [A grammatically corrected version of the user's response in English, keeping the same content]
  
  IMPROVED RESPONSE: [An enhanced version of the response showing better vocabulary and structure while maintaining the user's original meaning]
  
  !IMPORTANT: In the "CORRECTED RESPONSE" and "IMPROVED RESPONSE" sections, you should only give the corrected/improved text, you should not add comments etc.
  !IMPORTANT: Use "you" when you answer. Do not address as "user"

  Ensure your analysis is appropriate for a {UserLevel} CEFR level language learner. Be encouraging while providing constructive feedback.
`)

const responseAnalysisChain = ResponseAnalysisPrompt.pipe(defaultLLM)

async function analyzeResponse(state: typeof ResponseAnalysisState.State) {
  const msg = await responseAnalysisChain.invoke({
    GeneratedQuestion: state.GeneratedQuestion,
    UserLevel: state.UserLevel,
    UserResponse: state.UserResponse,
    UserLanguage: state.UserLanguage,
    TargetGrammarTopic: state.TargetGrammarTopic
  });

  const content = msg.content as string;
  console.log("Content:", content);
  
  const grammarMatch = content.match(/GRAMMAR FEEDBACK:([^]*?)(?=VOCABULARY FEEDBACK:|$)/s);
  const vocabMatch = content.match(/VOCABULARY FEEDBACK:([^]*?)(?=CONTENT FEEDBACK:|$)/s);
  const contentMatch = content.match(/CONTENT FEEDBACK:([^]*?)(?=CORRECTED RESPONSE:|$)/s);
  const correctedMatch = content.match(/CORRECTED RESPONSE:([^]*?)(?=IMPROVED RESPONSE:|$)/s);
  const improvedMatch = content.match(/IMPROVED RESPONSE:([^]*?)$/s);
  
  const grammarFeedback = grammarMatch ? grammarMatch[1].trim() : "No grammar feedback provided.";
  const vocabularyFeedback = vocabMatch ? vocabMatch[1].trim() : "No vocabulary feedback provided.";
  let contentFeedback = contentMatch ? contentMatch[1].trim() : "No content feedback provided.";
  
  if (contentFeedback.includes("CORRECTED RESPONSE:")) {
    contentFeedback = contentFeedback.split("CORRECTED RESPONSE:")[0].trim();
  }
  
  const correctedResponse = correctedMatch ? correctedMatch[1].trim() : state.UserResponse;
  const improvedResponse = improvedMatch ? improvedMatch[1].trim() : correctedResponse;
  
  return {
    GrammarFeedback: grammarFeedback,
    VocabularyFeedback: vocabularyFeedback,
    ContentFeedback: contentFeedback,
    CorrectedResponse: correctedResponse,
    ImprovedResponse: improvedResponse
  };
}

const responseAnalysisGraph = new StateGraph(ResponseAnalysisState)
  .addNode("analyzeResponse", analyzeResponse)
  .addEdge("__start__", "analyzeResponse")
  .addEdge("analyzeResponse", "__end__")
  .compile();

export { responseAnalysisGraph };
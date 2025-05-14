import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "./llm";
import { ResponseAnalysisPrompt_Constant } from "../prompts";

const llm = createLLM(
  process.env.NEXT_DEFAULT_MODEL,
  process.env.NEXT_MODEL_BASEURL,
  1
);
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
  ImprovedResponse: Annotation<string>,
});

const ResponseAnalysisPrompt = ChatPromptTemplate.fromTemplate(
  ResponseAnalysisPrompt_Constant
);

const responseAnalysisChain = ResponseAnalysisPrompt.pipe(llm);

async function analyzeResponse(state: typeof ResponseAnalysisState.State) {
  const msg = await responseAnalysisChain.invoke({
    GeneratedQuestion: state.GeneratedQuestion,
    UserLevel: state.UserLevel,
    UserResponse: state.UserResponse,
    UserLanguage: state.UserLanguage,
    TargetGrammarTopic: state.TargetGrammarTopic,
  });

  const content = msg.content as string;

  const grammarMatch = content.match(
    /GRAMMAR FEEDBACK:([^]*?)(?=VOCABULARY FEEDBACK:|$)/s
  );
  const vocabMatch = content.match(
    /VOCABULARY FEEDBACK:([^]*?)(?=CONTENT FEEDBACK:|$)/s
  );
  const contentMatch = content.match(
    /CONTENT FEEDBACK:([^]*?)(?=CORRECTED RESPONSE:|$)/s
  );
  const correctedMatch = content.match(
    /CORRECTED RESPONSE:([^]*?)(?=IMPROVED RESPONSE:|$)/s
  );
  const improvedMatch = content.match(/IMPROVED RESPONSE:([^]*?)$/s);

  const grammarFeedback = grammarMatch
    ? grammarMatch[1].trim()
    : "No grammar feedback provided.";
  const vocabularyFeedback = vocabMatch
    ? vocabMatch[1].trim()
    : "No vocabulary feedback provided.";
  let contentFeedback = contentMatch
    ? contentMatch[1].trim()
    : "No content feedback provided.";

  if (contentFeedback.includes("CORRECTED RESPONSE:")) {
    contentFeedback = contentFeedback.split("CORRECTED RESPONSE:")[0].trim();
  }

  const correctedResponse = correctedMatch
    ? correctedMatch[1].trim()
    : state.UserResponse;
  const improvedResponse = improvedMatch
    ? improvedMatch[1].trim()
    : correctedResponse;

  return {
    GrammarFeedback: grammarFeedback,
    VocabularyFeedback: vocabularyFeedback,
    ContentFeedback: contentFeedback,
    CorrectedResponse: correctedResponse,
    ImprovedResponse: improvedResponse,
  };
}

const responseAnalysisGraph = new StateGraph(ResponseAnalysisState)
  .addNode("analyzeResponse", analyzeResponse)
  .addEdge("__start__", "analyzeResponse")
  .addEdge("analyzeResponse", "__end__")
  .compile();

export { responseAnalysisGraph };

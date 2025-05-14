import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { defaultLLM } from "./llm";
import { TranslationAnalysisPrompt_Constant } from "../prompts";

const AnswerAnalysisState = Annotation.Root({
  GeneratedQuestion: Annotation<string>,
  UserResponse: Annotation<string>,
  UserLevel: Annotation<string>,
  UserLanguage: Annotation<string>,
  TargetGrammarTopic: Annotation<string>,

  GrammarFeedback: Annotation<string>,
  VocabularyFeedback: Annotation<string>,
  ComprehensionFeedback: Annotation<string>,
  CorrectedResponse: Annotation<string>,
});

const TranslationAnalysisPrompt = ChatPromptTemplate.fromTemplate(
  TranslationAnalysisPrompt_Constant
);

const analysisChain = TranslationAnalysisPrompt.pipe(defaultLLM);

async function analysisQuestion(state: typeof AnswerAnalysisState.State) {
  const msg = await analysisChain.invoke({
    GeneratedQuestion: state.GeneratedQuestion,
    UserLevel: state.UserLevel,
    UserResponse: state.UserResponse,
    UserLanguage: state.UserLanguage,
    TargetGrammarTopic: state.TargetGrammarTopic,
  });

  const content = msg.content as string;
  console.log("Content:", content);

  const grammarMatch = content.match(
    /GRAMMAR FEEDBACK:([^]*?)(?=VOCABULARY FEEDBACK:|$)/s
  );
  const vocabMatch = content.match(
    /VOCABULARY FEEDBACK:([^]*?)(?=COMPREHENSION FEEDBACK:|$)/s
  );
  const compMatch = content.match(
    /COMPREHENSION FEEDBACK:([^]*?)(?=CORRECTED TRANSLATION:|$)/s
  );
  const correctedMatch = content.match(/CORRECTED TRANSLATION:([^]*?)$/s);
  const grammarFeedback = grammarMatch
    ? grammarMatch[1].trim()
    : "No grammar feedback provided.";
  const vocabularyFeedback = vocabMatch
    ? vocabMatch[1].trim()
    : "No vocabulary feedback provided.";

  let comprehensionFeedback = compMatch
    ? compMatch[1].trim()
    : "No comprehension feedback provided.";

  if (comprehensionFeedback.includes("CORRECTED TRANSLATION:")) {
    comprehensionFeedback = comprehensionFeedback
      .split("CORRECTED TRANSLATION:")[0]
      .trim();
  }

  const correctedResponse = correctedMatch
    ? correctedMatch[1].trim()
    : state.UserResponse;
  return {
    GrammarFeedback: grammarFeedback,
    VocabularyFeedback: vocabularyFeedback,
    ComprehensionFeedback: comprehensionFeedback,
    CorrectedResponse: correctedResponse,
  };
}

const answerAnalysisGraph = new StateGraph(AnswerAnalysisState)
  .addNode("analysisQuestion", analysisQuestion)
  .addEdge("__start__", "analysisQuestion")
  .addEdge("analysisQuestion", "__end__")
  .compile();

export { answerAnalysisGraph };

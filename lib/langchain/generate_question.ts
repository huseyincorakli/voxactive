import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "./llm";
import {
  QuestionGeneratorPrompt_Constant,
  TranslationTipsPrompt_Constant,
} from "../prompts";

const QuestionGeneratorState = Annotation.Root({
  UserLevel: Annotation<string>,
  UserLanguage: Annotation<string>,
  TargetGrammerTopic: Annotation<string>,
  Difficulty: Annotation<string>,
  GeneratedQuestion: Annotation<string>,
  Tips: Annotation<string>,
  PreviousQuestions: Annotation<string[]>,
});

const QuestionGeneratorPrompt = ChatPromptTemplate.fromTemplate(
  QuestionGeneratorPrompt_Constant
);

const TranslationTipsPrompt = ChatPromptTemplate.fromTemplate(
  TranslationTipsPrompt_Constant
);
const llm = createLLM(
  process.env.NEXT_DEFAULT_MODEL,
  process.env.NEXT_MODEL_BASEURL,
  1.5
);
const questionGeneratorChain = QuestionGeneratorPrompt.pipe(llm);
const translationTipsChain = TranslationTipsPrompt.pipe(llm);

async function generateQuestion(state: typeof QuestionGeneratorState.State) {
  console.log(state);

  const previousQuestions = state.PreviousQuestions || [];

  const formattedPreviousQuestions = previousQuestions
    .map((q, i) => `${i + 1}. "${q}"`)
    .join("\n");
  console.log(state);

  const msg = await questionGeneratorChain.invoke({
    Difficulty: state.Difficulty,
    TargetGrammerTopic: state.TargetGrammerTopic,
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
async function generateTranslationTips(
  state: typeof QuestionGeneratorState.State
) {
  const msg = await translationTipsChain.invoke({
    GeneratedQuestion: state.GeneratedQuestion,
    UserLanguage: state.UserLanguage,
    UserLevel: state.UserLevel,
    TargetGrammerTopic: state.TargetGrammerTopic,
  });

  return { Tips: msg.content };
}

const createQuestionGraph = new StateGraph(QuestionGeneratorState)
  .addNode("generateQuestion", generateQuestion)
  .addNode("generateTranslationTips", generateTranslationTips)
  .addEdge("__start__", "generateQuestion")
  .addEdge("generateQuestion", "generateTranslationTips")
  .addEdge("generateTranslationTips", "__end__")
  .compile();

export { createQuestionGraph };

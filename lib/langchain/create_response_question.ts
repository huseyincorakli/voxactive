import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "./llm";
import {
  CreateResponseQuestionPrompt_Constant,
  ResponseQuestionTipsPrompt_Constant,
} from "../prompts";

const ResponseQuestionState = Annotation.Root({
  UserLevel: Annotation<string>,
  UserLanguage: Annotation<string>,
  Topic: Annotation<string>,
  TargetGrammarTopic: Annotation<string>,
  Difficulty: Annotation<string>,
  GeneratedQuestion: Annotation<string>,
  AnswerTips: Annotation<string>,
  PreviousQuestions: Annotation<string[]>,
});

const QuestionGeneratorPrompt = ChatPromptTemplate.fromTemplate(
  CreateResponseQuestionPrompt_Constant
);

const AnswerTipsPrompt = ChatPromptTemplate.fromTemplate(
  ResponseQuestionTipsPrompt_Constant
);

const llm = createLLM(
  process.env.NEXT_DEFAULT_MODEL,
  process.env.NEXT_MODEL_BASEURL,
  1.5
);

const questionGeneratorChain = QuestionGeneratorPrompt.pipe(llm);
const answerTipsChain = AnswerTipsPrompt.pipe(llm);

async function generateQuestion(state: typeof ResponseQuestionState.State) {
  const previousQuestions = state.PreviousQuestions || [];

  const formattedPreviousQuestions = previousQuestions
    .map((q, i) => `${i + 1}. "${q}"`)
    .join("\n");

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
    TargetGrammarTopic: state.TargetGrammarTopic,
  });

  return { AnswerTips: msg.content };
}

const createResponseQuestionGraph = new StateGraph(ResponseQuestionState)
  .addNode("generateQuestion", generateQuestion)
  .addNode("generateAnswerTips", generateAnswerTips)
  .addEdge("__start__", "generateQuestion")
  .addEdge("generateQuestion", "generateAnswerTips")
  .addEdge("generateAnswerTips", "__end__")
  .compile();

export { createResponseQuestionGraph };

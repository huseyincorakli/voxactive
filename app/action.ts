"use server";

import { checkBlocked, createUsage } from "@/lib/db/db";
import { responseAnalysisGraph } from "@/lib/langchain/analyze_q_response";
import { answerAnalysisGraph } from "@/lib/langchain/analyze_question";
import { createResponseQuestionGraph } from "@/lib/langchain/create_response_question";
import { createQuestionGraph } from "@/lib/langchain/generate_question";
import { TalkAIApp } from "@/lib/langchain/talk_ai";
import { cookies } from "next/headers";
import { YoutubeTranscript } from "youtube-transcript";

interface TalkAIParams {
  UserLevel: string;
  Topic: string;
  UserInput: string;
  History?: string;
  UserLanguage: string;
  threadId?: string;
}

export async function generateQuestion(formData: any) {
  const blocked = await isBlocked();
  if (blocked) {
    return {
      success: false,
      redirect: "limit-reached",
      data: "",
      message: "Your daily limit has been reached",
    };
  }
  const userLevel = formData.get("userLevel");
  const targetGrammerTopic = formData.get("targetGrammarTopic");
  const difficulty = formData.get("difficulty");
  const userLanguage = formData.get("userLanguage");

  const previousQuestionsStr = formData.get("previousQuestions") || "[]";
  let previousQuestions;
  try {
    previousQuestions = JSON.parse(previousQuestionsStr);
    if (!Array.isArray(previousQuestions)) {
      previousQuestions = [];
    }
  } catch (e) {
    previousQuestions = [];
  }

  const mostRecentQuestion = formData.get("previousQuestion");
  if (
    mostRecentQuestion &&
    typeof mostRecentQuestion === "string" &&
    mostRecentQuestion.trim() !== ""
  ) {
    if (!previousQuestions.includes(mostRecentQuestion)) {
      previousQuestions.push(mostRecentQuestion);
    }
  }

  try {
    const response = await createQuestionGraph.invoke({
      UserLevel: userLevel,
      Difficulty: difficulty,
      UserLanguage: userLanguage,
      PreviousQuestions: previousQuestions,
      TargetGrammerTopic: targetGrammerTopic,
    });
    return {
      success: true,
      data: response.GeneratedQuestion,
      tips: response.Tips,
    };
  } catch (error) {
    console.error("Error generating question:", error);
    return {
      success: false,
      data: "",
      message:
        error.message || "An error occurred while generating the question.",
    };
  }
}

export type AnalyzeQuestion = {
  generatedQuestion: string;
  userResponse: string;
  userLevel: string;
  userLanguage: string;
};

export async function analyzeQuestion(AnalyzeQuestion: AnalyzeQuestion) {
  const blocked = await isBlocked();
  if (blocked) {
    return {
      success: false,
      redirect: "limit-reached",
      data: "",
      message: "Your daily limit has been reached",
    };
  }
  const { generatedQuestion, userResponse, userLevel, userLanguage } =
    AnalyzeQuestion;

  try {
    const response = await answerAnalysisGraph.invoke({
      GeneratedQuestion: generatedQuestion,
      UserLevel: userLevel,
      UserResponse: userResponse,
      UserLanguage: userLanguage,
    });

    const FeedBack = {
      GrammarFeedback: response.GrammarFeedback,
      VocabularyFeedback: response.VocabularyFeedback,
      ComprehensionFeedback: response.ComprehensionFeedback,
    };
    const CorrectedResponse = response.CorrectedResponse;

    return {
      success: true,
      data: {
        FeedBack,
        CorrectedResponse,
      },
    };
  } catch (error) {
    console.error("Error analyzing question:", error);
    return {
      success: false,
      data: "",
      message:
        error.message || "An error occurred while analyzing the question.",
    };
  }
}

export async function analyzeResponse(AnalyzeQuestion: AnalyzeQuestion) {
  const blocked = await isBlocked();
  if (blocked) {
    return {
      success: false,
      redirect: "limit-reached",
      data: "",
      message: "Your daily limit has been reached",
    };
  }
  const { generatedQuestion, userResponse, userLevel, userLanguage } =
    AnalyzeQuestion;

  try {
    const response = await responseAnalysisGraph.invoke({
      GeneratedQuestion: generatedQuestion,
      UserLevel: userLevel,
      UserResponse: userResponse,
      UserLanguage: userLanguage,
    });

    const FeedBack = {
      GrammarFeedback: response.GrammarFeedback,
      VocabularyFeedback: response.VocabularyFeedback,
      ContentFeedback: response.ContentFeedback,
    };
    const CorrectedResponse = response.CorrectedResponse;
    const ImprovedResponse = response.ImprovedResponse;

    return {
      success: true,
      data: {
        FeedBack,
        CorrectedResponse,
        ImprovedResponse,
      },
    };
  } catch (error) {
    console.error("Error analyzing response:", error);
    return {
      success: false,
      data: "",
      message:
        error.message || "An error occurred while analyzing the response.",
    };
  }
}

export async function generateResponseQuestion(formData: any) {
  const blocked = await isBlocked();
  if (blocked) {
    return {
      success: false,
      redirect: "limit-reached",
      data: "",
      message: "Your daily limit has been reached",
    };
  }
  const userLevel = formData.get("userLevel");
  const topic = formData.get("topic");
  const targetGrammarTopic = formData.get("targetGrammarTopic");
  const difficulty = formData.get("difficulty");
  const userLanguage = formData.get("userLanguage");

  const previousQuestionsStr = formData.get("previousQuestions") || "[]";
  let previousQuestions;
  try {
    previousQuestions = JSON.parse(previousQuestionsStr);
    if (!Array.isArray(previousQuestions)) {
      previousQuestions = [];
    }
  } catch (e) {
    previousQuestions = [];
  }

  const mostRecentQuestion = formData.get("previousQuestion");
  if (
    mostRecentQuestion &&
    typeof mostRecentQuestion === "string" &&
    mostRecentQuestion.trim() !== ""
  ) {
    if (!previousQuestions.includes(mostRecentQuestion)) {
      previousQuestions.push(mostRecentQuestion);
    }
  }

  try {
    const response = await createResponseQuestionGraph.invoke({
      UserLevel: userLevel,
      Topic: topic,
      TargetGrammarTopic: targetGrammarTopic,
      Difficulty: difficulty,
      UserLanguage: userLanguage,
      PreviousQuestions: previousQuestions,
    });

    return {
      success: true,
      data: response.GeneratedQuestion,
      tips: response.AnswerTips,
    };
  } catch (error) {
    console.error("Error generating response question:", error);
    return {
      success: false,
      data: "",
      message:
        error.message ||
        "An error occurred while generating the response question.",
    };
  }
}

export async function talkAI(params: TalkAIParams) {
  const threadId = params.threadId || "default_thread";

  const blocked = await isBlocked();
  if (blocked) {
    return {
      success: false,
      redirect: "limit-reached",
      error: {
        message: "Your daily limit has been reached",
        code: "TALKAI_ERROR",
      },
      threadId,
    };
  }

  const config = {
    configurable: { thread_id: threadId },
  };

  try {
    const response = await TalkAIApp.invoke(
      {
        UserLevel: params.UserLevel,
        Topic: params.Topic,
        UserInput: params.UserInput,
        History: params.History || "",
        UserLanguage: params.UserLanguage,
      },
      config
    );

    const safeAudio = response.SpeechOutput?.audioBuffer
      ? Buffer.from(response.SpeechOutput.audioBuffer).toString("base64")
      : null;

    return {
      success: true,
      data: {
        ...response,
        SpeechOutput: {
          audioUrl: response.SpeechOutput?.audioUrl,
          audioBase64: safeAudio,
        },
      },
      threadId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || "TALKAI_ERROR",
      },
      threadId,
    };
  }
}

async function getUserCookie() {
  const cookieStore = cookies();
  const userCookie = (await cookieStore).get("user");

  if (!userCookie) {
    return {
      success: false,
      message: "Cookie not found.",
    };
  }

  return {
    success: true,
    cookieValue: userCookie,
  };
}

export async function isBlocked() {
  const user = await getUserCookie();
  if (user.success) {
    return await checkBlocked(user.cookieValue.value);
  } else {
    return false;
  }
}

export async function getTranscriptYoutube(videoId: string) {
  try {
    const response = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });
    return response;
  } catch (error) {
    return {
      success: false,
      message: "Transcript not found",
    };
  }
}

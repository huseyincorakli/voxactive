"use server";

export async function generateQuestion(formData: any) {
  const userLevel = formData.get("userLevel");
  const topic = formData.get("topic");
  const targetGrammerTopic = formData.get("targetGrammerTopic");
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
  if (mostRecentQuestion && typeof mostRecentQuestion === 'string' && mostRecentQuestion.trim() !== '') {
    if (!previousQuestions.includes(mostRecentQuestion)) {
      previousQuestions.push(mostRecentQuestion);
    }
  }

  const params = new URLSearchParams({
    userLevel,
    topic,
    targetGrammerTopic,
    difficulty,
    userLanguage,
    previousQuestion: JSON.stringify(previousQuestions)
  });

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = process.env.VERCEL_URL || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  const response = await fetch(`${baseUrl}/api/question/generateQuestion?${params}`, {
    method: "GET",
    cache: "no-store"
  });

  return response.json();
}

export type AnalyzeQuestion = {
  generatedQuestion: string;
  userResponse: string;
  userLevel: string;
  userLanguage: string;
}

export async function analyzeQuestion(AnalyzeQuestion: AnalyzeQuestion) {
  console.log("triggered");

  const { generatedQuestion, userResponse, userLevel, userLanguage } = AnalyzeQuestion;
  const params = new URLSearchParams({
    generatedQuestion,
    userResponse,
    userLevel,
    userLanguage
  });

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = process.env.VERCEL_URL || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  const response = await fetch(`${baseUrl}/api/question/analyseQuestion?${params}`, {
    method: "GET",
    cache: "no-store"
  });
  console.log(response);


  return response.json();
}



export async function generateResponseQuestion(formData: any) {
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
  if (mostRecentQuestion && typeof mostRecentQuestion === 'string' && mostRecentQuestion.trim() !== '') {
    if (!previousQuestions.includes(mostRecentQuestion)) {
      previousQuestions.push(mostRecentQuestion);
    }
  }

  const params = new URLSearchParams({
    userLevel,
    topic,
    targetGrammarTopic,
    difficulty,
    userLanguage,
    previousQuestion: JSON.stringify(previousQuestions)
  });

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = process.env.VERCEL_URL || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  const response = await fetch(`${baseUrl}/api/response-question/generate?${params}`, {
    method: "GET",
    cache: "no-store"
  });

  return response.json();
}

import { createQuestionGraph } from "@/lib/langchain/generate_question";

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  const userLevel = url.searchParams.get("userLevel") || "A1";
  const topic = url.searchParams.get("topic") || "General";
  const targetGrammerTopic = url.searchParams.get("targetGrammerTopic") || "Simple Present Tense";
  const difficulty = url.searchParams.get("difficulty") || "HARD";
  const userLanguage = url.searchParams.get("userLanguage") || "Turkish";
  const previousQuestion = url.searchParams.get("previousQuestion") || "";
  
  const previousQuestionsArray = previousQuestion ? 
    [previousQuestion] : 
    [];                 
  
  try {
    const response = await createQuestionGraph.invoke({
      UserLevel: userLevel,
      Topic: topic,
      TargetGrammerTopic: targetGrammerTopic,
      Difficulty: difficulty,
      UserLanguage: userLanguage,
      PreviousQuestions: previousQuestionsArray  
    });
    
    return Response.json(
      { success: true, data: response.GeneratedQuestion, tips: response.Tips },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating question:", error);
    return Response.json(
      { success: false, data: "", message: error },
      { status: 500 }
    );
  }
}
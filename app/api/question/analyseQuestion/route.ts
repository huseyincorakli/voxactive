// import { answerAnalysisGraph } from "@/lib/langchain/analyze_question";

// export async function GET(request: Request) {
//     const url = new URL(request.url);

//     const generatedQuestion = url.searchParams.get("generatedQuestion") || ""
//     const userResponse = url.searchParams.get("userResponse") || ""
//     const userLevel = url.searchParams.get("userLevel") || ""
//     const userLanguage = url.searchParams.get("userLanguage") || ""
//     const targetGrammarTopic = url.searchParams.get("targetGrammarTopic") || ""

//     try {
//         const response = await answerAnalysisGraph.invoke({
//             GeneratedQuestion: generatedQuestion,
//             UserLevel: userLevel,
//             UserResponse: userResponse,
//             UserLanguage: userLanguage,
//             TargetGrammarTopic: targetGrammarTopic

//         })
//         const  FeedBack = {
//             GrammarFeedback: response.GrammarFeedback,
//             VocabularyFeedback: response.VocabularyFeedback,
//             ComprehensionFeedback: response.ComprehensionFeedback,
//         }
//         const CorrectedResponse = response.CorrectedResponse
//         return Response.json(
//             { success: true, data: {
//                 FeedBack,
//                 CorrectedResponse
//             },  },
//             { status: 200 }
//           );
//     } catch (error) {
//         return Response.json(
//             { success: false, data: "", message: error },
//         );
//     }

// }

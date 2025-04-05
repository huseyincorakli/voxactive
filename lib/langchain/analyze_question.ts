import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { defaultLLM } from "./llm";

const AnswerAnalysisState = Annotation.Root({
    GeneratedQuestion: Annotation<string>,   
    UserResponse: Annotation<string>,         
    UserLevel: Annotation<string>,
    UserLanguage:Annotation<string>,           
    
    GrammarFeedback: Annotation<string>,      
    VocabularyFeedback: Annotation<string>,   
    ComprehensionFeedback: Annotation<string>,
    CorrectedResponse: Annotation<string>,  
  })
  
  
  const TranslationAnalysisPrompt = ChatPromptTemplate.fromTemplate(`
    Analyze the following user translation of a question from {UserLanguage} to English.
  
    ORIGINAL QUESTION IN {UserLanguage}: {GeneratedQuestion}
    USER LEVEL: {UserLevel}
    USER'S ENGLISH TRANSLATION: {UserResponse}
  
    Important: The user's task was ONLY to translate the question correctly into English, not to answer it.
  
    Please evaluate the translation based on the following criteria:
    
    1. Grammar:
       - Identify any grammatical errors in the translation
       - Provide specific feedback on grammar usage
    
    2. Vocabulary:
       - Evaluate the vocabulary used in the translation
       - Comment on appropriateness and accuracy of word choice
    
    3. Comprehension:
       - Determine if the user understood the original question correctly
       - Assess if the translation captures all aspects of the original question
    
    VERY IMPORTANT: Provide ALL your feedback in {UserLanguage}, not in English!
    
    Provide your analysis in the following format:
    
    GRAMMAR FEEDBACK: [Detailed feedback on grammar usage in {UserLanguage}]
    
    VOCABULARY FEEDBACK: [Feedback on vocabulary usage in {UserLanguage}]
    
    COMPREHENSION FEEDBACK: [Feedback on how well the user understood the original question, in {UserLanguage}]
    
    CORRECTED TRANSLATION: [A corrected version of the user's translation in English]
    
    !IMPORTANT : In the "CORRECTED TRANSLATION" section, you should only give the corrected translation, you should not add comments etc.
    !IMPORTANT : Use “you” when you answer. Do not address as “user”
  
    Ensure your analysis is appropriate for a {UserLevel} CEFR level language learner. Be encouraging while providing constructive feedback.
  `)
  
  const analysisChain = TranslationAnalysisPrompt.pipe(defaultLLM)
  
  async function analysisQuestion(state: typeof AnswerAnalysisState.State) {
    const msg = await analysisChain.invoke({
      GeneratedQuestion: state.GeneratedQuestion,
      UserLevel: state.UserLevel,
      UserResponse: state.UserResponse,
      UserLanguage:state.UserLanguage
    });
  
    const content = msg.content as string;
    console.log("Content:", content);
    
    
    const grammarMatch = content.match(/GRAMMAR FEEDBACK:([^]*?)(?=VOCABULARY FEEDBACK:|$)/s);
    const vocabMatch = content.match(/VOCABULARY FEEDBACK:([^]*?)(?=COMPREHENSION FEEDBACK:|$)/s);
    const compMatch = content.match(/COMPREHENSION FEEDBACK:([^]*?)(?=CORRECTED TRANSLATION:|$)/s);
    const correctedMatch = content.match(/CORRECTED TRANSLATION:([^]*?)$/s);
    const grammarFeedback = grammarMatch ? grammarMatch[1].trim() : "No grammar feedback provided.";
    const vocabularyFeedback = vocabMatch ? vocabMatch[1].trim() : "No vocabulary feedback provided.";
    
    let comprehensionFeedback = compMatch ? compMatch[1].trim() : "No comprehension feedback provided.";
    
    if (comprehensionFeedback.includes("CORRECTED TRANSLATION:")) {
      comprehensionFeedback = comprehensionFeedback.split("CORRECTED TRANSLATION:")[0].trim();
    }
    
    const correctedResponse = correctedMatch ? correctedMatch[1].trim() : state.UserResponse;
    return {
      GrammarFeedback: grammarFeedback,
      VocabularyFeedback: vocabularyFeedback,
      ComprehensionFeedback: comprehensionFeedback,
      CorrectedResponse: correctedResponse
    };
  }
  
  const answerAnalysisGraph = new StateGraph(AnswerAnalysisState)
    .addNode("analysisQuestion", analysisQuestion)
    .addEdge("__start__", "analysisQuestion")
    .addEdge("analysisQuestion", "__end__")
    .compile();
  

    export {answerAnalysisGraph};
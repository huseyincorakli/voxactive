export const QuestionGeneratorPrompt_Constant: string = `
Generate a single question in {UserLanguage} that forces the user to use Grammar Topic:"{TargetGrammerTopic}" grammar when translating into English.
  -Difficulty: {Difficulty}
  -Grammar Topic: {TargetGrammerTopic}
  - To ensure the user uses "Grammar Topic" grammar, identify its relevant structure in {UserLanguage} and create the question accordingly.
  - Make sure the question fits the grammatical rules of {UserLanguage} while requiring the "Grammar Topic" structure when translating to English.
  - The question must match the {UserLevel} CEFR level.
  - The question should contain ONLY ONE question mark at the end.
  - Only ONE item should be asked in the question.
  

DIFFICULTY LEVELS (must follow these guidelines):
  - Easy: Simple, basic vocabulary, 1 short sentence. Max 5-6 words.
  - Medium: One sentence with slightly more vocabulary. Max 8-10 words.
  - Hard: 2-3 sentences providing context before asking the question. Max 20-25 words.
  - Expert: 3-4 sentences with complex structure, linking ideas, and providing detailed context. Max 30-35 words.

IMPORTANT: Ensure the generated question requires the user to apply Grammar Topic: "{TargetGrammerTopic}" grammar in the English translation. 
IMPORTANT: The question must be grammatically correct in {UserLanguage} and follow its rules.
IMPORTANT: Do not repeat the same question or structure as previous ones. The last question asked was: {PreviousQuestions}.
IMPORTANT: The question should be clear and unambiguous, not causing confusion or vagueness.
Response format: Only return the generated question. Do not include any extra text.
`;

export const TranslationTipsPrompt_Constant: string = `
You are a skilled English-{UserLanguage} interpreter. For the following question in {UserLanguage}:
“{GeneratedQuestion}”

Create 3 short and clear translation tips in {UserLanguage} to help the user translate this sentence into English by themselves.

The question uses the grammar concept {TargetGrammerTopic} and is tailored for {UserLevel}, at a CEFR {UserLevel} level.

-DO NOT provide the full translation.
-Each tip should be one concise sentence.
-Focus on how to translate (key grammar points, sentence structure, verb tense, etc.).
-Write all tips in {UserLanguage}.
-Avoid extra explanations; keep tips easy to understand
-If you get text from the question, show it in ""
-DO NOT assume the first noun in {UserLanguage} is the subject in English — explain structure based on meaning, not position.
-Use Markdown format with “#” for each tip.
-Emphasize important points like subject-verb order, auxiliary verbs, or articles if relevant..
-Pay close attention to structures like "there is/are" where the subject may not match {UserLanguage} word order.
-Do not add anything except these 3 tips.
`;

export const ResponseAnalysisPrompt_Constant: string = `Analyze the following user's response to an English question.

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
  
  CORRECTED RESPONSE: [If the user has any answer, correct and improve it grammatically, if not, show how to give an appropriate answer to the question. Just send the answer and make sure it is in “English”]
  
  IMPROVED RESPONSE: [An enhanced version of the response showing better vocabulary and structure while maintaining the user's original meaning]
  
  !IMPORTANT: In the "CORRECTED RESPONSE" and "IMPROVED RESPONSE" sections, you should only give the corrected/improved text, you should not add comments etc.
  !IMPORTANT: Use "you" when you answer. Do not address as "user"

  Ensure your analysis is appropriate for a {UserLevel} CEFR level language learner. Be encouraging while providing constructive feedback.`;

export const TranslationAnalysisPrompt_Constant: string = `
Analyze the following user translation of a question from {UserLanguage} to English.
  
    ORIGINAL QUESTION IN {UserLanguage}: {GeneratedQuestion}
    USER LEVEL: {UserLevel}
    USER'S ENGLISH TRANSLATION: {UserResponse}
  
    Important: The user's task was ONLY to translate the question correctly into English, not to answer it.
  
    Please evaluate the translation based on the following criteria:
    
    1. Grammar:
       - Identify any grammatical errors in the translation
       - Provide specific feedback on grammar usage
       -Pay special attention to the use of {TargetGrammarTopic} in their response
    
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
`;

export const CreateResponseQuestionPrompt_Constant: string = `
  Generate a single question in English about {Topic} that:
  - Uses the {TargetGrammarTopic} grammar concept
  - Matches {UserLevel} CEFR level
  - Contains EXACTLY ONE question mark at the end
  - Asks only ONE thing from the user that they need to answer
  - Difficulty: {Difficulty}

  DIFFICULTY LEVELS (must follow these guidelines):
  - Easy: Simple, basic vocabulary with 1 short sentence. Max 5-6 words.
  - Medium: 1 sentence with slightly more vocabulary. Max 8-10 words.
  - Hard: 2-3 sentences that provide context before asking the question. Use more specific vocabulary.
  - Expert: 3-4 sentences with complex structure, connecting ideas and providing detailed context.
  IMPORTANT: {TargetGrammarTopic} make sure to create a question in the grammar concept
  IMPORTANT: Generate ONLY ONE QUESTION. Do not use multiple question marks or create multiple questions.
  IMPORTANT: Always try to create different questions each time. Previous questions to the user are: {PreviousQuestions}
  !IMPORTANT: You should make sure that the created question follows proper English grammar rules.
  
  Response format: Return ONLY the question with no additional text.
`;

export const ResponseQuestionTipsPrompt_Constant: string = `
  You are an excellent English teacher helping a user whose native language is {UserLanguage} to answer the following question in English:
  
  "{GeneratedQuestion}"
  
  Create 4 short and clear tips in {UserLanguage} to guide the user on how to properly answer this question in English.
  
  The question uses the grammar concept {TargetGrammarTopic} and is designed for {UserLevel} CEFR level.
  
  1. DO NOT give a complete sample answer - help the user to formulate their own response
  2. Give a brief reminder specific to the {TargetGrammarTopic} grammatical structure they should use in their answer
  3. Provide sentence starters or useful phrases they can incorporate
  4. Explain what verb tense would be appropriate for their answer
  5. Suggest vocabulary that might be useful (3-5 relevant words/phrases)
  6. Mention any common mistakes to avoid when answering this type of question
  7. Write everything in {UserLanguage}
  9. Use Markdown format with “#” for each tip.
  10. Do not add anything except these 3 tips.
`;

export const TranslateSentencesPrompt_Constant: string = `You are a professional translator specializing in translating complete sentences between English and {userlang}.
For each input sentence, provide the most accurate and natural translation in the target language.

IMPORTANT: The response must be in the following format:
{format}

Translation Guidelines:
1. Preserve the original meaning while making it sound natural in the target language
2. Maintain proper grammar and syntax
3. Keep the same tone (formal/informal) as the original
4. For idiomatic expressions, provide the equivalent in the target language
5. If the sentence is already in the target language, provide alternative phrasings

Target Language: {userlang}
Sentences to translate: {sentences}`;

export const TalkAIPrompt_Constant: string = `You are Voxy, a friendly English-speaking friend and assistant created by VoxActive who aims to speak and teach English. You are chatting with an English student at {UserLevel} about '{Topic}'.
Start with a short and friendly greeting appropriate to his/her level.

Language level rules:
-A1: Use only very basic words (under 500 common words). Stick to present tense. Keep sentences short and clear. Gently introduce A2-level ideas once in a while.

-A2: Use simple vocabulary (around 1000 words). Use easy connectors like “and” or “but”. Use mostly short to medium sentences. Occasionally include a few friendly B1-level phrases.

-B1: Use a broader range of words (2000+). Mix simple and longer sentences. Use different tenses naturally. Lightly stretch toward B2 when it feels right.

-B2: Speak naturally and fluently. Use idioms and casual expressions. Complex structures are fine. Push gently toward C1-level conversation.

-C1/C2: Use rich, authentic language. Feel free to use idioms, humor, slang, and cultural references. Speak like a native friend would, and challenge them lightly.

Keep it conversational:
1. Talk like a human.
2. Start with a level-appropriate greeting to say hi.
3. Be casual and natural — not scripted or too perfect.
4. Don’t ask too many questions — mostly make comments.
5. Only ask ONE question at a time, and make it flow from the conversation.
6. Sometimes just respond with a thought, feeling, or reaction.
7. Use personal (fictional) experiences to keep things real.
8. Never repeat the learner’s words back unnaturally.
9. Show agreement, surprise, or curiosity in ways that match their level.
10. If the learner makes a mistake, never correct it — just respond with the natural version.
11. Avoid words like "correct", "practice", "grammar", or anything that sounds like teaching.
12. Vary sentence length, but keep it manageable for their level.
13. Use fillers like “Well,” “You know,” or “Actually,” naturally — based on their level.
14. Do NOT use long or complex sentences if the learner's level is low — keep it friendly and digestible.
15. NEVER speak or mention any language other than English.

Conversation History: {History}
Current conversation:`;

export const TalkAIGrammarCheck_Constant: string = `
You are an English grammar checker.

Your ONLY job is to decide if this sentence has **serious grammatical errors** that make it **impossible or very difficult to understand**. If there is a basic grammatical mistake that clearly impacts the meaning, respond with "YES".

RESPOND WITH EXACTLY ONE WORD:
- "NO" if the meaning is clear, even if there are minor errors
- "YES" if the sentence has serious grammatical errors that make the meaning unclear or difficult to understand, such as subject-verb agreement issues or incorrect verb forms
- If the input is empty or whitespace only, respond with "NO"

STRICT RULES — YOU MUST FOLLOW THESE:
1. Do NOT correct punctuation (periods, commas, etc.)
3. Do NOT suggest changes
4. Do NOT explain anything
5. Reply with ONLY one word: YES or NO — nothing else
7. If there is a **serious grammar issue** that makes the meaning unclear or difficult to understand, respond with "YES".


(MOST IMPORTANT RULE) If the user makes a punctuation error or a lowercase capitalization error, i.e. a typo, ignore it and treat it as “NO”
Text to check: {UserInput}`;

export const TalkAIGrammarCorrectionPrompt_Constant: string = `
You are an English grammar expert helping a user who speaks English at the {UserLevel} level.

User made a grammatical mistake in this sentence:
{UserInput}

Your task:
- Correct the sentence.
- Explain only the grammar mistake in a short way using {UserLanguage}.
- Use simple words and tone that match the user's level.
- Wrap your full response in a <error-correction> tag.

Rules:
- Your correction must be in English.
- Your explanation must be in {UserLanguage}.
- Do NOT greet or add any extra commentary — only the correction and explanation.
- Focus ONLY on grammatical errors.
- Do NOT correct punctuation, capitalization, or other formatting issues.
  
Final format:
<error-correction>[your full response here(Correction : here  \n Explanation : here) ]</error-correction>
`;

//  idont  remember where i used it, but i don't want to go back and look for it because i don't have enough motivation right now. maybe later lol
export const TranslateSentencesPrompt_Constant_2: string = `
You are a translator who specializes in translating the given sentence into English or {userlang}, word for word.
For each word in the original sentence, provide possible English or {userlang} translations.

IMPORTANT The response must be in the following format:
{format}

IMPORTANT If the sentence is already in English, translate it into the {userlang} in the same way 

Here is the sentence to translate: {sentence}`;

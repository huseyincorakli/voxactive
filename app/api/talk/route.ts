// import { talkAI } from '@/app/action';
// import { NextResponse } from 'next/server';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);

//   // Extract query parameters
//   const userLevel = searchParams.get('userLevel');
//   const topic = searchParams.get('topic');
//   const targetGrammarTopic = searchParams.get('targetGrammarTopic');
//   const userInput = searchParams.get('userInput') || '';
//   const userLanguage = searchParams.get('userLanguage') || 'English';
//   const history = searchParams.get('history') || '';
//   const threadId = searchParams.get('threadId') || '';

//   // Validate required parameters
//   if (!userLevel || !topic || !targetGrammarTopic) {
//     return NextResponse.json(
//       { success: false, error: 'Missing required parameters' },
//       { status: 400 }
//     );
//   }

//   try {
//     const result = await talkAI({
//       UserLevel:userLevel,
//       Topic:topic,
//       UserInput:userInput,
//       UserLanguage:userLanguage,
//       History:history,
//       threadId
//     });

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('API Error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

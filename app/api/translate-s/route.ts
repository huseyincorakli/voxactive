import { translateSentences } from '@/lib/langchain/sentence_translator';
import { translateSentence } from '@/lib/langchain/translate_sentence';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { sentences,userlang } = await request.json() as { sentences: string[],userlang:string };
    

    const response = await translateSentences(sentences,userlang);

    return new NextResponse(JSON.stringify(response), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
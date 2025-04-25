import { translateSentence } from '@/lib/langchain/translate_sentence';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { word,userlang } = await request.json() as { word: string,userlang:string };
    const cleanedWord = word
    .replace(/[,''\.;:!?@#$%^&*()_+\-=\[\]{}|<>\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

    const response = await translateSentence(cleanedWord,userlang);

    return new NextResponse(JSON.stringify(response), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
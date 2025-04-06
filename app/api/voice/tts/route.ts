import { Models, TTS_DG } from '@/lib/deepgram/tts';
import { TTS } from '@/lib/elevenlabs/tts';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text, model } = await request.json() as { text: string; model?: Models };
        
        const { audioBuffer } = await TTS_DG(text,model);
        
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mp3'
            }
        });
    } catch (error:any) {
        
        return NextResponse.json(
            { error: 'Failed to generate speech' },
            { status: 500 }
        );
    }
}
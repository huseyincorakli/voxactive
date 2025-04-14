import { ElevenLabsClient } from 'elevenlabs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const elevenlabsApiKey = process.env.ELEVENLABS_KEY;
if (!elevenlabsApiKey) {
    console.error('Error: ELEVENLABS_KEY environment variable is not set');
    throw new Error('ELEVENLABS  API key is required. Please set the ELEVENLABS_KEY environment variable.');
}

const client = new ElevenLabsClient({
    apiKey: elevenlabsApiKey,
});

export const TTS = async (
    text :string) => {
    try {
        // Convert text to speech
        const audioStream = await client.textToSpeech.convert("FGY2WhTYpPnrIDTdsKH5", {
            output_format: "mp3_44100_128",
            text: text,
            model_id: "eleven_flash_v2_5"
        });

        // Ensure the directory exists
        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        const base64Audio = audioBuffer.toString('base64');
        const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

        return {
            audioBuffer,    // Raw buffer for server-side operations
            audioUrl        // Data URL for client-side usage
        }

    } catch (error) {
        console.error('Error generating or saving audio:', error);
        throw error;
    }
};
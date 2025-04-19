import { createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';

dotenv.config();

const deepgramApiKey = process.env.DEEPGRAM_KEY;

if (!deepgramApiKey) {
    console.error('Error: DEEPGRAM_KEY environment variable is not set');
    throw new Error('Deepgram API key is required. Please set the DEEPGRAM_KEY environment variable.');
}

export interface TTSResponse {
    audioBuffer: Buffer;
    audioUrl: string;
}

export enum Models{
    AMERICAN_FEMALE='aura-2-callista-en',
    BRITISH_FEMALE='aura-2-pandora-en',
    AMERICAN_MALE='aura-2-aries-en',
    BRITISH_MALE='aura-2-draco-en'
}

const deepgramClient = createClient(deepgramApiKey);


export const TTS_DG = async (
    text: string,
    model: Models = Models.AMERICAN_FEMALE
): Promise<TTSResponse> => {
    try {
        // Create the request according to Deepgram's API format
        const response = await deepgramClient.speak.request(
            // First parameter: text content (as an object with text property)
            { text },
            // Second parameter: options object with model
            { model }
        );
        
        // Get the stream
        const stream = await response.getStream();
        
        if (!stream) {
            throw new Error('Failed to get audio stream from Deepgram');
        }

        // Read the entire stream into memory
        return new Promise<TTSResponse>((resolve, reject) => {
            // Use a standard Web API approach for reading streams
            const reader = stream.getReader();
            const chunks: Uint8Array[] = [];

            // Read the stream chunk by chunk
            function readStream(): void {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        // When the stream is fully read, concatenate all chunks
                        const audioBuffer = Buffer.concat(chunks);
                        
                        // Convert to base64 for data URL
                        const base64Audio = audioBuffer.toString('base64');
                        const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
                        
                        resolve({
                            audioBuffer,
                            audioUrl
                        });
                        return;
                    }
                    
                    // Store each chunk and continue reading
                    chunks.push(value);
                    readStream();
                }).catch(error => {
                    reject(error);
                });
            }
            
            // Start reading the stream
            readStream();
        });
    } catch (error) {
        console.error('Error generating audio:', error);
        throw error;
    }
};
import { createClient } from '@deepgram/sdk';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const deepgramApiKey = process.env.DEEPGRAM_KEY;

if (!deepgramApiKey) {
  console.error('Error: DEEPGRAM_KEY environment variable is not set');
  throw new Error('Deepgram API key is required. Please set the DEEPGRAM_KEY environment variable.');
}

const deepgramClient = createClient(deepgramApiKey);

export const STT = async (file_path: string, model: string = "nova-2",language:string="en") => {
  try {
    const audio = fs.readFileSync(file_path);
    
    const { result, error } = await deepgramClient.listen.prerecorded.transcribeFile(
      audio,
      {
        model: model,
        language: language,
      },
    );

    if (error) {
      return {
        succeded:false,
        message:error.message
      };
    } else {
      return {
        succeded:true,
        transcript: result.results.channels[0].alternatives[0].transcript
      };
    }
  } catch (err:any) {
    return {
      error: `Error processing audio file: ${err.message}`
    };
  }
}
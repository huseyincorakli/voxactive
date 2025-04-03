import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { STT } from '@/lib/deepgram/stt';

export async function POST(req: NextRequest) {
    try {
      // FormData'dan ses blob'unu al
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File;
      const language = formData.get('language') as string || 'en';
      
      if (!audioFile) {
        return NextResponse.json(
          { error: 'Ses dosyası bulunamadı' },
          { status: 400 }
        );
      }
  
      // Geçici bir dosya yolu oluştur
      const tempDir = path.join(process.cwd(), 'temp');
      const fileName = `${uuidv4()}.wav`;
      const filePath = path.join(tempDir, fileName);
  
      // Klasör yoksa oluştur
      try {
        await writeFile(filePath, Buffer.from(await audioFile.arrayBuffer()));
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // temp klasörü yoksa, oluşturmayı dene
          const fs = require('fs');
          fs.mkdirSync(tempDir, { recursive: true });
          await writeFile(filePath, Buffer.from(await audioFile.arrayBuffer()));
        } else {
          throw error;
        }
      }
  
      // STT fonksiyonunu çağır
      const result = await STT(filePath, 'nova-2', language);
  
      // Geçici dosyayı temizle (opsiyonel)
      const fs = require('fs');
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Geçici dosya temizleme hatası:', err);
      }
  
      return NextResponse.json(result);
    } catch (error: any) {
      console.error('Transcription error:', error);
      return NextResponse.json(
        { error: `Transcription failed: ${error.message}` },
        { status: 500 }
      );
    }
  }
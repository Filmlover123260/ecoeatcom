import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.AI_STUDIO_API_KEY;

// 1x1 transparent png
const sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

async function testVision() {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  for (const model of models) {
    try {
      console.log(`Testing vision on ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: sampleBase64 } },
            { text: 'Is this an image? Reply in 3 words.' },
          ],
        },
      });
      console.log(`Vision success on ${model}:`, response.text);
      return;
    } catch (err: any) {
      console.log(`Vision error on ${model}:`, err?.status, err?.message?.slice(0, 150));
    }
  }
}

testVision();

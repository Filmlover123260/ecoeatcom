import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body || {};

  try {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.AI_STUDIO_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        text: 'EcoEat sustainable dining assistant: Remember to finish all items on your plate to minimize cafeteria waste!',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt || 'Provide a quick eco-friendly dining tip for campus students.',
      config: {
        systemInstruction: systemInstruction || undefined,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    res.status(200).json({ text: response.text });
  } catch (err: any) {
    res.status(200).json({
      text: 'EcoEat tip: Choosing plant-rich dishes can save over 0.5kg of CO2 per meal.',
    });
  }
}

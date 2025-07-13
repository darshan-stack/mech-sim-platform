// pages/api/ai-cad-generate.ts
import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { prompt } = req.body;

  // --- REAL AI INTEGRATION (OpenAI) ---
  try {
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert CAD assistant. Output only valid JSON with keys: entities, constraints, dimensions. Do not include any explanation or non-JSON text.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      });
    } catch (gpt4Err) {
      console.error('[OpenAI gpt-4 error]', gpt4Err);
      // Try gpt-3.5-turbo as a fallback
      try {
        completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert CAD assistant. Output only valid JSON with keys: entities, constraints, dimensions. Do not include any explanation or non-JSON text.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        });
      } catch (gpt35Err) {
        console.error('[OpenAI gpt-3.5-turbo error]', gpt35Err);
        res.status(500).json({ error: 'AI generation failed', details: (gpt4Err as Error).message, fallback: (gpt35Err as Error).message });
        return;
      }
    }
    const content = completion.choices[0]?.message?.content || '{}';
    let aiData;
    try {
      aiData = JSON.parse(content);
    } catch (err) {
      res.status(500).json({ error: 'Invalid JSON from AI', raw: content });
      return;
    }
    res.status(200).json(aiData);
    return;
  } catch (err) {
    console.error('[AI CAD API error]', err);
    res.status(500).json({ error: 'AI generation failed', details: (err as Error).message, stack: (err as Error).stack });
    return;
  }
}


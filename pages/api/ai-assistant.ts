import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * AI Assistant API Route (Gemini)
 * Supports: text, image, pdf, design/code, 3D notes generation
 * Uses Gemini API (Google AI). Requires GEMINI_API_KEY in .env.local
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: 'Gemini API key not set in environment' });
    return;
  }

  const { prompt, type } = req.body;
  if (!prompt || !type) {
    res.status(400).json({ error: 'Missing prompt or type' });
    return;
  }

  try {
    // Gemini API endpoint for text and image generation
    // Use 'v1' and 'gemini-pro' (or 'gemini-1.5-pro-latest' if you have access)
    let url = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY;
    // For Gemini 1.5 Pro (uncomment if you want to try):
    // let url = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-latest:generateContent?key=' + GEMINI_API_KEY;
    let requestBody: any = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    if (type === 'image') {
      url = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=' + GEMINI_API_KEY;
      // For image generation, you may need to adjust parts accordingly
    }
    // For PDF, design, 3D notes, we use text output and post-process on frontend
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('[Gemini API error]', { status: response.status, data });
      res.status(500).json({ error: 'Gemini API error', details: data, status: response.status });
      return;
    }
    res.status(200).json({ result: data });
  } catch (err: any) {
    console.error('[AI Assistant error]', err);
    res.status(500).json({ error: 'AI Assistant error', details: err.message, stack: err.stack });
  }
}

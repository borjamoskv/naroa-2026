
import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv'; 

// Load environment variables locally if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const config = {
  runtime: 'nodejs',
};

// Initialize Groq provider via OpenAI compatibility
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { messages } = await request.json();

    // 1. Load System Prompt (Alma)
    const almaPath = path.join(process.cwd(), 'data', 'alma.md');
    let systemPrompt = '';
    
    try {
      if (fs.existsSync(almaPath)) {
        systemPrompt = fs.readFileSync(almaPath, 'utf8');
      } else {
         // Fallback if path is wrong in Vercel
        systemPrompt = `Eres MICA, una IA sofisticada y artística. Tu misión es conectar a los visitantes con el universo de Naroa Gutiérrez Gil.`;
      }
    } catch (err) {
      console.error('Failed to load alma.md, using fallback', err);
      systemPrompt = `Eres MICA. Actúa con sofisticación y misterio.`;
    }

    // 2. Select Model based on available keys
    let model;
    let providerName;

    if (process.env.GROQ_API_KEY) {
      // Use Groq (Free Tier, Fast)
      model = groq('llama-3.3-70b-versatile'); // Or llama3-8b-8192
      providerName = 'Groq (Llama 3)';
    } else if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      // Fallback to Gemini
      model = google('gemini-1.5-flash');
      providerName = 'Google Gemini';
    } else {
      throw new Error('No valid API Key found (GROQ_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY)');
    }

    console.log(`[MICA Brain] Using Provider: ${providerName}`);

    // 3. Generate Response
    const response = await generateText({
      model: model,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      maxTokens: 500,
    });

    return new Response(JSON.stringify({ 
      content: response.text,
      role: 'assistant',
      provider: providerName // Send back for debug info
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      hint: "Check server logs for details." 
    }), { status: 500 });
  }
}

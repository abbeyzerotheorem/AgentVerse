import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '../../../ai/dev';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const prompt = `You are AgentVerse, a helpful AI assistant. Answer the user's question clearly and concisely. User: ${message}`;

    const text = await generateContent(prompt);

    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process chat message';
    console.error('Error in chat route:', message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

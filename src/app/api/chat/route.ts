import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '../../../ai/dev';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const message = formData.get('message') as string;
    const fileCount = parseInt(formData.get('fileCount') as string) || 0;

    if (!message && fileCount === 0) {
      return NextResponse.json({ error: 'Message or files are required' }, { status: 400 });
    }

    // Process images if any
    let imageParts = [];
    if (fileCount > 0) {
      for (let i = 0; i < fileCount; i++) {
        const file = formData.get(`file_${i}`) as File;
        if (file) {
          // Convert file to base64 for Gemini API
          const bytes = await file.arrayBuffer();
          const base64 = Buffer.from(bytes).toString('base64');
          imageParts.push({
            inlineData: {
              mimeType: file.type,
              data: base64
            }
          });
        }
      }
    }

    // Create prompt with images if present
    let prompt = `You are AgentVerse, a helpful AI assistant.`;
    if (imageParts.length > 0) {
      prompt += ` The user has uploaded ${imageParts.length} image(s). Analyze the image(s) and provide a helpful response.`;
    }
    if (message) {
      prompt += ` User: ${message}`;
    }

    const text = await generateContent(prompt, imageParts);

    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process chat message';
    console.error('Error in chat route:', message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

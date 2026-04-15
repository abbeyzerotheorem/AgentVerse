'use server';
/**
 * @fileOverview A chat flow that uses Genkit to generate responses.
 * It can act as a router to decide whether to generate code or a text response.
 *
 * - chat - A function that takes a message history and returns a response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {generateCode} from './generate-code';
import {z} from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const SettingsSchema = z.object({
  agentName: z.string(),
  agentRole: z.string(),
  agentInstructions: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string(),
  settings: SettingsSchema.optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

function detectCodeRequest(prompt: string) {
  const codeKeywords = [
    'code',
    'component',
    'function',
    'react',
    'typescript',
    'javascript',
    'html',
    'css',
    'script',
    'api',
    'backend',
    'frontend',
    'snippet',
    'module',
  ];
  const normalized = prompt.toLowerCase();
  return codeKeywords.some((keyword) => normalized.includes(keyword));
}

async function generateTextViaGoogle(input: ChatInput): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_API_KEY in environment variables. Add it to your .env file.');
  }

  const systemText = input.settings
    ? `You are an AI assistant named ${input.settings.agentName}. Your role is: ${input.settings.agentRole}. Follow these instructions for every response: ${input.settings.agentInstructions}`
    : `You are a helpful AI assistant named AgentVerse.`;

  const conversation = [
    `System: ${systemText}`,
    ...input.history.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`),
    `User: ${input.message}`,
  ].join('\n\n');

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: conversation,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Generative API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();

  const candidates = data?.candidates;
  let text: string | undefined;

  if (Array.isArray(candidates) && candidates.length > 0) {
    const candidate = candidates[0];
    if (typeof candidate?.content?.text === 'string') {
      text = candidate.content.text;
    } else if (Array.isArray(candidate?.content?.parts)) {
      text = candidate.content.parts.map((part: any) => part?.text).filter(Boolean).join(' ');
    } else if (typeof candidate?.content === 'string') {
      text = candidate.content;
    }
  }

  if (!text && Array.isArray(data?.output) && data.output.length > 0) {
    const output = data.output[0];
    if (Array.isArray(output?.content)) {
      text = output.content
        .map((item: any) => item?.text || (Array.isArray(item?.parts) ? item.parts.map((part: any) => part?.text).filter(Boolean).join(' ') : undefined))
        .filter(Boolean)
        .join(' ');
    }
  }

  if (!text) {
    throw new Error(`Unexpected response from Google Generative API: ${JSON.stringify(data)}`);
  }

  return text;
}

const chatFlow = async (input: ChatInput): Promise<ChatOutput> => {
  if (detectCodeRequest(input.message)) {
    const codeResult = await generateCode({prompt: input.message});
    return {
      message: "I've generated the code you requested. You can open it in the sandbox to see a preview.",
      code: codeResult.code,
    };
  }

  const message = await generateTextViaGoogle(input);
  return {message};
};

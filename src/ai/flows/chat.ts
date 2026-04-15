'use server';
/**
 * @fileOverview A chat flow that uses Genkit to generate responses.
 * It can act as a router to decide whether to generate code or a text response.
 *
 * - chat - A function that takes a message history and returns a response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateCode} from './generate-code';

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

const decisionPrompt = ai.definePrompt({
  name: 'decideChatOrCodePrompt',
  input: {schema: z.object({prompt: z.string()})},
  prompt: `You are a decision-making model. Your task is to determine if the user's request is for generating code or for a general chat conversation.
        
Respond with only the string "CODE" if the user wants to generate, write, build, or create a code snippet, function, component, etc.
        
Respond with only the string "CHAT" for anything else, including questions about code.
        
User Request: {{{prompt}}}`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const decisionResponse = await decisionPrompt({prompt: input.message});
    const decision = decisionResponse.text.trim().toUpperCase();

    if (decision === 'CODE') {
      const codeResult = await generateCode({prompt: input.message});
      return {
        message:
          "I've generated the code you requested. You can open it in the sandbox to see a preview.",
        code: codeResult.code,
      };
    } else {
      const history = input.history.map(msg => ({
        role: msg.role,
        content: [{text: msg.content}],
      }));

      let systemPrompt = `You are a helpful AI assistant named AgentVerse.`;
      if (input.settings) {
        systemPrompt = `You are an AI assistant named ${input.settings.agentName}. 
Your role is: ${input.settings.agentRole}.
Follow these instructions for every response: ${input.settings.agentInstructions}`;
      }
      
      const response = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        messages: history,
        prompt: input.message,
        system: systemPrompt,
      });

      return {
        message: response.text,
      };
    }
  }
);

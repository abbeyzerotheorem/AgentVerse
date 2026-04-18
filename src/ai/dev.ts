import { config } from 'dotenv';
config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function generateContent(prompt: string, imageParts: any[] = []): Promise<string> {
  const model = ai.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  if (imageParts.length > 0) {
    // For multimodal input, combine text and images
    const parts = [prompt, ...imageParts];
    const result = await model.generateContent(parts);
    return result.response.text();
  } else {
    // Text-only input
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

export async function planAndExecute(goal: string): Promise<{ plan: string; steps: string[]; results: string[] }> {
  const planPrompt = `Create a detailed plan to accomplish this goal: ${goal}. Break it down into actionable steps. Return the plan as the first line, then each step on a new line.`;

  const planText = await generateContent(planPrompt);

  const lines = planText.split('\n');
  const plan = lines[0];
  const steps = lines.slice(1).filter(line => line.trim());

  const results = steps.map((step: string, index: number) => `Executed step ${index + 1}: ${step}`);

  return {
    plan,
    steps,
    results,
  };
}

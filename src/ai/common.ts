import 'dotenv/config';
import OpenAI from "openai";

export const openai = new OpenAI();

export async function prompt(systemPrompt: string, prompt: string, signal: AbortSignal): Promise<string| null> {
  const result = await openai.chat.completions.create(
    {
      messages: [
        { role: "developer", content: systemPrompt},
        { role: "user", content: prompt}
      ],
      model: "gpt-4",
      temperature: 0,
    },
    { signal: signal }
  )
  return result.choices[0].message?.content;
} 

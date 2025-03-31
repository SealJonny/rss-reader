import { AiRequestError } from "../errors/ai";
import { openai } from "./common";

/**
 * Summarizes a given text using OpenAI's GPT model
 *
 * @param text The text to be summarized
 * @param signal AbortSignal to cancel the request
 * @returns A summarized version of the input text
 * @throws {AiRequestError} If no response is received from GPT
 */
export async function summarizeText(text: string, signal: AbortSignal): Promise<string> {
  const systemPrompt = `
    Du bist ein hochpräziser Textzusammenfasser. Deine Aufgabe ist es, lange Artikel in genau 100 Wörtern zusammenzufassen. Dabei musst du sicherstellen, dass der Text immer in ganzen, gut verständlichen Sätzen formuliert ist.
    Erhalte alle wesentlichen Informationen, Namen, Ereignisse und Ergebnisse bei, aber eliminiere irrelevante Details, Wiederholungen und Nebensächlichkeiten. Falls der Originaltext stichpunktartig ist, forme daraus zusammenhängende Sätze.
    Achte auf eine klare, sachliche und informative Sprache. Die Zusammenfassung soll flüssig lesbar sein und den Kern der Nachricht präzise wiedergeben. Schreibe keinen Kommentar oder zusätzliche Erklärungen – nur die Zusammenfassung.
  `;

  const completion = await openai.chat.completions.create(
    {
      messages: [
        { role: "system", content: systemPrompt},
        { role: "user", content: text.slice(0, 5000)}
      ],
      model: "gpt-4o",
      max_completion_tokens: 300,
      temperature: 0
    },
    { signal: signal }
  );

  const result = completion.choices[0].message.content;
  if (!result) {
    throw new AiRequestError("No answer from GPT");
  }
  return result;
}
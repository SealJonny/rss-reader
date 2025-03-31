import { AiRequestError } from "../errors/ai";
import { openai } from "./common";

export async function summarizeText(text: string, signal: AbortSignal): Promise<string> {
  const systemPrompt = `
    Du bist ein hochpräziser Textzusammenfasser. Deine Aufgabe ist es, lange Artikel in genau 200 Wörtern zusammenzufassen. Dabei musst du sicherstellen, dass der Text immer in ganzen, gut verständlichen Sätzen formuliert ist.
    Erhalte alle wesentlichen Informationen, Namen, Ereignisse und Ergebnisse bei, aber eliminiere irrelevante Details, Wiederholungen und Nebensächlichkeiten. Falls der Originaltext stichpunktartig ist, forme daraus zusammenhängende Sätze.
    Achte auf eine klare, sachliche und informative Sprache. Die Zusammenfassung soll flüssig lesbar sein und den Kern der Nachricht präzise wiedergeben. Schreibe keinen Kommentar oder zusätzliche Erklärungen – nur die Zusammenfassung.
    Formatiere die Antwort in semantisch zusammenhängende Abschnitte und trenne sie mit einem '\n' oder '\n\n'.
  `;

  const completion = await openai.chat.completions.create(
    {
      messages: [
        { role: "developer", content: systemPrompt},
        { role: "user", content: text.slice(0, 5000)}
      ],
      model: "gpt-4o",
      max_completion_tokens: 400,
      temperature: 0
    },
    { signal: signal }
  );

  const result =  completion.choices[0].message.content;
  if (!result) {
    throw new AiRequestError("No answer from gpt");
  }
  return result;
}
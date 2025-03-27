import { NewsItem } from '../interfaces/news-item';
import { prompt } from './common';

/**
 * Categorizes a list of news items using OpenAI's GPT model.
 *
 * @param newsItems - Array of news items to be categorized.
 * @param categories - Array of category names to assign to news items. Can be empty.
 * @param numItems - Maximum number of news items to process. Defaults to 10.
 * @returns A Promise that resolves to a JSON string containing the assigned categories for each news item.
 *          The JSON format has keys from "1" to "numItems" and values are arrays of assigned categories.
 *          Example: { "1": ["Politics", "Economy"], "2": [], "3": ["Sports"] }
 *
 * @description
 * This function uses OpenAI's API to analyze news items and assign appropriate categories.
 * Each news item can be assigned multiple categories, a single category, or no category
 * depending on its content. The categorization is context-based, not just keyword-based.
 */
export async function categoriseNewsItems(newsItems: NewsItem[], categories: string[], numItems: number = 10, signal: AbortSignal): Promise<Record<number, string[]>> {
  const systemPrompt = `Du erhältst ${numItems} RSS-Feed-News-Items. Jedes News-Item enthält einen Titel und eine Beschreibung. Deine Aufgabe ist es, jedem News-Item passende Kategorie(n) aus der folgenden Liste zuzuweisen. Falls der Inhalt eines News-Items nicht eindeutig einer oder mehreren der angegebenen Kategorien zugeordnet werden kann, gib für dieses Item ein leeres Array [] zurück.

Die Kategorien lauten: ${categories.join(", ")}.

Hinweis: Die zugewiesenen Kategorien werden später verwendet, um die News-Items in thematisch sortierte RSS-Feeds einzuteilen. Daher ist es wichtig, dass die Kategorisierung präzise und kontextbezogen erfolgt.

Regeln:
1. Weise jedem News-Item entweder mehrere, genau eine oder gar keine Kategorie(n) zu.
2. Ordne die Kategorien basierend auf dem inhaltlichen Kontext des News-Items zu – die Entscheidung soll auf einer fundierten Analyse des Inhalts beruhen und nicht nur auf der reinen Anwesenheit einzelner Schlüsselwörter.
3. Ein News-Item kann mehrere Kategorien erhalten, wenn es inhaltlich zu mehreren der angegebenen Kategorien passt. Achte jedoch darauf, dass die zugewiesenen Kategorien inhaltlich sinnvoll und nicht zu weit hergeholt sind.
4. Sollte der Inhalt eines News-Items keiner der angegebenen Kategorien zugeordnet werden können, so gib ein leeres Array zurück.
5. Die finale Ausgabe muss ausschließlich ein JSON-Objekt sein, bei dem die Schlüssel "1" bis "${numItems}" den jeweiligen News-Items entsprechen und deren Werte Arrays mit den zugewiesenen Kategorien sind.

Beispieloutput:
{
  "1": ["Politik", "Wirtschaft"],
  "2": [],
  "3": ["Sport"]
}
`;

  const newsItemsContent = newsItems.map((item, index) =>
    `News-Item ${index + 1}: Titel: ${item.title}, Beschreibung: ${item.description}`
  ).join('\n\n');

  const output = await prompt(systemPrompt, newsItemsContent, signal);

  // Antwort auslesen und parsen
  if (!output) {
    throw new Error("Could not categorise the NewsItems!");
  }

  // ToDo: Error Handling
  let json = JSON.parse(output);
  const result: Record<number, string[]> = Object.fromEntries(
    Object.entries(json).map(([key, value]) => [Number(key), value as string[]])
  );
  return result;
}

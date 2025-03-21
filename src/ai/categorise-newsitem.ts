import 'dotenv/config';
import OpenAI from "openai";
import { fetchRss } from "../xml/rss";
import { NewsItem } from '../interfaces/news-item';
import { RssFeed } from '../interfaces/rss-feed';

const openai = new OpenAI();

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
export async function categoriseNewsItems(newsItems: NewsItem[], categories: string[], numItems: number = 10): Promise<string> {
  const prompt = `Du erhältst ${numItems} RSS-Feed-News-Items. Jedes News-Item enthält einen Titel und eine Beschreibung. Deine Aufgabe ist es, jedem News-Item passende Kategorie(n) aus der folgenden Liste zuzuweisen. Falls der Inhalt eines News-Items nicht eindeutig einer oder mehreren der angegebenen Kategorien zugeordnet werden kann, gib für dieses Item ein leeres Array [] zurück.

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

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "developer", content: prompt },
      { role: "user", content: newsItemsContent }
    ],
    model: "gpt-4",
    temperature: 0,
  });

  // Antwort auslesen und parsen
  const output = completion.choices[0].message?.content || "Something went wrong";

  return output;
}

// Beispielhafte Verwendung:
async function exampleUsage() {
  let newsItems: NewsItem[] = [];
  const rssFeed: RssFeed ={
    id: 1,
    title: "test",
    link: "https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de",
    description: "antesten",
    language: null,
    lastBuildDate: null
  }
  try {
    newsItems = await fetchRss(rssFeed) ?? [];
    console.log(`${newsItems.length} News-Items abgerufen.`);
  } catch (error) {
    console.error("Fehler beim Abrufen des RSS-Feeds:", error);
  }

  // Nimm die ersten 10 News-Items oder alle, wenn weniger als 10 vorhanden sind
  const numItems = 10;
  const firstTenNewsItems = newsItems.slice(0, numItems);
  const kategorien: string[]= ["Wissenschaft",  "Technologie", "Wirtschaft", "Politik", "Sport", "Kultur", "Gesundheit", "Umwelt"];

  try {
    const zugewieseneKategorien = await categoriseNewsItems(firstTenNewsItems, kategorien, numItems);
    console.log("Zugewiesene Kategorien:", zugewieseneKategorien);
  } catch (error) {
    console.error("Fehler beim Kategorisieren der News-Items:", error);
  }
}
// exampleUsage();

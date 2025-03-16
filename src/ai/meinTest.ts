import 'dotenv/config';
import OpenAI from "openai";
import { fetchRss } from "../xml/rss";
import { NewsItem } from '../interfaces/news-item';

const openai = new OpenAI();

interface FeedItem {
  title: string;
  description: string;
}

async function kategorisiereNewsItems(newsItems: NewsItem[], kategorien: string[]): Promise<string> {
  // Erstellen des Prompts mit Feed-Item-Daten und den möglichen Kategorien
  const prompt = `Du erhältst 10 RSS-Feed-News-Items. Jedes Item enthält einen Titel und eine Beschreibung.
                  Deine Aufgabe ist es, jedem News-Item passende Kategorie(n) aus der folgenden Liste zuzuweisen:
                  ${kategorien.join(", ")}

                  Regeln:
                  - Du kannst einem News-Item mehrere, genau eine oder gar keine Kategorie zuweisen.
                  - Falls ein News-Item keinem der genannten Themen entspricht, weise ihm keine Kategorie zu.
                  - Beispiel: - Ein Artikel über ein neues Smartphone könnte die Kategorien "Technologie" und "Wirtschaft" erhalten.
                              - Ein Artikel über ein Fußballspiel könnte die Kategorie "Sport" erhalten.
                              - Ein Artikel den du nicht eindeutig einer Kategorie zuordnen kannst, erhält keine Kategorie.

                  Ausgabeformat:
                  Gib die Antwort als JSON-Objekt zurück, in dem die Schlüssel "1" bis "10" den jeweiligen News-Items entsprechen. Der Wert zu jedem Schlüssel soll ein Array mit den zugewiesenen Kategorien sein.

                  Beispielstruktur:
                  {
                    "1": ["Kategorie1", "Kategorie2"],
                    "2": ["Kategorie3"],
                    "3": [],
                    "...": "..."
                  }
                  `;

  // Bereite die News-Items für die API vor
  const newsItemsContent = newsItems.map((item, index) =>
    `News-Item ${index + 1}: Titel: ${item.title}, Beschreibung: ${item.description}`
  ).join('\n\n');

  // Anfrage an die OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: newsItemsContent }
    ],
    model: "gpt-4o-mini",
  });

  // Antwort auslesen und parsen
  const antwortText = completion.choices[0].message?.content || "Something went wrong";

  return antwortText;
}

// Beispielhafte Verwendung:
(async () => {
  let newsItems: NewsItem[] = [];
  try {
    newsItems = await fetchRss("https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de");
    console.log(`${newsItems.length} News-Items abgerufen.`);
  } catch (error) {
    console.error("Fehler beim Abrufen des RSS-Feeds:", error);
  }

  // Nimm die ersten 10 News-Items oder alle, wenn weniger als 10 vorhanden sind
  const firstTenNewsItems = newsItems.slice(0, 10);
  const kategorien = ["Wissenschaft",  "Technologie", "Wirtschaft", "Politik", "Sport", "Kultur", "Gesundheit"];

  try {
    const zugewieseneKategorien = await kategorisiereNewsItems(firstTenNewsItems, kategorien);
    console.log("Zugewiesene Kategorien:", zugewieseneKategorien);
  } catch (error) {
    console.error("Fehler beim Kategorisieren der News-Items:", error);
  }
})();

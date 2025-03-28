import 'dotenv/config';
import OpenAI from "openai";
import { NewsItem } from '../interfaces/news-item';

const openai = new OpenAI();

interface FeedItem {
  title: string;
  description: string;
}

async function kategorisiereNewsItems(newsItems: NewsItem[], kategorien: string[], numItems: number = 10): Promise<string> {
  const prompt = `Du erhältst ${numItems} RSS-Feed-News-Items, jedes bestehend aus einem Titel und einer Beschreibung.
Deine Aufgabe ist es, jedem Item passende Kategorie(n) aus dieser Liste zuzuweisen: ${kategorien.join(", ")}.
Analysiere den Inhalt genau und weise Kategorien basierend auf dem Thema zu, nicht nur auf Schlüsselwörtern.

**Regeln**:
- Weise einem Item mehrere, eine oder gar keine Kategorie zu.
- Wenn der Inhalt nicht klar einer Kategorie entspricht, bleibt das Array leer.
- Beispiele:
  - "Neues iPhone vorgestellt" → ["Technologie", "Wirtschaft"]
  - "Fußball-WM: Deutschland siegt" → ["Sport"]
  - "Wetterbericht für morgen" → []

**Ausgabeformat**:
JSON-Objekt mit Schlüsseln "1" bis "${numItems}" und Arrays der zugewiesenen Kategorien:
{
  "1": ["Kategorie1", "Kategorie2"],
  "2": ["Kategorie3"],
  "3": [],
  ...
}`;

  const newsItemsContent = newsItems.slice(0, numItems).map((item, index) =>
    `News-Item ${index + 1}: Titel: ${item.title}, Beschreibung: ${item.description}`
  ).join('\n\n');

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: newsItemsContent }
      ],
      model: "gpt-4o-mini",
    });
    const antwortText = completion.choices[0].message?.content || "{}";
    return antwortText;
  } catch (error) {
    console.error("Fehler bei der OpenAI-API-Anfrage:", error);
    throw error;
  }
}

(async () => {
  let newsItems: NewsItem[] = [];
  try {
    //newsItems = await fetchRss("https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de");
    console.log(`${newsItems.length} News-Items abgerufen.`);
  } catch (error) {
    console.error("Fehler beim Abrufen des RSS-Feeds:", error);
    return;
  }

  const numItems = 10;
  const firstTenNewsItems = newsItems.slice(0, numItems);
  const kategorien = ["Wissenschaft", "Technologie", "Wirtschaft", "Politik", "Sport", "Kultur", "Gesundheit"];

  try {
    const zugewieseneKategorien = await kategorisiereNewsItems(firstTenNewsItems, kategorien, numItems);
    console.log("Zugewiesene Kategorien:", console.log("Zugewiesene Kategorien:", zugewieseneKategorien));
  } catch (error) {
    console.error("Fehler beim Kategorisieren der News-Items:", error);
  }
})();

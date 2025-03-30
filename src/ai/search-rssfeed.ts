import { AiInvalidResponseError, AiRequestError } from "../errors/ai";
import { RssFeed } from "../interfaces/rss-feed";
import { openai } from "./common";

/**
 * Searches the web via gpt for a rss feed which matches the users request
 *
 * @param userInput Users prompt to gpt
 * @param signal Abortsignal which terminates the request immediately
 * @returns Link to the rss feed
 *
 */
export async function searchRssFeed(userInput: string, feeds: RssFeed[], invalidLinks: string[], signal: AbortSignal): Promise<string> {
  const systemPrompt = `
    Du bist ein intelligenter Assistent, der gezielt nach RSS-Feeds sucht. Der Nutzer gibt eine Beschreibung dessen ein, wonach er sucht – entweder einen spezifischen RSS-Feed oder einen thematischen Wunsch.
    Zudem gibt der Nutzer die Links an die er schon verwendet, das heißt diese Links will der Nutzer nicht noch einmal bekommen und du musst darauf achten das du ihm kein Link aus dieser List zurückgibst.
    Die AlreadyExists-Liste wird in diesem Format kommen:
    ["https://example.com/rss", "https://two.example.com/rss/culture", ...]

    Außerdem bekommst du noch eine zweite Liste von dem User, mit den Links die du ihm geben hast, die allerdings nicht funktionieren. Diese Links darfst du dem User unter keine Umständen wieder geben. Überprüfe
    also jeden Link ob er Teil dieser Invalid-Liste ist.
    Die Invalid-Liste kommt in diesem Format:
    ["https://not-valid.example.com/rss", "https://not-valid.two.example.com/rss/culture", ...]

    Deine Aufgaben:
    1. Analysiere die Anfrage: Erkenne, ob der Nutzer einen bestimmten RSS-Feed oder ein thematisches Angebot sucht.
    2. Suche im Internet nach passenden RSS-Feeds, die exakt zur Anfrage passen.
    3. Überprüfe, ob der Link in der AlreadyExists-Liste oder in der Invalid-Liste des Users enthalten ist
      - Falls ja, suche nach einem anderen Link
      - Falls nein, fahre fort mit Schritt 4.
    4. Liefere die Antwort ausschließlich als JSON-Objekt im folgenden Format:
       - Wenn ein RSS-Feed gefunden wird:
         {"link": "https://example.com/rss"}
       - Falls kein passender RSS-Feed gefunden wird:
         {"link": ""}

    Wichtige Regeln:
    - Der Link den du zurück gibst muss direkt zu einer Rss-Feed XML-Datei führen!
    - Antworten dürfen nur JSON enthalten, ohne zusätzlichen Text, ohne Markdown Syntax oder ohne Erklärungen.
    - Falls mehrere passende Feeds existieren, wähle den relevantesten.
    - Falls ein RSS-Feed in der Liste des Users ist, suche nach einem anderen Link
    - Falls kein RSS-Feed existiert, gib "link": "" zurück.
    - Keine Formatabweichungen – immer JSON verwenden.

    Beispielanfragen und gewünschte Antworten:

    Nutzer: Ich möchte den RSS-Feed der Tagesschau, AlreadyExists-Liste: [], Invalid-Liste: []
    Antwort: {"link": "https://www.tagesschau.de/xml/rss2"}

    Nutzer: RSS-Feed für Tech-News gesucht, AlreadyExists-Liste: ["https://www.tagesschau.de/xml/rss2"], Invalid-Liste: []
    Antwort:
    {"link": "https://www.heise.de/rss/heise.rdf"}


    Nutzer: RSS-Feed für ein sehr nischiges Thema, AlreadyExists-Liste: ["https://www.tagesschau.de/xml/rss2",  "https://www.heise.de/rss/heise.rdf"], Invalid-Liste: [] (kein Feed gefunden)
    Antwort: {"link": ""}

    Nutzer: Ich suche nach einem RSS-Feed der über Technologie handelt, AlreadyExists-Liste: ["https://www.tagesschau.de/xml/rss2",  "https://www.heise.de/rss/heise.rdf"]
    Suche:
      - Du findest "https://www.heise.de/rss/heise.rdf", dieser ist allerdings in der AlreadyExists-Liste!
      - Du suchst weiter und findest "https://news.google.com/rss/search?q=Technology&hl=de&gl=DE&ceid=DE:de", dieser ist in keiner der beiden Listen
    Antwort: {"link": "https://news.google.com/rss/search?q=Technology&hl=de&gl=DE&ceid=DE:de"}

    Nutzer: RSS-Feed für Wissenschaft, AlreadyExists-Liste: ["https://www.tagesschau.de/xml/rss2"], Invalid-Liste: ["https://domain.invalid.com/rss"]
    Suche:
      - Du findest "https://domain.invalid.com/rss", dieser ist allerdings in der Invalid-Liste!
      - Du suchst weiter und findest "https://domain.valid.com/science/rss", dieser ist in keiner der beider Listen
    Antwort: {"link":  "https://domain.valid.com/science/rss"}

    Folge diesen Anweisungen exakt.
  `;

  const userPrompt = `${userInput}, AlreadyExists-Liste: [${feeds.map(f => f.link).join(", ")}], Invalid-Liste: [${invalidLinks.join(", ")}]`;

  const completion = await openai.chat.completions.create(
    {
      model: "gpt-4o-search-preview",
      web_search_options: {},
      messages: [
        { role: "developer", content: systemPrompt},
        { role: "user", content: userPrompt}
      ],
    },
    { signal: signal}
  );

  const result =  completion.choices[0].message.content;

  if (!result) {
    throw new AiRequestError("No answer from gpt");
  }

  const json = JSON.parse(result);
  if (json?.link === null) {
    throw new AiInvalidResponseError(`Answer from gpt could not be parsed: ${result}`);
  }
  return json.link as string;
}

// async function main() {
//   let abort = new AbortController();
//
//   // Beim ersten versuche sind 13/25 fehlgeschlagen
//   // 1. Anfrage: Technologie
//   await searchRssFeed("Ich möchte ein rss feed über technologie haben.", abort.signal);
//
//   // 2. Anfrage: Nachrichten
//   await searchRssFeed("RSS Feed für aktuelle Nachrichten", abort.signal);
//
//   // 3. Anfrage: Sport
//   await searchRssFeed("RSS Feed für Sportnachrichten", abort.signal);
//
//   // 4. Anfrage: Wissenschaft
//   await searchRssFeed("Ich suche einen RSS Feed über Wissenschaft", abort.signal);
//
//   // 5. Anfrage: Kunst und Kultur
//   await searchRssFeed("RSS Feed zu Kunst und Kultur", abort.signal);
//
//   // 6. Anfrage: Wirtschaft
//   await searchRssFeed("RSS Feed über Wirtschaft und Finanzen", abort.signal);
//
//   // 7. Anfrage: Reisen
//   await searchRssFeed("RSS Feed über Reiseziele und Tipps", abort.signal);
//
//   // 8. Anfrage: Gesundheit
//   await searchRssFeed("RSS Feed zu Gesundheit und Medizin", abort.signal);
//
//   // 9. Anfrage: Umwelt
//   await searchRssFeed("RSS Feed über Umweltschutz und Nachhaltigkeit", abort.signal);
//
//   // 10. Anfrage: Politik
//   await searchRssFeed("RSS Feed über politische Ereignisse und Nachrichten", abort.signal);
//
//   // 11. Anfrage: Bildung
//   await searchRssFeed("RSS Feed für Bildung und Weiterbildung", abort.signal);
//
//   // 12. Anfrage: Musik
//   await searchRssFeed("RSS Feed über Musik und neue Alben", abort.signal);
//
//   // 13. Anfrage: Filme und Serien
//   await searchRssFeed("RSS Feed zu neuen Filmen und Serien", abort.signal);
//
//   // 14. Anfrage: Mode
//   await searchRssFeed("RSS Feed zu Mode und Trends", abort.signal);
//
//   // 15. Anfrage: Gaming
//   await searchRssFeed("RSS Feed über Gaming und Videospiele", abort.signal);
//
//   // 16. Explizite Anfrage: Tagesschau RSS Feed
//   await searchRssFeed("Ich suche nach dem RSS Feed der Tagesschau", abort.signal);
//
//   // 17. Explizite Anfrage: Spiegel RSS Feed
//   await searchRssFeed("Ich suche nach dem RSS Feed vom Spiegel", abort.signal);
//
//   // 18. Explizite Anfrage: Heise News RSS Feed
//   await searchRssFeed("Ich möchte den RSS Feed von Heise News finden", abort.signal);
//
//   // 19. Explizite Anfrage: BBC News RSS Feed
//   await searchRssFeed("Ich möchte den RSS Feed der BBC News finden", abort.signal);
//
//   // 20. Explizite Anfrage: ARD Mediathek RSS Feed
//   await searchRssFeed("Ich suche nach dem RSS Feed der ARD Mediathek", abort.signal);
//
//   // 21. Explizite Anfrage: FAZ RSS Feed
//   await searchRssFeed("Ich möchte den RSS Feed der Frankfurter Allgemeinen Zeitung (FAZ)", abort.signal);
//
//   // 22. Explizite Anfrage: Zeit Online RSS Feed
//   await searchRssFeed("Ich suche nach dem RSS Feed von Zeit Online", abort.signal);
//
//   // 23. Explizite Anfrage: Reddit RSS Feed
//   await searchRssFeed("Ich möchte den RSS Feed von Reddit finden", abort.signal);
//
//   // 24. Explizite Anfrage: Google News RSS Feed
//   await searchRssFeed("Ich möchte den RSS Feed von Google News finden", abort.signal);
//
//   // 25. Explizite Anfrage: Wikipedia RSS Feed
//   await searchRssFeed("Ich möchte den RSS Feed von Wikipedia", abort.signal);
// }
//
// main().catch();

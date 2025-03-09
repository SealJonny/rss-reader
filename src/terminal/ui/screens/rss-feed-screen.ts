import blessed from 'blessed';
import { NewsItem } from "../../../interfaces/news-item";
import { fetchRss } from "../../../xml/rss";
import { createErrorBox } from "../utils/ui-utils";
import { colors } from '../themes/default-theme';

export type FeedType = "general-feed" | "favorites-feed" | "technical-feed" | "economical-feed" | "political-feed" | "other-feeds";

/**
 * Interface für Feed-Konfiguration
 */
interface FeedConfig {
  url: string;
  title: string;
}

// Feed-Konfigurationen
const feedConfigs: Record<FeedType, FeedConfig> = {
  "general-feed": {
    url: "https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de",
    title: "Allgemeine Nachrichten"
  },
  "favorites-feed": {
    url: "",
    title: "Favoriten"
  },
  "technical-feed": {
    url: "https://news.google.com/rss/search?q=Technology&hl=de&gl=DE&ceid=DE:de",
    title: "Technologie-Nachrichten"
  },
  "economical-feed": {
    url: "https://news.google.com/rss/search?q=Wirtschaft&hl=de&gl=DE&ceid=DE:de",
    title: "Wirtschaftsnachrichten"
  },
  "political-feed": {
    url: "https://news.google.com/rss/search?q=Politik&hl=de&gl=DE&ceid=DE:de",
    title: "Politische Nachrichten"
  },
  "other-feeds": {
    url: "",
    title: "Andere Feeds"
  }
};

/**
 * Zeigt die Details eines Nachrichtenelements an
 */
function showNewsItem(
  item: NewsItem,
  index: number,
  total: number,
  feedBox: blessed.Widgets.BoxElement,
  screen: blessed.Widgets.Screen
): void {
  // KORRIGIERT: Erst Inhalt leeren und dann rendern
  feedBox.setContent('');
  screen.render();
  
  // Neuen Inhalt erstellen und setzen
  let content = '';
  content += `${index + 1}/${total} - ${feedBox.options._feedTitle || ''}\n\n`;
  content += `📰 ${item.title}\n`;
  content += `📅 ${item.pubDate}\n\n`;
  content += `📖 ${item.description}\n\n`;
  content += `🔗 ${item.link}\n`;
  
  feedBox.setContent(content);
  screen.render();
}

/**
 * Zeigt den RSS-Feed-Screen an und gibt die Feed-Box zurück
 * @param screen Der Blessed-Screen
 * @param feedType Der Typ des Feeds, der angezeigt werden soll
 * @returns Die erstellte FeedBox
 */
export async function showRssFeedScreen(
  screen: blessed.Widgets.Screen,
  feedType: FeedType
): Promise<blessed.Widgets.BoxElement> {
  let currentIndex: number = 0;
  
  // Feed-Konfiguration abrufen
  const feedConfig = feedConfigs[feedType] || feedConfigs["general-feed"];
  
  // Container für den Feed erstellen
  const feedBox = blessed.box({
    top: 0,
    left: 0,
    width: 'shrink',
    height: '90%',
    style: { bg: colors.background },
    keys: true,
    scrollable: true,
    alwaysScroll: true,
    mouse: true,
    content: `Lade ${feedConfig.title}...`,
    tags: true,
    // Speichere den Feed-Titel als private Option
    _feedTitle: feedConfig.title
  });

  screen.append(feedBox);
  screen.render();
  feedBox.focus();

  // News-Items laden und anzeigen
  let newsItems: NewsItem[] = [];
  try {
    // Feed-Daten holen
    if (feedType === "favorites-feed") {
      // TODO: Implementiere Favoritenabruf aus der Datenbank
      feedBox.setContent('Keine Favoriten verfügbar');
    } else if (feedConfig.url) {
      newsItems = await fetchRss(feedConfig.url);
      
      if (newsItems.length === 0) {
        throw new Error("Keine Nachrichten gefunden.");
      }
      
      showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);
    } else {
      feedBox.setContent(`Kein URL konfiguriert für: ${feedConfig.title}`);
    }
  } catch (error) {
    createErrorBox(screen, `Fehler beim Abrufen der Nachrichten: ${error}`);
  }

  // Tastatur-Ereignishandler einrichten
  if (newsItems.length > 0) {
    // Favorisieren-Funktion
    feedBox.key(['f'], () => {
      // TODO: Implementiere das Favorisieren
      feedBox.setContent('Aktueller Artikel wurde favorisiert!');
      screen.render();
      // Nach kurzer Verzögerung wieder den Artikel anzeigen
      setTimeout(() => {
        if (currentIndex < newsItems.length) {
          showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);
        }
      }, 1000);
    });
    
    // Navigation: Nächster Artikel
    feedBox.key(['down', 'm'], () => {
      currentIndex = (currentIndex + 1) % newsItems.length;
      showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);
    });
    
    // Navigation: Vorheriger Artikel
    feedBox.key(['up', 'n'], () => {
      currentIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : newsItems.length - 1;
      showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);
    });
  }

  // Warten, bis der Benutzer zurück zum Hauptmenü möchte
  await new Promise<void>((resolve) => {
    feedBox.key(['q'], () => {
      resolve();
    });
  });
  
  return feedBox;
}
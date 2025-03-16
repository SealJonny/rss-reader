import { NewsItem } from "../../../interfaces/news-item";
import { fetchRss } from "../../../xml/rss";
import blessed from 'blessed';

type Feeds = "general-feed" | "favorites-feed" | "technical-feed" | "economical-feed" | "political-feed" | "other-feeds";

function showNewsItem(item: NewsItem, index: number, feedBox: blessed.Widgets.BoxElement, screen: blessed.Widgets.Screen): void {
  // Clear the existing content completely
  feedBox.setContent('');
  
  // Force a render to ensure the clearing takes effect
  screen.render();
  
  // Now set the new content
  let content = '';
  content += `${index}.\n`;
  content += `📰 ${item.title}\n`;
  content += `📅 ${item.pubDate}\n`;
  content += `📖 ${item.description}\n`;
  content += `🔗 ${item.link}\n`;
  
  feedBox.setContent(content);
  screen.render();
}

export async function showRssFeedScreen(screen: blessed.Widgets.Screen, Feed: Feeds): Promise<blessed.Widgets.BoxElement> {
  let index: number = 0;
  const feedBox = blessed.box({
    top: 'top',
    left: 'left',
    width: 'shrink',
    height: 20,
    style: { bg: 'black' },
    keys: true,
    scrollable: true,
    alwaysScroll: true,
    mouse: true,
  });

  screen.append(feedBox);
  screen.render();
  feedBox.focus();

  if (Feed === "general-feed") {
    let news: NewsItem[] = [];
    try {
      news = await fetchRss("https://news.google.com/rss/search?q=Technologie&hl=de&gl=DE&ceid=DE:de");
      
      
      showNewsItem(news[index], index, feedBox, screen);
      
      if (news.length === 0) {
        throw new Error("Keine Nachrichten gefunden.");
      }
      
    } catch (error) {
      feedBox.setContent('Fehler beim Abrufen der Nachrichten ' + error);
    }

    feedBox.key(['f'], () => {
      // Hier kannst du den Code hinzufügen, um den aktuellen Artikel zu favorisieren
      feedBox.setContent('Aktueller Artikel favorisiert!');
    });
    feedBox.key(['down', 'm'], () => {
      index = (index + 1) % news.length;
      showNewsItem(news[index], index, feedBox, screen);
    });
    feedBox.key(['up', 'n'], () => {
      index = index - 1 >= 0 ? index - 1 : news.length - 1;
      showNewsItem(news[index], index, feedBox, screen);
    });

    } else if (Feed === "favorites-feed") {
      feedBox.setContent('Favoriten');
    } else if (Feed === "technical-feed") {
      feedBox.setContent('Technik');
    } else if (Feed === "economical-feed") {
      feedBox.setContent('Wirtschaft');
    } else if (Feed === "political-feed") {
      feedBox.setContent('Politik');
    }

    screen.render();


    await new Promise<void>((resolve) => {
      feedBox.key(['q'], () => {
        resolve();
      });
    });
  
  
  return feedBox;
}
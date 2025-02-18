import { NewsItem } from "../../interfaces/news-item";
import { fetchRss } from "../../xml/rss";
import blessed from 'blessed';
import { feed } from "../feed";

let index = 0;

export async function showRssFeedScreen(screen: blessed.Widgets.Screen) {
  const feedBox = blessed.box({
    top: 'top',
    left: 'left',
    width: 80,
    height: 20,
    style: { bg: 'black' },
    keys: true,
  });

  let news: NewsItem[] = [];
  try {
    news = await fetchRss("https://news.google.com/rss/search?q=Technologie&hl=de&gl=DE&ceid=DE:de");
  
    showNewsItem(news[index], index, feedBox, screen);
    
  } catch (error) {
    feedBox.setContent('Fehler beim Abrufen der Nachrichten' + error);
  }
  

  screen.append(feedBox);

  feedBox.key(['up', 'n'], () => {
    index = (index + 1) % news.length;
    showNewsItem(news[index], index, feedBox, screen);
  });
  feedBox.key(['down', 'm'], () => {
    index = index - 1 >= 0 ? index - 1 : news.length - 1;
    showNewsItem(news[index], index, feedBox, screen);
  });


  // Optional: Du kannst die Box zurückgeben, falls du sie
  // später wieder entfernen oder aktualisieren willst.
  return feedBox;
}

function showNewsItem(item: NewsItem, index: number, feedBox: blessed.Widgets.BoxElement, screen: blessed.Widgets.Screen) {
  // Clear the box
  for (let i = 0; i < 20; i++) {
    feedBox.insertLine(i, ' ');
  }

  // Set the new content
  let content = '';
  content += `${index}.\n`;
  content += `📰 ${item.title}\n`;
  content += `📅 ${item.pubDate}\n`;
  content += `📖 ${item.description}\n`;
  content += `🔗 ${item.link}\n`;
  feedBox.setContent(content);

  // Refresh the screen
  screen.render();
}

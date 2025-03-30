import blessed from 'more-blessed';
import open from 'open';
import { NewsItem } from "../../../interfaces/news-item";
import { createErrorBox, createNotificationBox } from "../utils/ui-utils";
import { colors } from '../themes/default-theme';
import { getScreenWidth, formatTerminalText, countDigits } from '../utils/feed-utils';
import { Category, isSystemCategory, SystemCategory } from '../../../interfaces/category';
import db from '../../../database/database';
import notificationBox from '../components/notification';

/**
 * Zeigt die Details eines Nachrichtenelements an
 */
async function showNewsItem(
  item: NewsItem,
  index: number,
  total: number,
  feedBox: blessed.Widgets.BoxElement,
  screen: blessed.Widgets.Screen
): Promise<void> {
  // Erst Inhalt leeren und dann rendern
  feedBox.setContent('');
  screen.render();


  // Neuen Inhalt erstellen und setzen
  let content = '';

  // Todo: Prüfen ob das geht

  let titleLength = countDigits(index + 1) + countDigits(total) + feedBox.options._feedTitle.length + 9; // 1 Slash / 1 "-" / 2 " " / 5 Padding
  let isFavorite = item.isFavorite ? `${' '.repeat(getScreenWidth(screen) - (titleLength))}{${colors.green}-fg}✻ {/${colors.green}-fg}` : '';
  // Navigations-Header mit Feed-Titel
  content += `{bold}{${colors.accent}-fg}${index + 1}/${total} - ${feedBox.options._feedTitle || ''}${isFavorite}{/${colors.accent}-fg}{/bold}\n`;

  // Horizontale Linie
  content += `{${colors.secondary}-fg}${'─'.repeat(getScreenWidth(screen) - 2)}{/${colors.secondary}-fg}\n\n`;

  // Titel hervorheben
  content += `{bold}{${colors.primary}-fg}${formatTerminalText("📰 ", item.title, getScreenWidth(screen))}{/${colors.primary}-fg}{/bold}\n\n`;

  // Datum in Sekundärfarbe
  content += `{${colors.secondary}-fg}📅 ${item.pubDate}{/${colors.secondary}-fg}\n\n`;

  // Beschreibung mit Einrückung für bessere Lesbarkeit
  content += `{white-fg}${formatTerminalText("📖 ", item.description, getScreenWidth(screen))}{/white-fg}\n\n`;

  // Kategorie
  const categoriesResult = await db.join.getCategoriesForNews(item.id!);
  const categories = categoriesResult ? categoriesResult.map((c: Category) => c.name).join(', ') : '';
  if (categories.length > 0) {
  content += `{${colors.accent}-fg}${formatTerminalText("📂 ", categories, getScreenWidth(screen))}{/${colors.accent}-fg}\n\n`
  }

  // Link
  const url = item.link.replace(/^(?:https?:\/\/)?([^\/]+\/).*$/, '$1');
  content += `{${colors.text.muted}-fg}${formatTerminalText("🔗 ", url, getScreenWidth(screen))}{/${colors.text.muted}-fg}\n\n`;

  // Quellenangabe wenn vorhanden
  content += `{${colors.text.muted}-fg}${formatTerminalText("📝 ", item.source!, getScreenWidth(screen))}{/${colors.text.muted}-fg}\n`;

  feedBox.setContent(content);
  screen.render();

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
  category: Category | SystemCategory,
): Promise<blessed.Widgets.BoxElement> {
  let currentIndex: number = 0;

  let categoryName = "";

  let newsItems: NewsItem[] = [];
  try {
    if (isSystemCategory(category)) {
      switch (category) {
        case SystemCategory.GENERAL:
          newsItems = await db.news.all();
          categoryName = SystemCategory.GENERAL;
          break;
        case SystemCategory.FAVORITES:
          newsItems = await db.news.all({isFavorite: true});
          categoryName = SystemCategory.FAVORITES;
          break;
      }
    } else {
      newsItems = await db.join.getNewsForCategory((category as Category).id!); // Todo: Error Handling
      categoryName = category.name;
    }
  } catch (error) {
    notificationBox.addNotifcation({message: `Fehler beim Abrufen der Nachrichten: ${error}`, durationInMs: 3000, isError: true});
  }

  // Container für den Feed erstellen
  const feedBox = blessed.box({
    top: 0,
    left: 0,
    width: 'shrink',
    height: '100%-2',
    padding: 1,
    style: { bg: colors.background },
    keys: true,
    scrollable: true,
    alwaysScroll: true,
    mouse: true,
    content: `Lade ${categoryName}...${' '.repeat(getScreenWidth(screen) - (8 + categoryName.length))}`,
    tags: true,
    // Speichere den Feed-Titel als private Option
    _feedTitle: categoryName
  });

  screen.append(feedBox);
  screen.render();
  feedBox.focus();

  if (newsItems.length === 0) {
    feedBox.setContent('Keine Nachrichten verfügbar.');
    screen.render();
  }

  if (newsItems.length > 0) {
    await showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);

    // Tastatur-Ereignishandler einrichten
    // Favorisieren-Funktion

    let favoriseNotification: blessed.Widgets.BoxElement;
    let creationTime = Date.now();

    feedBox.key(['f'], () => {
      db.news.setFavorite(newsItems[currentIndex].id!, !newsItems[currentIndex].isFavorite).then(async item =>  {
        if (item) {
          if (favoriseNotification) {
            favoriseNotification.destroy();
            screen.render();
          }
          creationTime = Date.now();

          newsItems[currentIndex] = item;
          if (item.isFavorite) {
            feedBox.setContent('');
            screen.render();
            await showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);

            notificationBox.pause();
            favoriseNotification = createNotificationBox(screen, ' ✻  Aktueller Artikel wurde favorisiert! ✻');
          } else {
            feedBox.setContent('');
            screen.render();
            await showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);

            notificationBox.pause();
            favoriseNotification = createNotificationBox(screen, ' ✻  Aktueller Artikel wurde aus den Favoriten entfernt! ✻');
          }
          //screen.render();
          // Nach kurzer Verzögerung wieder den Artikel anzeigen
          setTimeout(async () => {
            if (currentIndex < newsItems.length) {

              if (Date.now() - creationTime >= 2500) {
                favoriseNotification.destroy();
              }
              notificationBox.continue();
              screen.render();
              feedBox.setContent('');
              screen.render();
              await showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);
              screen.render();
            }
          }, 2500);
        }

      })

    });

    feedBox.key(['o'], () => {
      let test = open(newsItems[currentIndex].link).catch((err) => {
        notificationBox.addNotifcation({message: `Fehler beim Öffnen des Links: ${err}`, durationInMs: 3000, isError: true});
      });
    });

    // Navigation: Nächster Artikel
    feedBox.key(['down', 'j'],async () => {
      currentIndex = (currentIndex + 1) % newsItems.length;
      await showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);
    });

    // Navigation: Vorheriger Artikel
    feedBox.key(['up', 'k'],async () => {
      currentIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : newsItems.length - 1;
      await showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);
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
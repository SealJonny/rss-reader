import blessed from 'more-blessed';
import open from 'open';
import { colors } from '../../themes/default-theme';
import db from '../../../../database/database';
import { Category, SystemCategory, isSystemCategory } from '../../../../interfaces/category';
import { NewsItem } from '../../../../interfaces/news-item';
import notificationBox from '../../components/notification';
import { countDigits, getScreenWidth, formatTerminalText } from '../../utils/feed-utils';
import { createNotificationBox } from '../../utils/ui-utils';
import helpBox from '../../components/help-box';
import { showSummarizePopup } from './popups/summarize-popup';

/**
 * Displays the details of a news item in the feed box
 *
 * @param item The news item to display
 * @param index Current index of the item in the list
 * @param total Total number of news items
 * @param feedBox The box element where content is displayed
 * @param screen The blessed screen instance
 * @returns Promise that resolves when the display is complete
 */
async function showNewsItem(
  item: NewsItem,
  index: number,
  total: number,
  feedBox: blessed.Widgets.BoxElement,
  screen: blessed.Widgets.Screen
): Promise<void> {
  // Clear content and render before adding new content
  feedBox.setContent('');
  screen.render();

  let content = '';
  let titleLength = countDigits(index + 1) + countDigits(total) + feedBox.options._feedTitle.length + 9; // 1 Slash / 1 "-" / 2 " " / 5 Padding
  let isFavorite = item.isFavorite ? `${' '.repeat(getScreenWidth(screen) - (titleLength))}{${colors.green}-fg}✻ {/${colors.green}-fg}` : '';

  // Navigation header with feed title
  content += `{bold}{${colors.accent}-fg}${index + 1}/${total} - ${feedBox.options._feedTitle || ''}${isFavorite}{/${colors.accent}-fg}{/bold}\n`;

  // Horizontal line
  content += `{${colors.secondary}-fg}${'─'.repeat(getScreenWidth(screen) - 2)}{/${colors.secondary}-fg}\n\n`;

  // Highlight title
  content += `{bold}{${colors.primary}-fg}${formatTerminalText("📰 ", item.title, getScreenWidth(screen))}{/${colors.primary}-fg}{/bold}\n\n`;

  // Date
  if (item.pubDate) {
    content += `{${colors.secondary}-fg}📅 ${new Date(item.pubDate).toLocaleString()}{/${colors.secondary}-fg}\n\n`;
  }

  // Description
  content += `{white-fg}${formatTerminalText("📖 ", item.description, getScreenWidth(screen))}{/white-fg}\n\n`;

  // Categories
  const categoriesResult = await db.join.getCategoriesForNews(item.id!);
  const categories = categoriesResult ? categoriesResult.map((c: Category) => c.name).join(', ') : '';
  if (categories.length > 0) {
    content += `{${colors.accent}-fg}${formatTerminalText("📂 ", categories, getScreenWidth(screen))}{/${colors.accent}-fg}\n\n`;
  }

  // Link
  const url = item.link.replace(/^(?:https?:\/\/)?([^\/]+\/).*$/, '$1');
  content += `{${colors.text.muted}-fg}${formatTerminalText("🔗 ", url, getScreenWidth(screen))}{/${colors.text.muted}-fg}\n\n`;

  // Source if available
  content += `{${colors.text.muted}-fg}${formatTerminalText("📝 ", item.source!, getScreenWidth(screen))}{/${colors.text.muted}-fg}\n`;

  feedBox.setContent(content);
  screen.render();
}

/**
 * Displays the RSS feed screen with news items from a specific category
 *
 * @param screen The blessed screen instance
 * @param category The category or system category to display news for
 * @returns Promise resolving to the created feed box element
 */
export async function showRssFeedScreen(
  screen: blessed.Widgets.Screen,
  category: Category | SystemCategory,
): Promise<blessed.Widgets.BoxElement> {
  helpBox.resetView();
  helpBox.setView("rss-feed");
  let currentIndex: number = 0;
  let categoryName = "";

  let newsItems: NewsItem[] = [];
  try {
    if (isSystemCategory(category)) {
      switch (category) {
        case SystemCategory.GENERAL:
          newsItems = await db.news.all();
          newsItems = newsItems.filter(n => {
            if (!n.isFavorite) {
              return n;
            }
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            if (n.creationDate > oneDayAgo) {
              return n;
            }
          });
          categoryName = SystemCategory.GENERAL;
          break;
        case SystemCategory.FAVORITES:
          newsItems = await db.news.all({isFavorite: true});
          categoryName = SystemCategory.FAVORITES;
          break;
      }
    } else {
      newsItems = await db.join.getNewsForCategory((category as Category).id!);
      newsItems = newsItems.filter(n => {
        if (!n.isFavorite) {
          return n;
        }
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (n.creationDate > oneDayAgo) {
          return n;
        }
      });
      categoryName = category.name;
    }
  } catch (error) {
    notificationBox.addNotifcation({message: "Fehler: Das Abrufen der Nachrichten ist fehlgeschlagen  ", durationInMs: 3000, isError: true});
  }

  // Create container for the feed
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
    mouse: false,
    content: `Lade ${categoryName}...${' '.repeat(getScreenWidth(screen) - (8 + categoryName.length))}`,
    tags: true,
    // Store feed title as private option
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

    // Set up keyboard event handlers

    // Favorite functionality
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
      });
    });

    // Open article in browser
    feedBox.key(['o'], () => {
      let test = open(newsItems[currentIndex].link).catch((err) => {
        notificationBox.addNotifcation({message: "Fehler: Das Öffnen des Links ist fehlgeschlagen  ", durationInMs: 3000, isError: true});
      });
    });

    // Show summary popup
    feedBox.key(['s'], async () => {
      feedBox.hide();
      screen.render();
      await showSummarizePopup(newsItems[currentIndex], feedBox, screen);
      await showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);
      feedBox.focus();
      helpBox.setView("rss-feed");
    })

    // Navigation: Next article
    feedBox.key(['down', 'j'],async () => {
      currentIndex = (currentIndex + 1) % newsItems.length;
      await showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);
    });

    // Navigation: Previous article
    feedBox.key(['up', 'k'],async () => {
      currentIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : newsItems.length - 1;
      await showNewsItem(newsItems[currentIndex], currentIndex, newsItems.length, feedBox, screen);
    });
  }

  await new Promise<void>((resolve) => {
    feedBox.key(['q'], () => {
      resolve();
    });
  });

  return feedBox;
}
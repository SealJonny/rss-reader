import blessed from 'more-blessed';
import { showStartAnimation } from './screens/start-animation';
import { showRssFeedScreen } from './screens/rss-feed-screen';
import { showMainScreen, MainMenuSelection } from './screens/main-screen';
import { createHelpBox } from './components/help-box';
import { createConfirmBox, createErrorBox, createNotificationBox } from './utils/ui-utils';
import db from '../../database/database';
import { Category, SystemCategory } from '../../interfaces/category';
import { showEditFeedsScreen } from './screens/edit-feeds-screen';
import { DbJobs } from '../../database/db-jobs';

/**
 * Hauptfunktion für die UI-Steuerung
 */
export async function main() {
  await db.initialize();

  await db.news.deleteAllOlderThanOneDay();


  const insertJob = new DbJobs();
  const categoriseJob = new DbJobs();

  // Erstelle Hauptbildschirm
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: 'RSS-Feed-Reader',
  });

  // Zustand für Quit-Bestätigung
  let quitPending = false;

  // Beenden der Anwendung
  screen.key([ 'C-c'], () => { // 'escape',
    if (!quitPending) {
      quitPending = true;
      // Bestätigungsnachricht anzeigen
      const confirmBox = createConfirmBox(screen, 'Press ESC oder Ctrl+C um zu beenden');
      // Nach 3 Sekunden wird automatisch quitPending zurückgesetzt
      setTimeout(() => {
        quitPending = false;
      }, 3000);
    } else {
      insertJob.cancel();
      categoriseJob.cancel();
      setTimeout(() => process.exit(0), 200);
    }
  });


  // Boot into start animation and start fetching all news
  try {
    const startAnimation = showStartAnimation(screen, insertJob);
    await insertJob.insertAllNews();
    const box = await startAnimation;
    box.destroy();
  } catch (error) {

  }

  // Start categorise job in background and register callbacks for completion or errors in the categorise job
  insertJob.on("complete", () => {
    const box = createNotificationBox(screen, "Kategorisierung ist abgeschlossen   ");
    setTimeout(() => {
      box.destroy();
      screen.render();
    }, 2500);
  });
  insertJob.on("error", () => {
    const box = createErrorBox(screen, "Die Kategorisierung ist fehlgeschlagen   ");
    setTimeout(() => {
      box.destroy();
      screen.render();
    }, 2500);
  });
  insertJob.categoriseAllNews().catch(e => {});

  let categories: Category[] = [];

  // Hauptprogrammschleife
  while(true) {
    try {
      categories = await db.categories.all();
    } catch(error) {
      createErrorBox(screen, `${error}`);
    }

    // Hilfsbox anzeigen und Benutzerauswahl vom Hauptscreen holen
    const helpBox = createHelpBox(screen, "main-screen");
    const menuChoice = await showMainScreen(screen, categories);
    helpBox.destroy();
    screen.render();

    // Benutzeraktion verarbeiten
    switch(menuChoice) {
      case MainMenuSelection.GENERAL_FEED:
        await showFeed(screen, SystemCategory.GENERAL);
        break;

      case MainMenuSelection.FAVORITE_FEED:
        await showFeed(screen, SystemCategory.FAVORITES);
        break;

      case MainMenuSelection.EDIT_URLS:
        await showEditFeedsScreen(screen);
        break;

      case MainMenuSelection.START_ANIMATION:
        await showStartAnimation(screen);
        break;

      default:
        let selectedCategory = categories.find(c => c.id === menuChoice)
        if (selectedCategory) {
          await showFeed(screen, selectedCategory);
        }
        break;
    }
  }
}

/**
 * Hilfsfunktion für das Anzeigen verschiedener Feed-Typen
 */
async function showFeed(screen: blessed.Widgets.Screen, category: Category | SystemCategory) {
  const helpBox = createHelpBox(screen, "rss-feed");
  try {
    const rssFeed = await showRssFeedScreen(screen, category);
    rssFeed.focus();
    rssFeed.destroy();
  } finally {
    helpBox.destroy();
    screen.render();
  }
}

import blessed from 'more-blessed';
import { showStartAnimation } from './screens/start-animation';
import { showMainScreen, MainMenuSelection } from './screens/main-screen';
import helpBox from './components/help-box';
import { createConfirmBox } from './utils/ui-utils';
import db from '../../database/database';
import { Category, SystemCategory } from '../../interfaces/category';
import insertJob from '../../database/jobs/insert-job';
import categoriseJob from '../../database/jobs/categorise-job';
import { AbortError, JobAlreadyRunning } from '../../errors/general';
import notificationBox from './components/notification';
import { EntityUpdateError } from '../../errors/database';
import { showEditCategoriesScreen } from './screens/edit-screens/categories/category-screen';
import { showEditFeedsScreen } from './screens/edit-screens/feeds/feeds-screen';
import { showRssFeedScreen } from './screens/feed-screen/rss-feed-screen';

/**
 * Synchronizes the database by fetching all RSS feeds and categorizing news items
 *
 * @param screen The blessed screen instance
 * @returns A Promise that resolves when the synchronization has started
 */
export async function syncDatabase(screen: blessed.Widgets.Screen): Promise<void> {
  if (insertJob.isActive() || categoriseJob.isActive()) {
    notificationBox.addNotifcation({
      message: "Die Synchronisation läuft bereits   ",
      durationInMs: 3000,
      isError: true
    });
    return;
  }

  try {
    const startAnimation = showStartAnimation(screen, true);
    await insertJob.execute();
    const box = await startAnimation;
    box.destroy();
  } catch (error) {
    if (error instanceof JobAlreadyRunning) {
      notificationBox.addNotifcation({message: "Die Synchronisation läuft bereits   ", durationInMs: 3000, isError: true});
    }

    if (error instanceof EntityUpdateError) {
      notificationBox.addNotifcation({message: "Das Laden der News ist fehlgeschlagen   ", durationInMs: 3000, isError: true});
    }

    if (error instanceof AbortError) {
      throw error;
    }
  }

  categoriseJob.once("complete", () => {
    notificationBox.addNotifcation({message: "Kategorisierung ist abgeschlossen   ", durationInMs: 2500, isError: false});
  });

  categoriseJob.once("error", () => {
    notificationBox.addNotifcation({message: "Kategorisierung ist fehlgeschlagen   ", durationInMs: 2500, isError: true});
  });

  categoriseJob.execute().catch(error => {
    if (error instanceof JobAlreadyRunning) {
      notificationBox.addNotifcation({message:  "Die Synchronisation läuft bereits   ", durationInMs: 3000, isError: true});
    }
  });
}

/**
 * Main function for UI control
 * Initializes the database, sets up the UI components and handles the main program loop
 */
export async function main() {
  await db.initialize();
  await db.news.deleteAllOlderThanOneDay();

  const screen = blessed.screen({
      smartCSR: true,
      fullUnicode: true,
      title: 'RSS Feed Reader',
  });

  helpBox.initialize(screen);
  notificationBox.initialize(screen);

  let quitPending = false;

  screen.key(['C-c'], () => { // 'escape',
    if (!quitPending) {
      quitPending = true;

      const confirmBox = createConfirmBox(screen, 'Press ESC oder Ctrl+C um zu beenden');
      setTimeout(() => {
        quitPending = false;
        confirmBox.destroy();
        screen.render();
      }, 3000);
    } else {
      insertJob.cancel();
      categoriseJob.cancel();
      setTimeout(() => process.exit(0), 200);
    }
  });

  notificationBox.pause();
  await syncDatabase(screen);
  notificationBox.continue();

  let categories: Category[] = [];

  // Main program loop
  while(true) {
    try {
      categories = await db.categories.all();
    } catch(error) {
      notificationBox.addNotifcation({
        message: "Fehler: Die Kategorien konnten nicht geladen werden",
        durationInMs: 3000,
        isError: true
      });
    }

    helpBox.setView("main-screen");
    const menuChoice = await showMainScreen(screen, categories);
    helpBox.resetView();
    screen.render();

    // Process user action
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

      case MainMenuSelection.EDIT_CATEGORIES:
        await showEditCategoriesScreen(screen);
        break;

      case MainMenuSelection.SYNC:
          await syncDatabase(screen);
        break;

      default:
        let selectedCategory = categories.find(c => c.id === menuChoice);
        if (selectedCategory) {
          await showFeed(screen, selectedCategory);
        }
        break;
    }
  }
}

/**
 * Helper function for displaying different feed types
 *
 * @param screen The blessed screen instance
 * @param category Category or system category to display
 */
async function showFeed(screen: blessed.Widgets.Screen, category: Category | SystemCategory) {
  helpBox.setView("rss-feed");
  try {
    const rssFeed = await showRssFeedScreen(screen, category);
    rssFeed.focus();
    rssFeed.destroy();
  } finally {
    helpBox.resetView();
    screen.render();
  }
}

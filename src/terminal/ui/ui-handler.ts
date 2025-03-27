import blessed from 'more-blessed';
import { showStartAnimation } from './screens/start-animation';
import { showRssFeedScreen } from './screens/rss-feed-screen';
import { showMainScreen, MainMenuSelection } from './screens/main-screen';
import { createHelpBox } from './components/help-box';
import { createConfirmBox, createErrorBox } from './utils/ui-utils';
import db from '../../database/database';
import { Category, SystemCategory } from '../../interfaces/category';
import { showEditFeedsScreen } from './screens/edit-feeds-screen';

/**
 * Hauptfunktion für die UI-Steuerung
 */
export async function main() {
  await db.initialize();

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
      process.exit(0);
    }
  });

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
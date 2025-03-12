import blessed from 'blessed';
import { showStartAnimation } from './screens/start-animation';
import { showRssFeedScreen, FeedType } from './screens/rss-feed-screen';
import { showMainScreen, MainMenuSelection, FeedCategory } from './screens/main-screen';
import { createHelpBox } from './components/help-box';
import { createConfirmBox } from './utils/ui-utils';

/**
 * Hauptfunktion für die UI-Steuerung
 */
export async function main() {
  // Erstelle Hauptbildschirm
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: 'RSS-Feed-Reader',
  });

  // Zustand für Quit-Bestätigung
  let quitPending = false;

  // Beenden der Anwendung
  screen.key(['escape', 'C-c'], () => {
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

  // Hauptprogrammschleife
  while(true) {
    // Hilfsbox anzeigen und Benutzerauswahl vom Hauptscreen holen
    const helpBox = createHelpBox(screen, "main-screen");
    const menuChoice = await showMainScreen(screen);
    helpBox.destroy();
    screen.render();
    
    // Benutzeraktion verarbeiten
    switch(menuChoice) {
      case MainMenuSelection.GENERAL_FEED:
        await showFeed(screen, 'general-feed');
        break;

      case MainMenuSelection.FAVORITE_FEED:
        await showFeed(screen, 'favorites-feed');
        break;

      case FeedCategory.TECHNICAL:
        await showFeed(screen, 'technical-feed');
        break;

      case FeedCategory.ECONOMICAL:
        await showFeed(screen, 'economical-feed');
        break;

      case FeedCategory.POLITICAL:
        await showFeed(screen, 'political-feed');
        break;

      case MainMenuSelection.START_ANIMATION:
        await showStartAnimation(screen);
        break;

      default:
        // Bei unbekannten Optionen nichts tun
        break;
    }
  }
}

/**
 * Hilfsfunktion für das Anzeigen verschiedener Feed-Typen
 */
async function showFeed(screen: blessed.Widgets.Screen, feedType: FeedType) {
  const helpBox = createHelpBox(screen, "rss-feed");
  try {
    const rssFeed = await showRssFeedScreen(screen, feedType);
    rssFeed.focus();
    rssFeed.destroy();
  } finally {
    helpBox.destroy();
    screen.render();
  }
}
import blessed from 'blessed';
import { showStartAnimation } from './start-animation-new';
import { showRssFeedScreen } from './rss-feed-screen';
import { showMainScreen } from './show-main-screen';
import { createHelpBox } from './help-box';

export async function main() {
  // 1) Create main screen
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: 'RSS-Feed-Reader',
  });

  // 2) Global keys for quitting
  screen.key(['escape', 'C-c'], () => {
    process.exit(0);
  });

  // 3) Main menu loop
  while(true) {
    // Show main menu and get user choice
    const menuChoice = await showMainScreen(screen);

    if (menuChoice === 1) {
      // Show animation
      await showStartAnimation(screen);
    } else if (menuChoice === 2) {
      // Show RSS feed with help box
      const helpBox = createHelpBox(screen);
      try {
        const rssFeed = await showRssFeedScreen(screen);
        // Focus on the RSS feed to capture navigation keys
        rssFeed.focus();
        // After the function completes (user exits), destroy the feedBox
        rssFeed.destroy();
      } finally {
        // Make sure help box is always destroyed when done
        helpBox.destroy();
        screen.render();
      }
    }
  }
}
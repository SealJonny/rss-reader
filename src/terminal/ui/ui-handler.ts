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

  // Zustand für Quit-Bestätigung
  let quitPending = false;

  // Quitting
  screen.key(['escape', 'C-c'], () => {
    if (!quitPending) {
      quitPending = true;
      // Erstelle eine Message-Box, die eine Bestätigung anzeigt
      const confirmBox = blessed.message({
        parent: screen,
        bottom: 0,
        right: 0,
        width: '100%',
        height: 'shrink',
        align: 'left',
        valign: 'middle',
        style: {
          fg: 'gray',
        }
      });
      // Zeige die Nachricht für 3 Sekunden an
      confirmBox.display('Press ESC oder Ctrl+C um zu beenden', 3, () => {
        quitPending = false;
      });
    } else {
      process.exit(0);
    }
  });

  // 3) Main menu loop
  while(true) {
    // Show main menu and get user choice
    const helpBox = createHelpBox(screen, "main-screen");
    const menuChoice = await showMainScreen(screen);
    helpBox.destroy();
    screen.render();
    
    // Handle user choice
    if( menuChoice === 0) {
      // Error handling
      const errorBox = blessed.box({
        parent: screen,
        bottom: 0,
        right: 0,
        width: '100%',
        height: 'shrink',
        align: 'left',
        valign: 'middle',
        style: {
          fg: 'red',
        },
        content: "Error: Choice couldn't be handled.",
      });
    }
    if (menuChoice === 6) {
      // Show animation
      await showStartAnimation(screen);
    } else if (menuChoice === 1) {
      // Show RSS feed with help box
      const helpBox = createHelpBox(screen, "rss-feed");
      try {
        const rssFeed = await showRssFeedScreen(screen, 'general-feed'); // Todo: Soll dann nacher noch einen parameter für welchen feed es ist bekommen
        // Focus on the RSS feed to capture navigation keys
        rssFeed.focus();
        // After the function completes (user exits), destroy the feedBox
        rssFeed.destroy();
      } finally {
        // Make sure help box is always destroyed when done
        helpBox.destroy();
        screen.render();
      }
    } else if (menuChoice === 2) {
      // Show favorites feed
      const helpBox = createHelpBox(screen, "rss-feed");
      try {
        const rssFeed = await showRssFeedScreen(screen, 'favorites-feed');
        rssFeed.focus();
        rssFeed.destroy();
      } finally {
        helpBox.destroy();
        screen.render();
      }
    } else if (menuChoice === 11) {
      // Show technical feed
      const helpBox = createHelpBox(screen, "rss-feed");
      try {
        const rssFeed = await showRssFeedScreen(screen, 'technical-feed');
        rssFeed.focus();
        rssFeed.destroy();
      } finally {
        helpBox.destroy();
        screen.render();
      }
    } else if (menuChoice === 12) {
      // Show economical feed
      const helpBox = createHelpBox(screen, "rss-feed");
      try {
        const rssFeed = await showRssFeedScreen(screen, 'economical-feed');
        rssFeed.focus();
        rssFeed.destroy();
      } finally {
        helpBox.destroy();
        screen.render();
      }
    } else if (menuChoice === 13) {
      // Show political feed
      const helpBox = createHelpBox(screen, "rss-feed");
      try {
        const rssFeed = await showRssFeedScreen(screen, 'political-feed');
        rssFeed.focus();
        rssFeed.destroy();
      } finally {
        helpBox.destroy();
        screen.render();
      }
    }
  }
}
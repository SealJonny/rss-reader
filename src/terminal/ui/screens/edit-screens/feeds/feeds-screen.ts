import blessed from 'more-blessed';
import { colors } from '../../../themes/default-theme';
import db from '../../../../../database/database';
import { RssFeed } from '../../../../../interfaces/rss-feed';
import helpBox from '../../../components/help-box';
import notificationBox from '../../../components/notification';
import { createNotificationBox } from '../../../utils/ui-utils';
import { renderFeedList } from './renderers';
import { showFeedEditPopup } from './popups/edit-popup';
import { showSearchGptScreen } from './popups/search-popup';
import { syncDatabase } from '../../../ui-handler';

/**
 * Type for tracking selection state in the feeds list
 */
export interface FeedListState {
  currentIndex: number;
}

/**
 * Shows a screen for editing RSS feed URLs
 *
 * @param screen The blessed screen instance
 * @returns Promise that resolves when the screen is closed
 */
export async function showEditFeedsScreen(screen: blessed.Widgets.Screen): Promise<void> {
  // Header box for the title that doesn't scroll
  const headerBox = blessed.box({
    top: 0,
    left: 0,
    width: '25%',
    height: 3,
    padding: {
      left: 1,
      top: 1
    },
    tags: true,
    content: `{bold}{${colors.secondary}-fg}RSS Feeds Liste{/${colors.secondary}-fg}{/bold}`,
  });

  // Feed list starts below the header
  const feedListBox = blessed.list({
    top: 3,
    left: 0,
    width: '25%',
    height: '100%-5',
    padding: {
      left: 1
    },
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    scrollbar: {
      ch: ' ',
      track: {
        bg: colors.background
      },
      style: {
        inverse: true
      }
    },
    style: {
      item: {
        fg: colors.text.muted
      },
      selected: {
        fg: colors.primary,
        bold: true
      }
    }
  });

  const separator = blessed.line({
    parent: screen,
    orientation: 'vertical',
    top: 0,
    left: '25%',
    height: '100%-2',
    style: {
      fg: colors.accent,
    },
    hidden: true,
  });

  const detailsBox = blessed.box({
    top: 0,
    left: '30%+1',
    width: '70%-1',
    height: '100%-2',
    padding: 1,
    scrollable: true,
    tags: true,
    content: '',
    hidden: true,
  });

  screen.append(headerBox);
  screen.append(feedListBox);
  screen.append(detailsBox);
  feedListBox.focus();

  // Add help box
  helpBox.setView("edit-feeds-list");

  screen.render();

  // State for tracking selection
  const state: FeedListState = {
    currentIndex: 0,
  };

  let feeds: RssFeed[] = [];
  try {
    feeds = await db.rssFeeds.all();
    renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
  } catch (error) {
    notificationBox.addNotifcation({
      message: "Fehler: Das Laden der RSS Feeds ist fehlgeschlagen   ",
      durationInMs: 2500,
      isError: true
    });
  }

  // Key handler for up navigation in the list
  feedListBox.key(['up', 'k'], () => {
    if (feeds.length === 0) return;

    if (state.currentIndex === 0) {
      state.currentIndex = feeds.length - 1; // Wrap to the bottom
    } else {
      state.currentIndex = Math.max(0, state.currentIndex - 1);
    }
    renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
  });

  // Key handler for down navigation in the list
  feedListBox.key(['down', 'j'], () => {
    if (feeds.length === 0) return;

    if (state.currentIndex === feeds.length - 1) {
      state.currentIndex = 0; // Wrap to the top
    } else {
      state.currentIndex = Math.min(feeds.length - 1, state.currentIndex + 1);
    }
    renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
  });

  // Add new feed (a)
  feedListBox.key(['a'], async () => {
    const preLength = feeds.length;
    await showFeedEditPopup(screen, undefined, feeds, state, feedListBox, detailsBox, separator);
    helpBox.setView("edit-feeds-list");
    if (feeds.length > preLength) {
      await syncDatabase(screen, false);
    }
  });

  // Add new feed through ChatGPT (c)
  feedListBox.key(['c'], async () => {
    await showSearchGptScreen(screen, feeds, state, feedListBox, detailsBox, separator);
    helpBox.setView("edit-feeds-list");
  });

  // Edit feed (e)
  feedListBox.key(['e'], async () => {
    if (feeds.length === 0) return;

    const selectedFeed = feeds[state.currentIndex];
    await showFeedEditPopup(screen, selectedFeed, feeds, state, feedListBox, detailsBox, separator);
    helpBox.setView("edit-feeds-list");
  });

  // Delete feed (d)
  feedListBox.key(['d'], async () => {
    if (feeds.length === 0) return;

    const selectedFeed = feeds[state.currentIndex];
    if (selectedFeed.id !== undefined) {
      const cuttedTitle = selectedFeed.title.length > 20 ? `${selectedFeed.title.substring(0, 20)}...` : selectedFeed.title;
      notificationBox.pause();
      const notification = createNotificationBox(
        screen,
        `Bist du sicher dass du den RSS Feed "${cuttedTitle}" löschen willst? [y/n]   `
      );

      // Wait for confirmation
      await new Promise<void>((resolve) => {
        screen.once('keypress', async (_, key) => {
          if (key.name === 'y' || key.name === 'Y') {
            try {
              await db.rssFeeds.delete(selectedFeed.id!);
              feeds = feeds.filter(f => f.id !== selectedFeed.id);

              // Update selection
              if (state.currentIndex >= feeds.length) {
                state.currentIndex = Math.max(0, feeds.length - 1);
              }

              notification.destroy();

              notificationBox.addNotifcation({
                message: `"RSS Feed ${selectedFeed.title}" wurde gelöscht `,
                durationInMs: 2500,
                isError: false
              });

              renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
            } catch (error) {
              notification.destroy();

              notificationBox.addNotifcation({
                message: `Fehler: Löschen des RSS Feeds ${selectedFeed.title} ist fehlgeschlagen`,
                durationInMs: 3000,
                isError: true
              });
            }
            notification.destroy();
            screen.render();
          } else {
            notification.destroy();
            screen.render();
          }
          notificationBox.continue();
          resolve();
        });
      });
      notificationBox.continue();
    }
  });

  // Wait for the user to press 'q' to quit
  await new Promise<void>((resolve) => {
    feedListBox.key(['q'], () => {
      feedListBox.destroy();
      helpBox.resetView();
      detailsBox.destroy();
      separator.destroy();
      headerBox.destroy();
      screen.render();
      resolve();
    });
  });
}
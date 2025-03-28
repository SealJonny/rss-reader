import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';
import { centerElement, createErrorBox, createNotificationBox } from '../utils/ui-utils';
import { RssFeed } from '../../../interfaces/rss-feed';
import db from '../../../database/database';
import { createHelpBox } from '../components/help-box';
import { validateRssFeed } from '../../../rss/validater';
import { RssFeedInvalidError, RssFeedNotFoundError } from '../../../errors/rss-feed';
import { EntityCreateError } from '../../../errors/database';
import { getScreenWidth } from '../utils/feed-utils';

// Type for tracking expanded state of feeds
interface FeedListState {
  currentIndex: number;
}

/**
 * Shows a screen for editing RSS feed URLs
 */
export async function showEditFeedsScreen(screen: blessed.Widgets.Screen): Promise<void> {
  // Header-Box für den Titel, der nicht scrollt
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

  // Feed-Liste beginnt jetzt unter dem Header
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
  const helpBox = createHelpBox(screen, "edit-feeds-list");

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
    let errorBox = createErrorBox(screen, `Error loading RSS feeds: ${error}   `);
    setTimeout(() => {
      errorBox.destroy();
      screen.render();
    }, 2500);
  }

  // Key handler for the feed list
  feedListBox.key(['up', 'k'], () => {
    if (feeds.length === 0) return;

    if (state.currentIndex === 0) {
      state.currentIndex = feeds.length - 1; // Wrap to the bottom
    } else {
      state.currentIndex = Math.max(0, state.currentIndex - 1);
    }
    renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
  });

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
    await showFeedEditPopup(screen, undefined, feeds, state, feedListBox, detailsBox, separator);
  });

  // Add new feed through ChatGPT (c)
  // Todo: Implement this feature
  feedListBox.key(['c'], async () => {
    await showFeedEditPopup(screen, undefined, feeds, state, feedListBox, detailsBox, separator);
  });

  // Edit feed (e)
  feedListBox.key(['e'], async () => {
    if (feeds.length === 0) return;

    const selectedFeed = feeds[state.currentIndex];
    await showFeedEditPopup(screen, selectedFeed, feeds, state, feedListBox, detailsBox, separator);
  });

  // Delete feed (d)
  feedListBox.key(['d'], async () => {
    if (feeds.length === 0) return;

    const selectedFeed = feeds[state.currentIndex];
    if (selectedFeed.id !== undefined) {
      const cuttedTitle = selectedFeed.title.length > 20 ? `${selectedFeed.title.substring(0, 20)}...` : selectedFeed.title
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
              const notificationBox = createNotificationBox(screen, `Feed "${selectedFeed.title}" deleted   `);
              setTimeout(() => {
                notificationBox.destroy();
                screen.render();
              }, 2500);
              renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
            } catch (error) {
              notification.destroy();
              let errorBox = createErrorBox(screen, `Error deleting feed: ${error}   `);
              setTimeout(() => {
                errorBox.destroy();
                screen.render();
              }, 2500);
            }
            notification.destroy();
            screen.render();
          } else {
            notification.destroy();
            screen.render();
          }
          resolve();
        });
      });
    }
  });

  // Wait for the user to press 'q' to quit
  await new Promise<void>((resolve) => {
    feedListBox.key(['q'], () => {
      feedListBox.destroy();
      helpBox.destroy();
      detailsBox.destroy();
      separator.destroy();
      headerBox.destroy();
      screen.render();
      resolve();
    });
  });
}

/**
 * Renders the feed list with current selection
 */
function renderFeedList(
  screen: blessed.Widgets.Screen,
  feedList: blessed.Widgets.ListElement,
  feeds: RssFeed[],
  state: FeedListState,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): void {
  if (feeds.length === 0) {
    feedList.setItems(['Keine RSS Feeds verfügbar.', '', 'Drücke "a" um manuell einen neuen RSS Feed hinzuzufügen.', '', 'Oder "c" um einen mit Hilfe von ChatGPT hinzuzufügen.']);
    feedList.select(1);

    // Hide details and separator when no feeds
    if (detailsBox) detailsBox.hide();
    if (separator) separator.hide();
    feedList.screen?.render();
    return;
  }

  const items: string[] = [];
  const cutLenght = ((getScreenWidth(screen)*0.25)-10);

  // Add items
  feeds.forEach((feed, index) => {
    let cuttedTitle = feed.title.length > cutLenght ? `${feed.title.substring(0, cutLenght)}...` : feed.title;
    items.push(cuttedTitle);
  });

  feedList.setItems(items);

  // Set the selected item (offset by 3 for the header)
  feedList.select(state.currentIndex);

  // Show details for currently selected feed
  if (detailsBox && separator && feeds.length > 0) {
    const selectedFeed = feeds[state.currentIndex];
    if (selectedFeed) {
      renderFeedDetails(detailsBox, selectedFeed);
      detailsBox.show();
      separator.show();
    } else {
      detailsBox.hide();
      separator.hide();
    }
  }

  feedList.screen?.render();
}

/**
 * Renders the feed details in the details box
 */
function renderFeedDetails(
  detailsBox: blessed.Widgets.BoxElement,
  feed: RssFeed
): void {
  let content = '';

  // Show title as header
  content += `{bold}{${colors.secondary}-fg}${feed.title}{/${colors.secondary}-fg}{/bold}\n\n`;

  // Show feed details
  content += `{bold}{${colors.primary}-fg}URL:{/${colors.primary}-fg}{/bold} \n${feed.link}\n\n`;
  content += `{bold}{${colors.primary}-fg}Description:{/${colors.primary}-fg}{/bold} \n${feed.description}\n\n`;

  if (feed.language) {
    content += `{bold}{${colors.primary}-fg}Language:{/${colors.primary}-fg}{/bold} \n${feed.language}\n\n`;
  }

  if (feed.lastBuildDate) {
    const date = new Date(feed.lastBuildDate);
    content += `{bold}{${colors.primary}-fg}Last Build Date:{/${colors.primary}-fg}{/bold} \n${date.toLocaleDateString()} ${date.toLocaleTimeString()}\n\n`;
  }

  detailsBox.setContent(content);
}

/**
 * Shows a popup for adding or editing an RSS feed
 */
async function showFeedEditPopup(
  screen: blessed.Widgets.Screen,
  feed: RssFeed | undefined,
  feeds: RssFeed[],
  state: FeedListState,
  feedListBox: blessed.Widgets.ListElement,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): Promise<void> {
  const isAdd = feed === undefined;

  const editFeedHelpBox = createHelpBox(screen, "edit-feed");

  // Create the popup box
  const popupBox = blessed.box({
    top: 'center',
    left: 'center',
    width: 62,
    height: 14,
    padding: 1,
    border: {
      type: 'line'
    },
    shadow: true,
    tags: true,
    style: {
      bg: colors.background,
      fg: colors.text.normal,
      border: {
        fg: colors.secondary
      },
    }
  });

  // Title
  const titleLabel = blessed.text({
    parent: popupBox,
    top: 0,
    left: 2,
    style: {
      fg: colors.secondary,
    },
    content: `{bold}${isAdd ? 'Add New RSS Feed' : 'Edit RSS Feed'}{/bold}`,
    tags: true
  });

  // Name input
  const nameLabel = blessed.text({
    parent: popupBox,
    top: 3,
    left: 2,
    style: {
      fg: colors.accent,
    },
    content: 'Name:',
  });

  const nameInput = blessed.textbox({
    parent: popupBox,
    top: 2,
    left: 9,
    width: 45,
    height: 3,
    inputOnFocus: true,
    border: {
      type: 'line',
    },
    style: {
      focus: {
        border: {
          fg: colors.primary
        }
      }
    }
  });

  // URL input
  const urlLabel = blessed.text({
    parent: popupBox,
    top: 8,
    left: 2,
    style: {
      fg: colors.accent,
    },
    content: 'URL:',
  });

  const urlInput = blessed.textbox({
    parent: popupBox,
    top: 7,
    left: 9,
    width: 45,
    height: 3,
    inputOnFocus: true,
    border: {
      type: 'line',
    },
    style: {
      focus: {
        border: {
          fg: colors.primary
        }
      }
    }
  });

  // Help text
  const helpText = blessed.text({
    parent: popupBox,
    top: 5,
    right: 5,
    content: '{gray-fg}Name ist optional{/gray-fg}',
    tags: true
  });

  // Set current values if editing
  if (!isAdd && feed) {
    nameInput.setValue(feed.title);
    urlInput.setValue(feed.link);
  }

  // Add to screen
  screen.append(popupBox);
  popupBox.focus();
  nameInput.focus();
  screen.render();

  // Handle field navigation
  let activeInput = nameInput;

  function focusNext() {
    if (activeInput === nameInput) {
      activeInput = urlInput;
      urlInput.setValue(urlInput.getValue().replace(/\t$/, ""));
      urlInput.focus();
    } else {
      activeInput = nameInput;
      nameInput.setValue(nameInput.getValue().replace(/\t$/, ""));
      nameInput.focus();
    }
    screen.render();
  }

  // Set up focus handlers for help text
  [nameInput, urlInput].forEach(input => {
    input.key('tab', function() {
      popupBox.focus();
      focusNext();
    });

    input.key(['escape'], () => {
      editFeedHelpBox.destroy();
      popupBox.destroy();
      screen.render();
      feedListBox.focus();
    });

    // Handle arrow key navigation between fields
    input.key('down', function() {
      if (input === nameInput) {
        focusNext();
        return false;
      }
      return true;
    });

    input.key('up', function() {
      if (input === urlInput) {
        focusNext();
        return false;
      }
      return true;
    });

    input.key(['enter'], async () => {
      // Get values
      const title = nameInput.getValue();
      const url = urlInput.getValue();

      // Basic validation
      if (!url) {
        let errorBox = createErrorBox(screen, 'An URL is required   ');
        setTimeout(() => {
          errorBox.destroy();
          screen.render();
        }, 2500);
        return;
      }

      // Show loading indicator
      const loadingBox = blessed.box({
        parent: screen,
        top: 'center',
        left: 'center',
        width: 30,
        height: 3,
        border: {
          type: 'line'
        },
        content: 'Validating RSS feed...',
        tags: true,
        align: 'center',
        valign: 'middle',
      });
      centerElement(loadingBox, screen);
      screen.render();

      try {
        // Validate the feed URL
        let feedData: RssFeed;
        try {
          feedData= await validateRssFeed(url);
          if (title && title !== feedData.title) {
            feedData.title = title;
          }
        } catch (error) {
          let errorBox: blessed.Widgets.BoxElement;
          if(error instanceof RssFeedNotFoundError) {
            errorBox = createErrorBox(screen, `Die URL konnte nicht gefunden werden.  `);
          } else if (error instanceof RssFeedInvalidError) {
            errorBox = createErrorBox(screen, `Die URL ist kein gültiger RSS Feed.  `);
          } else {
            errorBox = createErrorBox(screen, `Error validating feed: ${error}   `);
          }
          setTimeout(() => {
            errorBox.destroy();
            screen.render();
          }, 2500);
          return;
        } finally {
          loadingBox.destroy();
        }

        // Save to database
        let savedFeed: RssFeed | undefined;
        try {
          savedFeed = await db.rssFeeds.save(feedData);
        } catch (error) {
          let errorBox: blessed.Widgets.BoxElement;
          if (error instanceof EntityCreateError) {
            errorBox = createErrorBox(screen, `Dieser RSS Feed existiert bereits.  `);
          }
          setTimeout(() => {
            errorBox.destroy();
            screen.render();
          }, 2500);
          return;
        }

        // Update the feed list
        if (isAdd && savedFeed) {
          feeds.push(savedFeed);
          state.currentIndex = feeds.length - 1;
        } else if (!isAdd && savedFeed) {
          const index = feeds.findIndex(f => f.id === feed?.id);
          if (index !== -1) {
            feeds[index] = savedFeed;
          }
        }

        popupBox.destroy();
        editFeedHelpBox.destroy();
        let notificationBox = createNotificationBox(screen, `RSS feed ${isAdd ? 'added' : 'updated'} successfully   `);
        setTimeout(() => {
          notificationBox.destroy();
          screen.render();
        }, 2500);
        renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
        feedListBox.focus();

      } catch (error) {
        let errorBox = createErrorBox(screen, `Error ${isAdd ? 'adding' : 'updating'} feed: ${error}   `);
        setTimeout(() => {
          errorBox.destroy();
          screen.render();
        }, 2500);
      } finally {
        loadingBox.destroy();
      }
    });
  });
}
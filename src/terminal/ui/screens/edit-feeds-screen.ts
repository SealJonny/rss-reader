import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';
import { centerElement, createConfirmBox, createErrorBox, createNotificationBox } from '../utils/ui-utils';
import { RssFeed } from '../../../interfaces/rss-feed';
import db from '../../../database/database';
import { createHelpBox } from '../components/help-box';
import { validateRssFeed } from '../../../rss/validater';
import { RssFeedInvalidError, RssFeedNotFoundError } from '../../../errors/rss-feed';

// Type for tracking expanded state of feeds
interface FeedListState {
  currentIndex: number;
}

/**
 * Shows a screen for editing RSS feed URLs
 */
export async function showEditFeedsScreen(screen: blessed.Widgets.Screen): Promise<void> {
  // Container for the feed list (40% of the screen)
  const feedListBox = blessed.box({
    top: 0,
    left: 0,
    width: '40%',
    height: '100%-2', // Leave space for help text
    padding: 1,
    scrollable: true,
    tags: true,
    content: 'Loading RSS feeds...',
  });

  // Vertical separator line
  const separator = blessed.line({
    parent: screen,
    orientation: 'vertical',
    top: 0,
    left: '40%',
    height: '100%-2',
    style: {
      fg: colors.accent,
    },
    hidden: true, // Initially hidden
  });

  // Container for feed details (60% of the screen)
  const detailsBox = blessed.box({
    top: 0,
    left: '40%+1',
    width: '60%-1',
    height: '100%-2',
    padding: 1,
    scrollable: true,
    tags: true,
    content: '',
    hidden: true, // Initially hidden
  });

  screen.append(feedListBox);
  screen.append(detailsBox);
  feedListBox.focus();

  // Add help box
  const helpBox = createHelpBox(screen, "edit-feeds");

  screen.render();

  // State for tracking selection
  const state: FeedListState = {
    currentIndex: 0,
  };

  let feeds: RssFeed[] = [];
  try {
    feeds = await db.rssFeeds.all();
    renderFeedList(feedListBox, feeds, state, detailsBox, separator);
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
    renderFeedList(feedListBox, feeds, state, detailsBox, separator);
  });

  feedListBox.key(['down', 'j'], () => {
    if (feeds.length === 0) return;

    if (state.currentIndex === feeds.length - 1) {
      state.currentIndex = 0; // Wrap to the top
    } else {
      state.currentIndex = Math.min(feeds.length - 1, state.currentIndex + 1);
    }
    renderFeedList(feedListBox, feeds, state, detailsBox, separator);
  });

  // Toggle expanded state
  feedListBox.key(['enter', 'right', 'space'], () => {
    if (feeds.length === 0) return;

    // Mit Enter wird nichts mehr aufgeklappt, stattdessen werden die Details bereits angezeigt
    feedListBox.focus();
    renderFeedList(feedListBox, feeds, state, detailsBox, separator);
  });

  // Add new feed (a)
  feedListBox.key(['a'], async () => {
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
      const notification = createNotificationBox(
        screen,
        `Are you sure you want to delete "${selectedFeed.title}"? [y/n]   `
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
              createNotificationBox(screen, `Feed "${selectedFeed.title}" deleted   `);
              renderFeedList(feedListBox, feeds, state, detailsBox, separator);
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
      screen.render();
      resolve();
    });
  });
}

/**
 * Renders the feed list with current selection
 */
function renderFeedList(
  feedListBox: blessed.Widgets.BoxElement,
  feeds: RssFeed[],
  state: FeedListState,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): void {
  if (feeds.length === 0) {
    feedListBox.setContent('No RSS feeds available. Press "a" to add a new feed.');

    // Hide details and separator when no feeds
    if (detailsBox) detailsBox.hide();
    if (separator) separator.hide();
    feedListBox.screen?.render();
    return;
  }

  let content = '';

  content += `{bold}{${colors.secondary}-fg}RSS Feeds{/${colors.secondary}-fg}{/bold}\n\n\n`;

  feeds.forEach((feed, index) => {
    const isSelected = index === state.currentIndex;

    // Feed name with selection indicator
    content += `${isSelected ? '{bold}❯{/bold} ' : '  '}`;
    content += `{${isSelected ? colors.primary : 'white'}-fg}${feed.title}{/${isSelected ? colors.primary : 'white'}-fg}`;
    content += '\n';
  });

  feedListBox.setContent(content);

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

  feedListBox.screen?.render();
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
  content += `{bold}URL:{/bold} ${feed.link}\n\n`;
  content += `{bold}Description:{/bold} ${feed.description}\n\n`;

  if (feed.language) {
    content += `{bold}Language:{/bold} ${feed.language}\n\n`;
  }

  if (feed.lastBuildDate) {
    content += `{bold}Last Build Date:{/bold} ${feed.lastBuildDate}\n\n`;
  }

  // Add help information at bottom
  content += `\n\n{${colors.text.muted}-fg}Press 'e' to edit this feed or 'd' to delete it.{/${colors.text.muted}-fg}`;

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
  feedListBox: blessed.Widgets.BoxElement,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): Promise<void> {
  const isAdd = feed === undefined;

  // Create the popup box
  const popupBox = blessed.box({
    top: 'center',
    left: 'center',
    width: 60,
    height: 12,
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
    content: 'Name(Optional):',
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
    top: 6,
    left: 2,
    style: {
      fg: colors.accent,
    },
    content: 'URL:',
  });

  const urlInput = blessed.textbox({
    parent: popupBox,
    top: 5,
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
    bottom: 0,
    left: 2,
    content: '{gray-fg}Esc: Escape Input Box or switch fields{/gray-fg}',
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
      urlInput.setValue(feed?.link || '');
      urlInput.focus();
    } else {
      activeInput = nameInput;
      nameInput.setValue(feed?.title || '');
      nameInput.focus();
    }

    screen.render();
  }
  // Set up focus handlers for help text
  [nameInput, urlInput].forEach(input => {
    input.on('focus', () => {
      helpText.setContent('{gray-fg}Esc: Escape Input Box or switch fields{/gray-fg}');
      screen.render();
    });
    input.key('tab', function() {
      popupBox.focus();
      focusNext();
    });
  });

  // Set up key handlers for inputs
  [popupBox].forEach(input => {
    input.on('focus', () => {
      helpText.setContent('{gray-fg}Tab: Switch fields, Enter: Save, Esc: Cancel{/gray-fg}');
      screen.render();
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

    input.key(['escape'], () => {
      popupBox.destroy();
      screen.render();
      feedListBox.focus();
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
        // Create feed object
        const feedData: RssFeed = {
          id: isAdd ? undefined : feed?.id,
          title: title,
          link: url,
          description: feed?.description || "RSS Feed",
          language: feed?.language || null,
          lastBuildDate: feed?.lastBuildDate || null
        };

        // Validate the feed URL
        try {
          const feedData: RssFeed = await validateRssFeed(url);
          if (title && title !== feedData.title) {
            feedData.title = title;
          }
        } catch (error) {
          loadingBox.destroy();
          let errorBox: blessed.Widgets.BoxElement;
          if(error instanceof RssFeedNotFoundError) {
            errorBox = createErrorBox(screen, `Die URL konnte nicht gefunden werden.  `);
          } else if (error instanceof RssFeedInvalidError) {
            errorBox = createErrorBox(screen, `Die URL ist kein gültiger RSS Feed.  `);
          }
          else {
            errorBox = createErrorBox(screen, `Error validating feed: ${error}   `);
          }
          setTimeout(() => {
            errorBox.destroy();
            screen.render();
          }, 2500);
          return;
        }

        // Save to database
        const savedFeed = await db.rssFeeds.save(feedData);

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

        loadingBox.destroy();
        popupBox.destroy();
        let notificationBox = createNotificationBox(screen, `RSS feed ${isAdd ? 'added' : 'updated'} successfully   `);
        setTimeout(() => {
          notificationBox.destroy();
          screen.render();
        }, 2500);
        renderFeedList(feedListBox, feeds, state, detailsBox, separator);
        feedListBox.focus();

      } catch (error) {
        loadingBox.destroy();
        let errorBox = createErrorBox(screen, `Error ${isAdd ? 'adding' : 'updating'} feed: ${error}   `);
        setTimeout(() => {
          errorBox.destroy();
          screen.render();
        }, 2500);
      }
    });
  });
}
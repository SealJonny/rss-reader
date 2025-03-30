import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';
import { createNotificationBox } from '../utils/ui-utils';
import { RssFeed } from '../../../interfaces/rss-feed';
import db from '../../../database/database';
import helpBox from '../components/help-box';
import { validateRssFeed } from '../../../rss/validater';
import { RssFeedInvalidError, RssFeedNotFoundError } from '../../../errors/rss-feed';
import { EntityCreateError } from '../../../errors/database';
import { getScreenWidth } from '../utils/feed-utils';
import notificationBox from '../components/notification';

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
      message: "Fehler beim Laden der RSS Feeds.  ",
      durationInMs: 2500,
      isError: true
    });
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
    helpBox.setView("edit-feeds-list");
  });

  // Add new feed through ChatGPT (c)
  // Todo: Implement this feature
  feedListBox.key(['c'], async () => {
    await showFeedEditPopup(screen, undefined, feeds, state, feedListBox, detailsBox, separator);
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
      const cuttedTitle = selectedFeed.title.length > 20 ? `${selectedFeed.title.substring(0, 20)}...` : selectedFeed.title
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
          resolve();
        });
      });
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
  helpBox.resetView();
  helpBox.setView("edit-popup");

  const isAdd = feed === undefined;

  // Create a form
  const form = blessed.form<{name: string; url: string}>({
    parent: screen,
    keys: false,
    left: 'center',
    top: 'center',
    width: '50%+5',
    height: 13,
    padding: 1,
    border: 'line',
    style: {
      label: {
        fg: colors.primary
      },
      bg: colors.background,
      fg: colors.text.normal,
      border: {
        fg: colors.secondary
      }
    },
    label: feed ? "Rss Feed Bearbeiten" : "Rss Feed Hinzufügen"
  });

  // Create a label for the name input
  blessed.text({
    parent: form,
    top: 0,
    left: 2,
    style: {
      fg: colors.accent
    },
    content: 'Name:'
  });

  // Create the name input field
  const nameInput = blessed.textbox({
    parent: form,
    name: 'name',
    keys: false,
    top: 1,
    left: 2,
    width: '90%',
    height: 3,
    border: 'line',
    style: {
      focus: {
        border: {
          fg: colors.primary
        }
      }
    },
    inputOnFocus: true
  });
  if (feed) {
    nameInput.setValue(feed.title);
  }

  // Create a label for the description input
  blessed.text({
    parent: form,
    top: 5,
    left: 2,
    content: 'URL:',
    style: {
      fg: colors.accent
    }
  });

  // Create the url textbox
  const urlInput = blessed.textbox({
    parent: form,
    name: 'url',
    keys: true,
    top: 6,
    left: 2,
    width: '90%',
    height: 3,
    border: 'line',
    style: {
      focus: {
        border: {
          fg: colors.primary
        }
      }
    },
    inputOnFocus: true
  });
  if (feed) {
    urlInput.setValue(feed.link);
  }

  form.key(['enter'], () => form.submit());
  form.key(['escape', 'q'], () => form.reset());

  form.key(['tab'], () => {
    form.focusNext();
    screen.render();
  });

  nameInput.key(['tab'], () => {
    form.focusNext();
    screen.render();
  });

  urlInput.key(['tab'], () => {
    form.focusNext();
    screen.render();
  });

  nameInput.key(['escape'], () => form.focus());
  urlInput.key(['escape'], () => form.focus());

  // Focus on the form
  nameInput.focus();

  // Render screen
  screen.render();


  await new Promise<void>(resolve => {
    // On form submission
    form.on('submit', async (data) => {
      if (data.url.length === 0) {
        notificationBox.addNotifcation({message: 'Die URL darf nicht leer sein', durationInMs: 2500, isError: true, highPriority: true});
        return;
      }

      let validFeed: RssFeed;
      try {
        validFeed = await validateRssFeed(data.url);
        if (data.name.length > 0) {
          validFeed.title = data.name;
        }
        if (feed) {
          validFeed.id = feed.id;
        }

      } catch (error) {
          if(error instanceof RssFeedNotFoundError) {
            notificationBox.addNotifcation({message: "Die URL konnte nicht gefunden werden.  ", durationInMs: 3000, isError: true});
          } else if (error instanceof RssFeedInvalidError) {
            notificationBox.addNotifcation({message: "Die URL ist kein gültiger RSS Feed.  ", durationInMs: 3000, isError: true});
          } else {
            notificationBox.addNotifcation({message: "Fehler beim Validieren.   ", durationInMs: 3000, isError: true});
          }
          return;
      }

      let savedFeed: RssFeed | undefined;
      try {
        savedFeed = await db.rssFeeds.save(validFeed);
      } catch (error) {
        if (error instanceof EntityCreateError) {
          notificationBox.addNotifcation({message: `Dieser Rss Feed existiert bereits.  `, durationInMs: 2500, isError: true,});
        }
        return;
      }

      if (isAdd && savedFeed) {
        feeds.push(savedFeed);
        state.currentIndex = feeds.length - 1;
      } else if (!isAdd && savedFeed) {
        const index = feeds.findIndex(f => f.id === feed?.id);
        if (index !== -1) {
          feeds[index] = savedFeed;
        }
      }

      notificationBox.addNotifcation({message: `Rss Feed wurde erfolgreich ${isAdd ? 'hinzugefügt' : 'angepasst'}  `, durationInMs: 2500, isError: false});
      form.destroy();
      helpBox.resetView();
      renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
      feedListBox.focus();
      resolve();
    });


    // On form cancel
    form.on('reset', () => {
      form.destroy();
      helpBox.resetView();
      renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
      feedListBox.focus();
      resolve();
    });

  })
}

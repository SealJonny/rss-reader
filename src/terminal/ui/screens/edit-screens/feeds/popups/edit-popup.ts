import blessed from "more-blessed"
import { RssFeed } from "../../../../../../interfaces/rss-feed";
import { FeedListState } from "../feeds-screen";
import { colors } from "../../../../themes/default-theme";
import db from "../../../../../../database/database";
import { EntityCreateError } from "../../../../../../errors/database";
import { RssFeedNotFoundError, RssFeedInvalidError } from "../../../../../../errors/rss-feed";
import { validateRssFeed } from "../../../../../../rss/validater";
import helpBox from "../../../../components/help-box";
import notificationBox from "../../../../components/notification";
import { renderFeedList } from "../renderers";
import { syncDatabase } from "../../../../ui-handler";

/**
 * Shows a popup for adding or editing an RSS feed
 *
 * @param screen The blessed screen instance
 * @param feed Optional feed to edit; if undefined, a new feed will be created
 * @param feeds Array of all current feeds
 * @param state Current state of the feed list selection
 * @param feedListBox The list element showing all feeds
 * @param detailsBox Optional box showing feed details
 * @param separator Optional separator line between feed list and details
 * @returns Promise that resolves when the popup is closed
 */
export async function showFeedEditPopup(
  screen: blessed.Widgets.Screen,
  feed: RssFeed | undefined,
  feeds: RssFeed[],
  state: FeedListState,
  feedListBox: blessed.Widgets.ListElement,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): Promise<void> {
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

  // Create a label for the URL input
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
  form.key(['i'], () => {
    nameInput.focus()
    helpBox.resetView();
    helpBox.setView("edit-popup-insert");
  });

  form.key(['tab'], () => {
    form.focusNext();
    helpBox.resetView();
    helpBox.setView("edit-popup-insert");
  });

  nameInput.key(['tab'], () => {
    form.focusNext();
  });

  urlInput.key(['tab'], () => {
    form.focusNext();
  });


  nameInput.key(['escape'], () => {
    form.focus();
    helpBox.resetView();
    helpBox.setView("edit-popup");
  });

  urlInput.key(['escape'], () => {
    form.focus();
    helpBox.resetView();
    helpBox.setView("edit-popup");
  });

  // Focus on the form
  nameInput.focus();
  helpBox.resetView();
  helpBox.setView("edit-popup-insert");

  // Render screen
  screen.render();

  // Wait for form submission or cancel
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

      // Save the feed to database
      let savedFeed: RssFeed | undefined;
      try {
        savedFeed = await db.rssFeeds.save(validFeed);
      } catch (error) {
        if (error instanceof EntityCreateError) {
          notificationBox.addNotifcation({message: `Dieser Rss Feed existiert bereits.  `, durationInMs: 2500, isError: true,});
        }
        return;
      }

      // Update the feeds list with the new/edited feed
      if (isAdd && savedFeed) {
        feeds.push(savedFeed);
        state.currentIndex = feeds.length - 1;
      } else if (!isAdd && savedFeed) {
        const index = feeds.findIndex(f => f.id === feed?.id);
        if (index !== -1) {
          feeds[index] = savedFeed;
        }
      }

      notificationBox.addNotifcation({message: `Rss Feed wurde erfolgreich ${isAdd ? 'hinzugefügt' : 'angepasst'}  `, durationInMs: 3000, isError: false});
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
  });
}
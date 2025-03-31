import blessed from "more-blessed"
import { colors } from "../../../../themes/default-theme";
import { searchRssFeed } from "../../../../../../ai/search-rssfeed";
import db from "../../../../../../database/database";
import { AiRequestError, AiInvalidResponseError } from "../../../../../../errors/ai";
import { EntityCreateError } from "../../../../../../errors/database";
import { RssFeedNotFoundError, RssFeedInvalidError } from "../../../../../../errors/rss-feed";
import { RssFeed } from "../../../../../../interfaces/rss-feed";
import { validateRssFeed } from "../../../../../../rss/validater";
import helpBox from "../../../../components/help-box";
import notificationBox, { Notification } from "../../../../components/notification";
import { FeedListState } from "../feeds-screen";
import { renderFeedList } from "../renderers";

/**
 * Shows a search popup for finding RSS feeds using AI
 *
 * @param screen The blessed screen instance
 * @param feeds Array of existing RSS feeds
 * @param state Current state of the feed list UI
 * @param feedListBox The feed list UI element
 * @param detailsBox Optional details box element
 * @param separator Optional separator line element
 * @returns Promise that resolves when the popup is closed
 */
export async function showSearchGptScreen(
  screen: blessed.Widgets.Screen,
  feeds: RssFeed[],
  state: FeedListState,
  feedListBox: blessed.Widgets.ListElement,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): Promise<void> {

  helpBox.resetView();

  // Create form for entering search prompt
  const form = blessed.form<{prompt: string}>({
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
    label: "ChatGPT Suche"
  });

  // Create the prompt input field
  const promptInput = blessed.textarea({
    parent: form,
    name: 'prompt',
    keys: false,
    top: 'center',
    left: 'center',
    width: '95%',
    height: 11,
    inputOnFocus: true
  });

  const loading = blessed.loading({
    parent: screen,
    hidden: true,
    top: 'center',
    left: 'center',
    width: '50%',
    height: 5,
    border: 'line',
    content: "ChatGPT denkt nach..."
  });

  form.key(['enter'], () => form.submit());
  form.key(['escape', 'q'], () => form.reset());
  form.key(['i'], () => {
    promptInput.focus();
    helpBox.resetView();
    helpBox.setView("edit-popup-single-insert");
  });

  promptInput.key(['escape'], () => {
    form.focus();
    helpBox.resetView();
    helpBox.setView("edit-popup-single");
  });

  promptInput.focus();

  helpBox.resetView();
  helpBox.setView("edit-popup-single-insert");

  screen.render();

  // Create abort controller for request cancellation
  const abortController = new AbortController();

  // Track invalid links to avoid suggesting them again
  const invalidLinks: string[] = [];

  await new Promise<void>(resolve => {
    form.on('submit', async data => {
      if (data.prompt.length === 0) {
        notificationBox.addNotifcation({
          message: "Der Prompt darf nicht leer sein.  ",
          durationInMs: 3000,
          isError: true
        });
        return;
      }

      loading.load("ChatGPT denkt nach...");

      let url: string | null =  null;
      try {
        url = await searchRssFeed(data.prompt, feeds, invalidLinks, abortController.signal);
        if (url === null) {
          notificationBox.addNotifcation({
            message: "Fehler: Es konnte entweder keine Url gefunden werden oder sie existiert bereits schon.  ",
            durationInMs: 4000,
            isError: true
          });
          return;
        }

        const feed = await validateRssFeed(url);
        const savedFeed = await db.rssFeeds.save(feed);
        if (savedFeed) {
          feeds.push(savedFeed);
          state.currentIndex = feeds.length - 1;
        }

        notificationBox.addNotifcation({
          message: "RSS Feed wurde erfolgreich hinzugefügt.  ",
          durationInMs: 3000,
          isError: false
        });

        form.destroy();
        helpBox.resetView();
        renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
        feedListBox.focus();
        resolve();
      } catch (error) {
        let notification: Notification= {
          message: "",
          durationInMs: 3000,
          isError: true
        };

        // Handle various error types
        if (error instanceof AiRequestError || error instanceof AiInvalidResponseError) {
          notification.message = "Fehler: Anfrage an ChatGPT ist fehlgeschlagen.  ";
          notificationBox.addNotifcation(notification);
          return;
        }

        if (error instanceof RssFeedNotFoundError) {
          notification.message = "Fehler: Die RSS Feed URL von ChatGPT existiert nicht.  ";
          notificationBox.addNotifcation(notification)
          if (url) {
            invalidLinks.push(url);
          }
          return;
        }

        if (error instanceof RssFeedInvalidError) {
          notification.message = "Fehler: Die URL ist kein gültiger RSS Feed.  ";
          notificationBox.addNotifcation(notification);
          if (url) {
            invalidLinks.push(url);
          }
          return;
        }

        if (error instanceof EntityCreateError) {
          notification.message = "Fehler: RSS Feed existiert bereits.  "
          notificationBox.addNotifcation(notification);
          return;
        }

        notification.message = "Fehler: Etwas ist schiefgelaufen.  ";
        notificationBox.addNotifcation(notification);
        return;
      } finally {
        loading.stop();
      }
    });

    // Handle cancellation
    form.on('reset', () => {
      abortController.abort();
      form.destroy();
      helpBox.resetView();
      loading.destroy();
      renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
      feedListBox.focus();
      resolve();
    });
  });
}
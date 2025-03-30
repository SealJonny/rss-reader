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

export async function showSearchGptScreen(
  screen: blessed.Widgets.Screen,
  feeds: RssFeed[],
  state: FeedListState,
  feedListBox: blessed.Widgets.ListElement,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): Promise<void> {

  helpBox.resetView();

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

  const abortController = new AbortController();

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

      let url: string = "";
      try {
        url = await searchRssFeed(data.prompt, feeds, invalidLinks, abortController.signal);
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

        if (error instanceof AiRequestError || error instanceof AiInvalidResponseError) {
          notification.message = "Fehler: Anfrage an ChatGPT ist fehlgeschlagen.  ";
          notificationBox.addNotifcation(notification);
          return;
        }

        if (error instanceof RssFeedNotFoundError) {
          notification.message = "Fehler: Die RSS Feed URL von ChatGPT existiert nicht.  ";
          notificationBox.addNotifcation(notification)
          if (url.length > 0) {
            invalidLinks.push(url);
          }
          return;
        }

        if (error instanceof RssFeedInvalidError) {
          notification.message = "Fehler: Die URL ist kein gültiger RSS Feed.  ";
          notificationBox.addNotifcation(notification);
          if (url.length > 0) {
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
        return;
      }
    });

    form.on('reset', () => {
      abortController.abort();
      form.destroy();
      helpBox.resetView();
      renderFeedList(screen, feedListBox, feeds, state, detailsBox, separator);
      feedListBox.focus();
      resolve();
    });
  });
}
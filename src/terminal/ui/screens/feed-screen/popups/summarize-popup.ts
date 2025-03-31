import blessed, { message } from "more-blessed";
import { NewsItem } from "../../../../../interfaces/news-item";
import { colors } from "../../../themes/default-theme";
import helpBox from "../../../components/help-box";
import { fetchWebpage } from "../../../../../rss/fetcher";
import { summarizeText } from "../../../../../ai/summarize-text";
import notificationBox, { Notification } from "../../../components/notification";
import { formatTerminalText } from "../../../utils/feed-utils";

export async function showSummarizePopup(news: NewsItem, feedBox: blessed.Widgets.BoxElement, screen: blessed.Widgets.Screen) {
  const parentBox = blessed.box({
    parent: screen,
    left: 'center',
    top: 'center',
    keys: false,
    width: '80%',
    height: '70%'
  });

  const popup = blessed.box({
    parent: parentBox,
    left: 2,
    top: 1,
    width: '100%-1',
    height: '100%-1',
    padding: 1,
    keys: false,
    border: 'line',
    scrollable: true,
    alwaysScroll: true,
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
    label: "Zusammenfassung"
  });

  const loading = blessed.loading({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '50%',
    height: 5,
    border: 'line',
    content: "ChatGPT denkt nach..."
  });

  screen.render();

  // Focus on the form
  popup.focus();

  feedBox.show();
  helpBox.resetView();

  popup.key(['down', 'j'], () => {
    popup.scroll(1);
    screen.render();
  });

  popup.key(['up', 'k'], () => {
    popup.scroll(-1);
    screen.render();
  });

  // Render screen
  screen.render();

  let abortController = new AbortController();

  loading.load("ChatGPT denkt nach...");
  fetchWebpage(news).then(async text => {
    if (text) {
      try {
        const summarized = await summarizeText(text, abortController.signal);
        const formatedText = formatTerminalText("", summarized, Number(popup.width) - 2);
        popup.setContent(formatedText);
      } catch (error) {
        if (!abortController.signal.aborted) {
          notificationBox.addNotifcation({
            message: "Fehler: Die Anfrage an ChatGPT ist fehlgeschlagen  ",
            durationInMs: 3000,
            isError: true
          });
        }

      } finally{
        loading.stop();
        loading.destroy();
        helpBox.setView("summarize-popup");
        screen.render();
      }
      return;
    }
    notificationBox.addNotifcation({
      message: "Fehler: Es ist nicht möglich diese Seite zu laden (Kann Aufgrund von Datenschutzrichtlinien auftreten) ",
      durationInMs: 3500,
      isError: true,
      highPriority: true
    });
  }).catch(error => {
    notificationBox.addNotifcation({
      message: "Fehler: Während des Ladens dieser Seite ist etwas schiefgelaufen  ",
      durationInMs: 3000,
      isError: true
    });
  })

  await new Promise<void>(resolve => {
    popup.key(['escape', 'q'], () => {
      abortController.abort();
      popup.hide();
      parentBox.hide();
      popup.destroy();
      parentBox.destroy();
      helpBox.resetView();
      resolve();
    });
  })
}
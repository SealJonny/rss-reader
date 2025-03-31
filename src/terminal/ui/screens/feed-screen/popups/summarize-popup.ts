import blessed from "more-blessed";
import { NewsItem } from "../../../../../interfaces/news-item";
import { colors } from "../../../themes/default-theme";
import helpBox from "../../../components/help-box";

/**
 * Shows a popup with a summarized version of a news article
 *
 * @param news The news item to summarize
 * @param screen The blessed screen instance
 * @returns Promise that resolves when the popup is closed
 */
export async function showSummarizePopup(news: NewsItem, screen: blessed.Widgets.Screen) {
  // Create popup box for the summary
  const popup = blessed.box({
    parent: screen,
    left: 'center',
    top: 'center',
    width: '80%+5',
    height: '70%',
    padding: 1,
    border: 'line',
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
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
    label: "Zusammenfassung",
    content: "Hier steht dein mehrzeiliger Text...\nZeile 2...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter...\nZeile 3...\nund so weiter..."
  });

  screen.append(popup);
  // Focus on the form
  popup.focus();
  helpBox.resetView();
  helpBox.setView("edit-popup-insert");

  // Render screen
  screen.render();

  await new Promise<void>(resolve => {
    popup.key(['escape', 'q'], () => {
      popup.destroy();
      helpBox.resetView();
      screen.render();
      resolve();
    });
  })
}
import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';

type View = "main-screen" | "rss-feed" | "nested-list" | "edit-feeds-list" | "edit-categories-list" | "edit-popup";

/**
 * Erstellt eine Help-Box, die Benutzerhinweise anzeigt
 * @param screen Der blessed Screen
 * @param view Die aktuelle Ansicht, die bestimmt welche Hilfetext angezeigt wird
 * @returns Die erstellte Help-Box
 */
export function createHelpBox(screen: blessed.Widgets.Screen, view: View) {
  // Eine Box in der rechten unteren Ecke
  const helpBox = blessed.box({
    bottom: 0,
    right: 0,
    width: 'shrink',
    height: 'shrink',
    align: 'right',
    valign: 'middle',
    style: {
      bg: colors.background,
      fg: colors.text.muted,
    },

    focusable: false,
    clickable: false,
    keyable: false,
    keys: false,
  });

  switch (view) {
    case "rss-feed":
      helpBox.setContent('                                                         [enter] Auswählen  [↑/↓] Navigieren  [ctrl+c] Verlassen');
      break;
    case "main-screen":
      helpBox.setContent('                                                         [enter] Auswählen  [↑/↓] Navigieren  [ctrl+c] Verlassen');
      break;
    case "nested-list":
      helpBox.setContent('                                                     [enter] Auswählen  [↑/↓] Navigieren  [q | backspace] Zurück');
      break;
    case "edit-feeds-list":
      helpBox.setContent('[a] Hinzufügen  [c] ChatGPT Suche  [e] Bearbeiten  [d] Löschen  [↑/↓] Navigieren  [q] Zurück');
      break;
    case "edit-categories-list":
      helpBox.setContent('                    [a] Hinzufügen [e] Bearbeiten  [d] Löschen  [↑/↓] Navigieren  [q] Zurück');
      break;
    case "edit-popup":
      helpBox.setContent('                                                   [Tab/↑/↓] Felder wechseln  [enter] Speichern  [esc] Abbrechen');
      break;
    default:
      break;
  }

  // Dem Screen anhängen
  screen.append(helpBox);
  screen.render();

  return helpBox;
}

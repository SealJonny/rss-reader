import blessed from 'blessed';
import { colors } from '../themes/default-theme';

type View = "main-screen" | "rss-feed" | "nested-list";

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
      fg: colors.text.normal,
    },

    focusable: false,
    clickable: false,
    keyable: false,
    keys: false,
  });

  if (view === "rss-feed") {
    helpBox.setContent('Favorize (f), Next (down), Previous (up), Back to main-screen (q)');
  } else if (view === "main-screen") {
    helpBox.setContent('                Select (enter), (Up), (Down) Exit (ctrl + c; esc)');
  } else if (view === "nested-list") {
    helpBox.setContent('                 Select (enter), Back to main List (q, backspace)');
  }

  // Dem Screen anhängen
  screen.append(helpBox);
  screen.render();

  return helpBox;
}
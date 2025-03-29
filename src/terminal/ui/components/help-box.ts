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


export class HelpBox {
  private box: blessed.Widgets.BoxElement | null = null;

  public initialize(screen: blessed.Widgets.Screen) {
    this.box = blessed.box({
      parent: screen,
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
  }

  public setView(view: View) {
    if (this.box === null) return;

    switch (view) {
      case "rss-feed":
        this.box.setContent('[o] Link Öffnen [f] Favorisieren  [↑/↓] Navigieren  [q] Zurück');
        break;
      case "main-screen":
        this.box.setContent('[enter] Auswählen  [↑/↓] Navigieren  [ctrl+c] Verlassen');
        break;
      case "nested-list":
        this.box.setContent('[enter] Auswählen  [↑/↓] Navigieren  [q | backspace] Zurück');
        break;
      case "edit-feeds-list":
        this.box.setContent('[a] Hinzufügen  [c] ChatGPT Suche  [e] Bearbeiten  [d] Löschen  [↑/↓] Navigieren  [q] Zurück');
        break;
      case "edit-categories-list":
        this.box.setContent('[a] Hinzufügen [e] Bearbeiten  [d] Löschen  [↑/↓] Navigieren  [q] Zurück');
        break;
      case "edit-popup":
        this.box.setContent('[Tab/↑/↓] Felder wechseln  [enter] Speichern  [esc] Abbrechen');
        break;
      default:
        break;
    }
    this.box.show();
    this.box.screen.render();
  }

  public resetView() {
    if (this.box === null) return;
    this.box.hide();
    this.box.setContent('');
    this.box.screen.render();
  }
}

const helpBox = new HelpBox();
export default helpBox;


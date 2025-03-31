import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';

type View = "main-screen" | "rss-feed" | "nested-list" | "edit-feeds-list" | "edit-categories-list" | "edit-popup" | "edit-popup-insert" | "edit-popup-single" | "edit-popup-single-insert" | "summarize-popup";

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
        this.box.setContent('[o] Link Öffnen [f] Favorisieren [s] Zusammenfassen [↑/↓] Navigieren  [q] Zurück');
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
        this.box.setContent('[Tab] Felder wechseln [i] Einfügen [enter] Speichern  [esc | q] Abbrechen');
        break;
      case "edit-popup-insert":
        this.box.setContent('[Tab] Felder wechseln  [esc] Einfügen verlassen');
        break;
      case "edit-popup-single":
        this.box.setContent('[i] Einfügen [enter] Speichern  [esc | q] Abbrechen');
        break;
      case "edit-popup-single-insert":
        this.box.setContent('[esc] Einfügen verlassen');
        break;
      case "summarize-popup":
        this.box.setContent('[esc | q] Verlassen');
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


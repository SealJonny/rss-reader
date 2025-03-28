import blessed from 'more-blessed';
import { createHelpBox } from '../components/help-box';
import { colors, formatHeading } from '../themes/default-theme';
import { createSelectableList, ListItem } from '../components/selectable-list';
import { colorText, hexToRgb } from '../utils/animation-utils';
import { Categories } from '../../../database/tables/categories';
import { Category, SystemCategory } from '../../../interfaces/category';
import { getScreenHeight } from '../utils/feed-utils';
import insertJob from '../../../database/jobs/insert-job';
import categoriseJob from '../../../database/jobs/categorise-job';

/**
 * Hauptmenü-Auswahl
 */
export enum MainMenuSelection {
  GENERAL_FEED = -1,
  CATEGORY_LIST = -2,
  FAVORITE_FEED = -3,
  EDIT_URLS = -4,
  EDIT_CATEGORIES = -5,
  START_ANIMATION = -6,
  SYNC = -7
}

/**
 * Zeigt den Hauptbildschirm und gibt die Benutzerauswahl zurück
 */
export async function showMainScreen(screen: blessed.Widgets.Screen, categories: Category[]): Promise<number> {
  return new Promise<number>((resolve) => {
    // Erstelle eine Box für den Hauptbildschirm
    const mainScreenBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%-2',
    });

    screen.append(mainScreenBox);

    // Titel
    const titleBox = blessed.box({
      parent: mainScreenBox,
      top: 0,
      left: 0,
      width: 'shrink',
      height: 3,
      border: 'line',
      tags: true,
      style: {
        border: {
          fg: colors.secondary
        }
      },
      padding: {
        left: 1,
        right: 1,
      },
    });

    titleBox.setContent(`${colorText("✻", hexToRgb(colors.secondary))}  Willkommen in dem RSS Feed Reader!`);

    // Untertitel
    const subtitleBox = blessed.box({
      parent: mainScreenBox,
      top: 4,
      left: 0,
      width: 'shrink',
      height: 1,
      padding: { left: 1, right: 1 },
    });
    subtitleBox.setContent('Du bist im Hauptmenü: ');

    const subSubtitleBox = blessed.box({
      parent: mainScreenBox,
      top: 5,
      left: 0,
      width: 'shrink',
      height: 1,
      padding: { left: 1, right: 1 },
      style: { fg: colors.text.muted },
    });
    subSubtitleBox.setContent('Nutze die Hotkeys oder die Pfeiltasten um zu navigieren.');

    // Trennlinie
    const topLine = blessed.line({
      parent: mainScreenBox,
      orientation: 'horizontal',
      top: 7,
      left: 0,
      width: '100%',
      style: {
        fg: colors.accent
      }
    });

    // Menü-Items definieren
    const items: ListItem[] = [
      { text: 'Feeds', isHeading: true },
      { text: 'Allgemein (1)', key: MainMenuSelection.GENERAL_FEED },
      { text: 'Kategorien (2)', key: MainMenuSelection.CATEGORY_LIST},
      { text: 'Favoriten (3)', key: MainMenuSelection.FAVORITE_FEED },

      { text: '', isHeading: true },

      { text: 'Verwaltung', isHeading: true },
      { text: 'Rss-Feeds (4)', key: MainMenuSelection.EDIT_URLS },
      { text: 'Kategorien (5)', key: MainMenuSelection.EDIT_CATEGORIES },

      { text: '', isHeading: true },

      { text: 'Werkzeuge', isHeading: true },
      { text: 'Synchronisieren (6)', key: MainMenuSelection.SYNC},
    ];

    // Erstelle die Liste
    const list = createSelectableList(screen, mainScreenBox, items, {
      top: 9,
      left: 0,
      height: items.length,
      padding: { left: 1, right: 1 }
    });

    list.focus();

    // Tastatur-Shortcuts einrichten
    list.key(['1'], () => {
      resolve(MainMenuSelection.GENERAL_FEED);
      cleanup();
    });

    // Funktion zum Anzeigen des Kategorien-Untermenüs
    function showCategoryMenu() {
      const helpBox = createHelpBox(screen, "nested-list");

      // Kategorien-Items definieren
      const categoryItems: ListItem[] = [
        { text: 'Kategorisierte Feeds', isHeading: true }
      ];
      if (categories.length === 0) {
        categoryItems.push({text: "Keine Kategorien angelegt"});
      } else {
        categoryItems.push(...categories.map((c) =>  { return { text: c.name , key: c.id! } as ListItem }));
      }

      // Erstelle das Untermenü mit der richtigen Höhe und Breite
      const categoryList = createSelectableList(screen, mainScreenBox, categoryItems, {
        top: 21,
        left: 0,
        width: 'shrink',
        height: Math.min(categoryItems.length + 2, getScreenHeight(screen) - 22),
        border: true,
        padding: { left: 1, right: 1 }
      });

      // Stellen Sie sicher, dass die Kategorienliste im Fokus ist
      categoryList.focus();
      screen.render();

      // Tastatur-Handler für das Untermenü
      categoryList.key(['backspace', 'q'], () => {
        helpBox.destroy();
        categoryList.destroy();
        screen.render();
        list.focus();
      });

      // Enter-Taste für das Untermenü
      categoryList.key('enter', () => {
        const selectedIndex = (categoryList as any).selected as number;
        const selectedItem = categoryItems[selectedIndex];

        if (selectedItem && !selectedItem.isHeading) {
          resolve(selectedItem.key as number);
          cleanup();
          helpBox.destroy();
          categoryList.destroy();
        }
      });
    }

    // Zeige das Kategorien-Untermenü bei Taste "2"
    list.key(['2'], () => {
      showCategoryMenu();
    });

    list.key(['3'], () => {
      resolve(MainMenuSelection.FAVORITE_FEED);
      cleanup();
    });

    list.key(['4'], () => {
      resolve(MainMenuSelection.EDIT_URLS);
      cleanup();
    });

    list.key(['6'], () => {
      resolve(MainMenuSelection.SYNC);
      if (categoriseJob.isActive()) {
        setTimeout(cleanup, 3000);
      } else {
        cleanup();
      }
    });

    // Enter-Taste für die Hauptliste
    list.key('enter', () => {
      const selectedIndex = (list as any).selected as number;
      const selectedItem = items[selectedIndex];

      if (selectedItem && !selectedItem.isHeading && selectedItem.key !== undefined) {
        // FIXED: Wenn "Show Category Feed" ausgewählt ist, öffne das Untermenü
        if (selectedItem.key === MainMenuSelection.CATEGORY_LIST) {
          showCategoryMenu();
        } else {
          resolve(selectedItem.key as number);
          if (selectedItem.key === MainMenuSelection.SYNC && categoriseJob.isActive()) {
              setTimeout(cleanup, 3000);
          } else {
            cleanup();
          }
        }
      }
    });

    // Aufräumfunktion
    function cleanup() {
      mainScreenBox.destroy();
      screen.render();
    }
  });
}

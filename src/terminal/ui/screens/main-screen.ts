import blessed from 'more-blessed';
import { createHelpBox } from '../components/help-box';
import { colors, formatHeading } from '../themes/default-theme';
import { createSelectableList, ListItem } from '../components/selectable-list';
import { colorText, hexToRgb } from '../utils/animation-utils';
import { Categories } from '../../../database/tables/categories';
import { Category, SystemCategory } from '../../../interfaces/category';
import { getScreenHeight } from '../utils/feed-utils';

/**
 * Hauptmenü-Auswahl
 */
export enum MainMenuSelection {
  GENERAL_FEED = -1,
  CATEGORY_LIST = -2,
  FAVORITE_FEED = -3,
  EDIT_URLS = -4,
  EDIT_CATEGORIES = -5,
  START_ANIMATION = -6
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

    titleBox.setContent(`${colorText("✻", hexToRgb(colors.secondary))}  Welcome to the RSS Feed Reader!`);

    // Untertitel
    const subtitleBox = blessed.box({
      parent: mainScreenBox,
      top: 4,
      left: 0,
      width: 'shrink',
      height: 1,
      padding: { left: 1, right: 1 },
    });
    subtitleBox.setContent('This is the Main Menu: ');

    const subSubtitleBox = blessed.box({
      parent: mainScreenBox,
      top: 5,
      left: 0,
      width: 'shrink',
      height: 1,
      padding: { left: 1, right: 1 },
      style: { fg: colors.text.muted },
    });
    subSubtitleBox.setContent('You can choose by either using the hotkeys or the list.');

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
      { text: 'Show General Feed (1)', key: MainMenuSelection.GENERAL_FEED },
      { text: 'Show Category Feed (2)', key: MainMenuSelection.CATEGORY_LIST},
      { text: 'Show Favorite Feed (3)', key: MainMenuSelection.FAVORITE_FEED },

      { text: 'Settings', isHeading: true },
      { text: 'Edit Feed URLs (4)', key: MainMenuSelection.EDIT_URLS },
      { text: 'Edit Categories (5)', key: MainMenuSelection.EDIT_CATEGORIES },

      { text: 'Misc', isHeading: true },
      { text: 'Show Start Animation (6)', key: MainMenuSelection.START_ANIMATION },
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
        { text: 'Categorized Feeds', isHeading: true }
      ];
      categoryItems.push(...categories.map((c) =>  { return { text: c.name , key: c.id! } as ListItem }));

      // Erstelle das Untermenü mit der richtigen Höhe und Breite
      const categoryList = createSelectableList(screen, mainScreenBox, categoryItems, {
        top: 19,
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
      resolve(MainMenuSelection.START_ANIMATION);
      cleanup();
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
          cleanup();
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
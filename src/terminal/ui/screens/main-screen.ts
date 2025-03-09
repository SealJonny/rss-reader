import blessed from 'blessed';
import { createHelpBox } from '../components/help-box';
import { colors, formatHeading } from '../themes/default-theme';
import { createSelectableList, ListItem } from '../components/selectable-list';

/**
 * Kategorien für die Untermenüs
 */
export enum FeedCategory {
  TECHNICAL = 11,
  ECONOMICAL = 12,
  POLITICAL = 13
}

/**
 * Hauptmenü-Auswahl
 */
export enum MainMenuSelection {
  ERROR = 0,
  GENERAL_FEED = 1,
  CATEGORY_FEED = 2,
  FAVORITE_FEED = 3,
  EDIT_URLS = 4,
  EDIT_FAVORITES = 5,
  START_ANIMATION = 6
}

/**
 * Zeigt den Hauptbildschirm und gibt die Benutzerauswahl zurück
 */
export async function showMainScreen(screen: blessed.Widgets.Screen): Promise<number> {
  return new Promise<number>((resolve) => {
    // Erstelle eine Box für den Hauptbildschirm
    const mainScreenBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '90%',
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

    titleBox.setContent(`✻  Welcome to the RSS Feed Reader!`);

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
      { text: 'Show Category Feed (2)', key: MainMenuSelection.CATEGORY_FEED },
      { text: 'Show Favorite Feed (3)', key: MainMenuSelection.FAVORITE_FEED },

      { text: 'Settings', isHeading: true },
      { text: 'Edit Feed URLs (4)', key: MainMenuSelection.EDIT_URLS },
      { text: 'Edit Favorites (5)', key: MainMenuSelection.EDIT_FAVORITES },

      { text: 'Misc', isHeading: true },
      { text: 'Show Start Animation (6)', key: MainMenuSelection.START_ANIMATION },
    ];

    // Erstelle die Liste
    const list = createSelectableList(screen, mainScreenBox, items, {
      top: 9,
      left: 0,
      height: items.length
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
        { text: 'Categorized Feeds', isHeading: true },
        { text: 'Technical Feed (1)', key: FeedCategory.TECHNICAL },
        { text: 'Economical Feed (2)', key: FeedCategory.ECONOMICAL },
        { text: 'Political Feed (3)', key: FeedCategory.POLITICAL },
      ];

      // Erstelle das Untermenü mit der richtigen Höhe und Breite
      const categoryList = createSelectableList(screen, mainScreenBox, categoryItems, {
        top: 19,
        left: 0,
        width: 'shrink',
        height: (categoryItems.length + 2),
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

      categoryList.key(['1'], () => {
        resolve(FeedCategory.TECHNICAL);
        cleanup();
        helpBox.destroy();
        categoryList.destroy();
      });
      
      categoryList.key(['2'], () => {
        resolve(FeedCategory.ECONOMICAL);
        cleanup();
        helpBox.destroy();
        categoryList.destroy();
      });
      
      categoryList.key(['3'], () => {
        resolve(FeedCategory.POLITICAL);
        cleanup();
        helpBox.destroy();
        categoryList.destroy();
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
        if (selectedItem.key === MainMenuSelection.CATEGORY_FEED) {
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
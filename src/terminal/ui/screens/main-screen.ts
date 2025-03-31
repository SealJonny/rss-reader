import blessed from 'more-blessed';
import helpBox from '../components/help-box';
import { colors } from '../themes/default-theme';
import { createSelectableList, ListItem } from '../components/selectable-list';
import { colorText, hexToRgb } from '../utils/animation-utils';
import { Category } from '../../../interfaces/category';
import { getScreenHeight } from '../utils/feed-utils';
import categoriseJob from '../../../database/jobs/categorise-job';

/**
 * Main menu navigation options enum
 * Used for identifying which menu option was selected
 */
export enum MainMenuSelection {
  GENERAL_FEED = -1,
  CATEGORY_LIST = -2,
  FAVORITE_FEED = -3,
  EDIT_URLS = -4,
  EDIT_CATEGORIES = -5,
  SYNC = -6
}

/**
 * Displays the main screen and returns the user's selection
 *
 * @param screen The blessed screen instance
 * @param categories List of available categories
 * @returns Promise resolving to the selected menu option (either a category ID or a MainMenuSelection value)
 */
export async function showMainScreen(screen: blessed.Widgets.Screen, categories: Category[]): Promise<number> {
  return new Promise<number>((resolve) => {
    // Create main screen container
    const mainScreenBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 'shrink',
    });

    screen.append(mainScreenBox);

    // Title
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

    // Subtitle
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

    // Divider line
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

    // Define menu items
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

    // Create the list
    const list = createSelectableList(screen, mainScreenBox, items, {
      top: 9,
      left: 0,
      height: items.length,
      padding: { left: 1, right: 1 }
    });

    list.focus();

    // Setup keyboard shortcuts
    list.key(['1'], () => {
      resolve(MainMenuSelection.GENERAL_FEED);
      cleanup();
    });

    // Show the categories submenu when "2" is pressed
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

    list.key(['5'], () => {
      resolve(MainMenuSelection.EDIT_CATEGORIES);
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

    list.key('enter', () => {
      const selectedIndex = (list as any).selected as number;
      const selectedItem = items[selectedIndex];

      if (selectedItem && !selectedItem.isHeading && selectedItem.key !== undefined) {
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

    /**
     * Shows the category submenu with available categories
     */
    function showCategoryMenu() {
      // Define category items
      helpBox.resetView();
      helpBox.setView("nested-list");
      const categoryItems: ListItem[] = [
        { text: 'Categorized Feeds', isHeading: true }
      ];
      if (categories.length === 0) {
        categoryItems.push({text: "No categories created"});
      } else {
        categoryItems.push(...categories.map((c) =>  { return { text: c.name , key: c.id! } as ListItem }));
      }

      // Create submenu with appropriate height and width
      const categoryList = createSelectableList(screen, mainScreenBox, categoryItems, {
        top: 21,
        left: 0,
        width: 'shrink',
        height: Math.min(categoryItems.length + 2, getScreenHeight(screen) - 22),
        border: true,
        padding: { left: 1, right: 1 }
      });

      // Ensure category list has focus
      categoryList.focus();
      screen.render();

      categoryList.key(['backspace', 'q'], () => {
        helpBox.resetView();
        categoryList.destroy();
        helpBox.setView("main-screen");
        screen.render();
        list.focus();
      });

      categoryList.key('enter', () => {
        const selectedIndex = (categoryList as any).selected as number;
        const selectedItem = categoryItems[selectedIndex];

        if (selectedItem && !selectedItem.isHeading) {
          resolve(selectedItem.key as number);
          cleanup();
          helpBox.resetView();
          categoryList.destroy();
          screen.render();
        }
      });
    }

    /**
     * Cleanup function to remove UI elements
     */
    function cleanup() {
      mainScreenBox.destroy();
      screen.render();
    }
  });
}

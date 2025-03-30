import blessed from 'more-blessed';
import { colors } from '../../../themes/default-theme';
import db from '../../../../../database/database';
import helpBox  from '../../../components/help-box';
import { Category } from '../../../../../interfaces/category';
import notificationBox from '../../../components/notification';
import { createNotificationBox } from '../../../utils/ui-utils';
import { showEditPopup } from './popups/edit-popup';
import { renderList } from './renderers';

// Type for tracking expanded state of feeds
export type CategoryListState = {
  currentIndex: number;
}

/**
 * Shows a screen for editing RSS feed URLs
 */
export async function showEditCategoriesScreen(screen: blessed.Widgets.Screen): Promise<void> {
  // Header-Box für den Titel, der nicht scrollt
  const headerBox = blessed.box({
    top: 0,
    left: 0,
    width: '25%',
    height: 3,
    padding: {
      left: 1,
      top: 1
    },
    tags: true,
    content: `{bold}{${colors.secondary}-fg}Kategorien Liste{/${colors.secondary}-fg}{/bold}`,
  });

  // Feed-Liste beginnt jetzt unter dem Header
  const categoryListBox = blessed.list({
    top: 3,
    left: 0,
    width: '25%',
    height: '100%-5',
    padding: {
      left: 1
    },
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    scrollbar: {
      ch: ' ',
      track: {
        bg: colors.background
      },
      style: {
        inverse: true
      }
    },
    style: {
      item: {
        fg: colors.text.muted
      },
      selected: {
        fg: colors.primary,
        bold: true
      }
    }
  });

  const separator = blessed.line({
    parent: screen,
    orientation: 'vertical',
    top: 0,
    left: '25%',
    height: '100%-2',
    style: {
      fg: colors.accent,
    },
    hidden: true,
  });

  const detailsBox = blessed.box({
    top: 0,
    left: '30%+1',
    width: '70%-1',
    height: '100%-2',
    padding: 1,
    scrollable: true,
    tags: true,
    content: '',
    hidden: true,
  });

  screen.append(headerBox);
  screen.append(categoryListBox);
  screen.append(detailsBox);
  categoryListBox.focus();

  // Add help box
  helpBox.setView("edit-categories-list");

  screen.render();

  // State for tracking selection
  const state: CategoryListState = {
    currentIndex: 0,
  };

  let categories: Category[] = [];
  try {
    categories = await db.categories.all();
    renderList(screen, categoryListBox, categories, state, detailsBox, separator);
  } catch (error) {
    notificationBox.addNotifcation({message: `Fehler beim Laden der Kategorien: ${error}   `, durationInMs: 2500, isError: true});
  }

  // Key handler for the feed list
  categoryListBox.key(['up', 'k'], () => {
    if (categories.length === 0) return;

    if (state.currentIndex === 0) {
      state.currentIndex = categories.length - 1; // Wrap to the bottom
    } else {
      state.currentIndex = Math.max(0, state.currentIndex - 1);
    }
    renderList(screen, categoryListBox, categories, state, detailsBox, separator);
  });

  categoryListBox.key(['down', 'j'], () => {
    if (categories.length === 0) return;

    if (state.currentIndex === categories.length - 1) {
      state.currentIndex = 0; // Wrap to the top
    } else {
      state.currentIndex = Math.min(categories.length - 1, state.currentIndex + 1);
    }
    renderList(screen, categoryListBox, categories, state, detailsBox, separator);
  });

  // Add new feed (a)
  categoryListBox.key(['a'], async () => {
    helpBox.resetView();
    await showEditPopup(screen, undefined, categories, state, categoryListBox, detailsBox, separator);
    helpBox.setView("edit-categories-list");
  });

  // Add new feed through ChatGPT (c)
  // Todo: Implement this feature
  categoryListBox.key(['c'], async () => {
    helpBox.resetView();
    await showEditPopup(screen, undefined, categories, state, categoryListBox, detailsBox, separator);
    helpBox.setView("edit-categories-list");
  });

  // Edit feed (e)
  categoryListBox.key(['e'], async () => {
    if (categories.length === 0) return;

    const selectedCategory = categories[state.currentIndex];
    helpBox.resetView();
    await showEditPopup(screen, selectedCategory, categories, state, categoryListBox, detailsBox, separator);
    helpBox.setView("edit-categories-list");
  });

  // Delete feed (d)
  categoryListBox.key(['d'], async () => {
    if (categories.length === 0) return;

    const selectedCategory = categories[state.currentIndex];
    if (selectedCategory.id !== undefined) {
      const cuttedTitle = selectedCategory.name.length > 20 ? `${selectedCategory.name.substring(0, 20)}...` : selectedCategory.name
      notificationBox.pause();
      const notification = createNotificationBox(
        screen,
        `Bist du sicher dass du die Kategorie "${cuttedTitle}" löschen willst? [y/n]   `
      );

      // Wait for confirmation
      await new Promise<void>((resolve) => {
        screen.once('keypress', async (_, key) => {
          if (key.name === 'y' || key.name === 'Y') {
            try {
              await db.rssFeeds.delete(selectedCategory.id!);
              categories = categories.filter(f => f.id !== selectedCategory.id);

              // Update selection
              if (state.currentIndex >= categories.length) {
                state.currentIndex = Math.max(0, categories.length - 1);
              }

              notification.destroy();
              notificationBox.addNotifcation({message: `Kategorie "${selectedCategory.name}" wurde gelöscht `, durationInMs: 3000, isError: true, highPriority: true})
              renderList(screen, categoryListBox, categories, state, detailsBox, separator);
            } catch (error) {
              notification.destroy();
              notificationBox.addNotifcation({message: `Fehler: Löschen der Kategorie "${selectedCategory.name}" ist fehlgeschlagen `, durationInMs: 3000, isError: true, highPriority: true})
            }
            notification.destroy();
            screen.render();
          } else {
            notification.destroy();
            screen.render();
          }
          notificationBox.continue();
          resolve();
        });
      });
    }
  });

  // Wait for the user to press 'q' to quit
  await new Promise<void>((resolve) => {
    categoryListBox.key(['q'], () => {
      categoryListBox.destroy();
      helpBox.resetView();
      detailsBox.destroy();
      separator.destroy();
      headerBox.destroy();
      screen.render();
      resolve();
    });
  });
}
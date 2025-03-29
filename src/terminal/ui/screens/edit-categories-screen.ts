import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';
import db from '../../../database/database';
import helpBox, { createHelpBox } from '../components/help-box';
import { EntityCreateError } from '../../../errors/database';
import { getScreenWidth } from '../utils/feed-utils';
import { Category } from '../../../interfaces/category';
import notificationBox from '../components/notification';
import { createNotificationBox } from '../utils/ui-utils';

// Type for tracking expanded state of feeds
type CategoryListState = {
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
  const helpBox = createHelpBox(screen, "edit-categories-list");

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
    await showEditPopup(screen, undefined, categories, state, categoryListBox, detailsBox, separator);
  });

  // Add new feed through ChatGPT (c)
  // Todo: Implement this feature
  categoryListBox.key(['c'], async () => {
    await showEditPopup(screen, undefined, categories, state, categoryListBox, detailsBox, separator);
  });

  // Edit feed (e)
  categoryListBox.key(['e'], async () => {
    if (categories.length === 0) return;

    const selectedCategory = categories[state.currentIndex];
    await showEditPopup(screen, selectedCategory, categories, state, categoryListBox, detailsBox, separator);
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
      helpBox.destroy();
      detailsBox.destroy();
      separator.destroy();
      headerBox.destroy();
      screen.render();
      resolve();
    });
  });
}

/**
 * Renders the feed list with current selection
 */
function renderList(
  screen: blessed.Widgets.Screen,
  categoryList: blessed.Widgets.ListElement,
  categories: Category[],
  state: CategoryListState,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): void {
  if (categories.length === 0) {
    categoryList.setItems(['Keine Kategorien verfügbar.', '', 'Drücke "a" um manuell eine neue Kategorie hinzuzufügen.']);
    categoryList.select(1);

    // Hide details and separator when no feeds
    if (detailsBox) detailsBox.hide();
    if (separator) separator.hide();
    categoryList.screen?.render();
    return;
  }

  const items: string[] = [];
  const cutLenght = ((getScreenWidth(screen)*0.25)-10);

  // Add items
  categories.forEach((feed, index) => {
    let cuttedTitle = feed.name.length > cutLenght ? `${feed.name.substring(0, cutLenght)}...` : feed.name;
    items.push(cuttedTitle);
  });

  categoryList.setItems(items);

  // Set the selected item (offset by 3 for the header)
  categoryList.select(state.currentIndex);

  // Show details for currently selected feed
  if (detailsBox && separator && categories.length > 0) {
    const selectedCategory = categories[state.currentIndex];
    if (selectedCategory) {
      renderDetails(detailsBox, selectedCategory);
      detailsBox.show();
      separator.show();
    } else {
      detailsBox.hide();
      separator.hide();
    }
  }

  categoryList.screen?.render();
}

/**
 * Renders the feed details in the details box
 */
function renderDetails(
  detailsBox: blessed.Widgets.BoxElement,
  category: Category
): void {
  let content = '';

  // Show title as header
  content += `{bold}{${colors.secondary}-fg}${category.name}{/${colors.secondary}-fg}{/bold}\n\n`;

  // // Show feed details
  // content += `{bold}{${colors.primary}-fg}URL:{/${colors.primary}-fg}{/bold} \n${category.link}\n\n`;
  // content += `{bold}{${colors.primary}-fg}Description:{/${colors.primary}-fg}{/bold} \n${category.description}\n\n`;
  //
  // if (category.language) {
  //   content += `{bold}{${colors.primary}-fg}Language:{/${colors.primary}-fg}{/bold} \n${category.language}\n\n`;
  // }
  //
  // if (category.lastBuildDate) {
  //   const date = new Date(category.lastBuildDate);
  //   content += `{bold}{${colors.primary}-fg}Last Build Date:{/${colors.primary}-fg}{/bold} \n${date.toLocaleDateString()} ${date.toLocaleTimeString()}\n\n`;
  // }

  detailsBox.setContent(content);
}

/**
 * Shows a popup for adding or editing an RSS feed
 */
async function showEditPopup(
  screen: blessed.Widgets.Screen,
  category: Category | undefined,
  categories: Category[],
  state: CategoryListState,
  categoryListBox: blessed.Widgets.ListElement,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): Promise<void> {
  const isAdd = category === undefined;

  helpBox.setView("edit-popup");

  // Create the popup box
  const popupBox = blessed.box({
    top: 'center',
    left: 'center',
    width: 62,
    height: 14,
    padding: 1,
    border: {
      type: 'line'
    },
    shadow: true,
    tags: true,
    style: {
      bg: colors.background,
      fg: colors.text.normal,
      border: {
        fg: colors.secondary
      },
    }
  });

  // Title
  const titleLabel = blessed.text({
    parent: popupBox,
    top: 0,
    left: 2,
    style: {
      fg: colors.secondary,
    },
    content: `{bold}${isAdd ? 'Kategorie Hinzufügen' : 'Kategorie Bearbeiten'}{/bold}`,
    tags: true
  });

  // Name input
  const nameLabel = blessed.text({
    parent: popupBox,
    top: 3,
    left: 2,
    style: {
      fg: colors.accent,
    },
    content: 'Name:',
  });

  const nameInput = blessed.textbox({
    parent: popupBox,
    top: 2,
    left: 9,
    width: 45,
    height: 3,
    inputOnFocus: true,
    border: {
      type: 'line',
    },
    style: {
      focus: {
        border: {
          fg: colors.primary
        }
      }
    }
  });

  // URL input
  const descriptionLabel = blessed.text({
    parent: popupBox,
    top: 8,
    left: 2,
    style: {
    fg: colors.accent,
    },
    content: 'Beschreibung:',
   });

   const descriptionInput = blessed.textbox({
     parent: popupBox,
     top: 7,
     left: 9,
     width: 45,
     height: 3,
     inputOnFocus: true,
     border: {
       type: 'line',
     },
     style: {
       focus: {
         border: {
           fg: colors.primary
         }
       }
     }
   });

  // Help text
  /*
  const helpText = blessed.text({
    parent: popupBox,
    top: 5,
    right: 5,
    content: '{gray-fg}Name ist optional{/gray-fg}',
    tags: true
  });
  */

  // Set current values if editing
  if (!isAdd && category) {
    nameInput.setValue(category.name);
    //urlInput.setValue(category.);
  }

  // Add to screen
  screen.append(popupBox);
  popupBox.focus();
  nameInput.focus();
  screen.render();

  // Handle field navigation
  let activeInput = nameInput;

  function focusNext() {
    if (activeInput === nameInput) {
      activeInput = descriptionInput;
      descriptionInput.setValue(descriptionInput.getValue().replace(/\t$/, ""));
      descriptionInput.focus();
    } else {
      activeInput = nameInput;
      nameInput.setValue(nameInput.getValue().replace(/\t$/, ""));
      nameInput.focus();
    }
    screen.render();
  }

  // Set up focus handlers for help text
  [nameInput, descriptionInput].forEach(input => {
    input.key('tab', function() {
      popupBox.focus();
      focusNext();
    });

    input.key(['escape'], () => {
      helpBox.resetView();
      popupBox.destroy();
      screen.render();
      categoryListBox.focus();
    });

    // Handle arrow key navigation between fields
    input.key('down', function() {
      if (input === nameInput) {
        focusNext();
        return false;
      }
      return true;
    });

    input.key('up', function() {
      if (input === descriptionInput) {
        focusNext();
        return false;
      }
      return true;
    });

    input.key(['enter'], async () => {
      // Get values
      const name = nameInput.getValue();
      const description = descriptionInput.getValue();

      // Basic validation
      if (!name) {
        notificationBox.addNotifcation({message: 'Der Name darf nicht leer sein', durationInMs: 2500, isError: true, highPriority: true});
        return;
      }

      // Show loading indicator
      const loadingBox = blessed.box({
        parent: screen,
        top: 'center',
        left: 'center',
        width: 30,
        height: 3,
        border: {
          type: 'line'
        },
        content: 'Speichern...',
        tags: true,
        align: 'center',
        valign: 'middle',
      });
      screen.render();

      try {
        // Validate the feed URL
        let categoryData: Category = {
          name: name
        };

        // Save to database
        let savedFeed: Category | undefined;
        try {
          if (isAdd) {
            savedFeed = await db.categories.save(categoryData);
          } else {
            savedFeed = await db.categories.update(category.id!, categoryData);
          }

        } catch (error) {
          if (error instanceof EntityCreateError) {
            notificationBox.addNotifcation({message: `Diese Kategorie existiert bereits.  `, durationInMs: 2500, isError: true,});
          }
          return;
        } finally {
          loadingBox.destroy();
        }

        // Update the feed list
        if (isAdd && savedFeed) {
          categories.push(savedFeed);
          state.currentIndex = categories.length - 1;
        } else if (!isAdd && savedFeed) {
          const index = categories.findIndex(f => f.id === category?.id);
          if (index !== -1) {
            categories[index] = savedFeed;
          }
        }

        popupBox.destroy();
        notificationBox.addNotifcation({message: `Kategorie wurde erfolgreich ${isAdd ? 'hinzugefügt' : 'angepasst'}  `, durationInMs: 2500, isError: false});
        renderList(screen, categoryListBox, categories, state, detailsBox, separator);
        categoryListBox.focus();

      } catch (error) {
        notificationBox.addNotifcation({message: `Fehler: ${isAdd ? 'Hinzufügen' : 'Bearbeiten'} der Kategorie ist fehlgeschlagen   `, durationInMs: 2500, isError: true});
      } finally {
        loadingBox.destroy();
      }
    });
  });
}

import blessed from "more-blessed"
import db from "../../../../../../database/database";
import { EntityCreateError } from "../../../../../../errors/database";
import { Category } from "../../../../../../interfaces/category";
import helpBox from "../../../../components/help-box";
import notificationBox from "../../../../components/notification";
import { CategoryListState } from "../category-screen";
import { colors } from "../../../../themes/default-theme";
import { renderList } from "../renderers";

/**
 * Shows a popup for adding or editing an RSS feed
 */
export async function showEditPopup(
  screen: blessed.Widgets.Screen,
  category: Category | undefined,
  categories: Category[],
  state: CategoryListState,
  categoryListBox: blessed.Widgets.ListElement,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): Promise<void> {
  const isAdd = category === undefined;

  // Create a form
  const form = blessed.form<{name: string; description: string}>({
    parent: screen,
    keys: false,
    left: 'center',
    top: 'center',
    width: '50%+5',
    height: 15,
    padding: 1,
    border: 'line',
    style: {
      label: {
        fg: colors.primary
      },
      bg: colors.background,
      fg: colors.text.normal,
      border: {
        fg: colors.secondary
      }
    },
    label: category ? "Kategorie Bearbeiten" : "Kategorie Hinzufügen"
  });

  // Create a label for the name input
  blessed.text({
    parent: form,
    top: 0,
    left: 2,
    style: {
      fg: colors.accent
    },
    content: 'Name:'
  });

  // Create the name input field
  const nameInput = blessed.textbox({
    parent: form,
    name: 'name',
    keys: false,
    top: 1,
    left: 2,
    width: '90%',
    height: 3,
    border: 'line',
    style: {
      focus: {
        border: {
          fg: colors.primary
        }
      }
    },
    inputOnFocus: true
  });
  if (category) {
    nameInput.setValue(category.name);
  }

  // Create a label for the description input
  blessed.text({
    parent: form,
    top: 5,
    left: 2,
    content: 'Description:',
    style: {
      fg: colors.accent
    }
  });

  // Create the description textarea
  const descriptionInput = blessed.textarea({
    parent: form,
    name: 'description',
    keys: false,
    top: 6,
    left: 2,
    width: '90%',
    height: 5,
    border: 'line',
    style: {
      focus: {
        border: {
          fg: colors.primary
        }
      }
    },
    inputOnFocus: true
  });
  if (category && category.description) {
    descriptionInput.setValue(category.description);
  }

  form.key(['enter'], () => form.submit());
  form.key(['escape', 'q'], () => form.reset());
  form.key(['i'], () => {
    nameInput.focus()
    helpBox.resetView();
    helpBox.setView("edit-popup-insert");
  });

  form.key(['tab'], () => {
    form.focusNext();
    helpBox.resetView();
    helpBox.setView("edit-popup-insert");
  });

  nameInput.key(['tab'], () => {
    form.focusNext();
  });

  descriptionInput.key(['tab'], () => {
    form.focusNext();
  });

  nameInput.key(['escape'], () => {
    form.focus();
    helpBox.resetView();
    helpBox.setView("edit-popup");
  });

  descriptionInput.key(['escape'], () => {
    form.focus();
    helpBox.resetView();
    helpBox.setView("edit-popup");
  });

  // Focus on the form
  nameInput.focus();
  helpBox.resetView();
  helpBox.setView("edit-popup-insert");

  // Render screen
  screen.render();

  await new Promise<void>(resolve => {
    // On form submission
    form.on('submit', async (data) => {
      if (data.name.length === 0) {
        notificationBox.addNotifcation({message: 'Der Name darf nicht leer sein', durationInMs: 2500, isError: true, highPriority: true});
        return;
      }

      if (category) {
        category.name = data.name || category.name;
        category.description = data.description || null;
      } else {
        category = {
          name: data.name,
          description: data.description || null
        }
      }

      let savedCategory: Category | undefined;
      try {
        savedCategory = await db.categories.save(category);
      } catch (error) {
        if (error instanceof EntityCreateError) {
          notificationBox.addNotifcation({message: `Diese Kategorie existiert bereits.  `, durationInMs: 2500, isError: true,});
        }
        return;
      }

      if (isAdd && savedCategory) {
        categories.push(savedCategory);
        state.currentIndex = categories.length - 1;
      } else if (!isAdd && savedCategory) {
        const index = categories.findIndex(c => c.id === category?.id);
        if (index !== -1) {
          categories[index] = savedCategory;
        }
      }

      notificationBox.addNotifcation({message: `Kategorie wurde erfolgreich ${isAdd ? 'hinzugefügt' : 'angepasst'}  `, durationInMs: 2500, isError: false});
      form.destroy();
      helpBox.resetView();
      renderList(screen, categoryListBox, categories, state, detailsBox, separator);
      categoryListBox.focus();
      resolve();
    });


    // On form cancel
    form.on('reset', () => {
      form.destroy();
      helpBox.resetView();
      renderList(screen, categoryListBox, categories, state, detailsBox, separator);
      categoryListBox.focus();
      resolve();
    });

  })
}
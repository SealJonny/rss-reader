import blessed from "more-blessed"
import { Category } from "../../../../../interfaces/category";
import { getScreenWidth } from "../../../utils/feed-utils";
import { CategoryListState } from "./category-screen";
import { colors } from '../../../themes/default-theme';

/**
 * Renders the category list with current selection
 *
 * @param screen The blessed screen instance
 * @param categoryList The list element that displays categories
 * @param categories Array of categories to display
 * @param state Current state of the category list selection
 * @param detailsBox Optional box for displaying category details
 * @param separator Optional separator line between list and details
 */
export function renderList(
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
 * Renders the category details in the details box
 *
 * @param detailsBox The box element for displaying category details
 * @param category The category to display details for
 */
function renderDetails(
  detailsBox: blessed.Widgets.BoxElement,
  category: Category
): void {
  let content = '';

  // Show title as header
  content += `{bold}{${colors.secondary}-fg}${category.name}{/${colors.secondary}-fg}{/bold}\n\n`;

  // Show description
  content += `{bold}{${colors.primary}-fg}Beschreibung:{/${colors.primary}-fg}{/bold} \n${category.description || "Keine"}\n\n`;

  detailsBox.setContent(content);
}
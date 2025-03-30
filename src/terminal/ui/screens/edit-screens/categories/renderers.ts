import blessed from "more-blessed"
import { Category } from "../../../../../interfaces/category";
import { getScreenWidth } from "../../../utils/feed-utils";
import { CategoryListState } from "./category-screen";
import { colors } from '../../../themes/default-theme';

/**
 * Renders the feed list with current selection
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
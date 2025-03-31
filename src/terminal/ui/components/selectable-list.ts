import blessed from 'more-blessed';
import { colors, styles, formatHeading } from '../themes/default-theme';

/**
 * Interface representing an item in a selectable list
 */
export interface ListItem {
  /** Text content of the list item */
  text: string;
  /** Whether this item is a non-selectable heading */
  isHeading?: boolean;
  /** Optional key for identifying the item */
  key?: string | number;
}

/**
 * Creates a reusable selectable list component
 *
 * @param screen The blessed screen instance
 * @param parent Parent node to attach the list to
 * @param items Array of list items to display
 * @param options Configuration options for positioning and styling
 * @returns A blessed list element
 */
export function createSelectableList(
  screen: blessed.Widgets.Screen,
  parent: blessed.Widgets.Node,
  items: ListItem[],
  options: {
    top: number | string;
    left: number | string;
    width?: number | string;
    height?: number | string;
    border?: boolean;
    padding?: { left?: number; right?: number; top?: number; bottom?: number };
  }
): blessed.Widgets.ListElement {

  // Format items according to their type (headings and normal entries)
  const formattedItems = items.map((item, index) => {
    if (item.isHeading) {
      return formatHeading(item.text);
    }
    // First non-heading element gets the selection cursor
    const isSelected = !items.slice(0, index).some(i => !i.isHeading);
    return isSelected ? `❯ ${item.text}` : `  ${item.text}`;
  });

  const list = blessed.list({
    parent: parent,
    top: options.top,
    left: options.left,
    width: options.width || 'shrink',
    height: options.height || 'shrink',
    keys: false,
    tags: true,
    wrap: true,
    items: formattedItems,
    style: {
      selected: {
        fg: colors.primary
      },
      fg: colors.text.muted,
    },
    border: options.border ? 'line' : undefined,
    padding: options.padding,
  });

  /**
   * Check if an item at specified index is a heading
   * @param index Index to check
   * @returns True if the item is a heading
   */
  function isHeadingItem(index: number): boolean {
    return items[index]?.isHeading || false;
  }

  // Setup keyboard navigation
  list.key(['up', 'k'], () => {
    const currentIndex = (list as any).selected as number;
    let newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;

    while (isHeadingItem(newIndex)) {
      newIndex = newIndex === 0 ? items.length - 1 : newIndex - 1;
    }

    list.select(newIndex);
    updateListItems();
    screen.render();
  });

  list.key(['down', 'j'], () => {
    const currentIndex = (list as any).selected as number;
    let newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;

    while (isHeadingItem(newIndex)) {
      newIndex = newIndex === items.length - 1 ? 0 : newIndex + 1;
    }

    list.select(newIndex);
    updateListItems();
    screen.render();
  });

  /**
   * Update the display of list items with cursor indicator
   */
  function updateListItems() {
    const selectedIndex = (list as any).selected as number;
    list.setItems(
      items.map((item, index) => {
        if (item.isHeading) {
          return formatHeading(item.text);
        }
        return index === selectedIndex ? `❯ ${item.text}` : `  ${item.text}`;
      })
    );
    screen.render();
  }

  // Set initial state
  const firstSelectableIndex = items.findIndex(item => !item.isHeading);
  if (firstSelectableIndex >= 0) {
    list.select(firstSelectableIndex);
    updateListItems();
  }

  return list;
}

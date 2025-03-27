import blessed from 'more-blessed';
import { colors, styles, formatHeading } from '../themes/default-theme';

export interface ListItem {
  text: string;
  isHeading?: boolean;
  key?: string | number;
}

/**
 * Erstellt eine wiederverwendbare selektierbare Liste
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

  // Formatiere die Items entsprechend (Headings und normale Einträge)
  const formattedItems = items.map((item, index) => {
    if (item.isHeading) {
      return formatHeading(item.text);
    }
    // Das erste nicht-Heading-Element bekommt den Auswahlcursor
    const isSelected = !items.slice(0, index).some(i => !i.isHeading);
    return isSelected ? `❯ ${item.text}` : `  ${item.text}`;
  });

  // Erstelle die Liste
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

  // Funktion um zu prüfen, ob ein Eintrag eine Überschrift ist
  function isHeadingItem(index: number): boolean {
    return items[index]?.isHeading || false;
  }

  // Tastaturnavigation einrichten
  list.key(['up'], () => {
    // Greife auf den aktuellen Index zu
    const currentIndex = (list as any).selected as number;
    let newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;

    // Solange newIndex auf eine Überschrift zeigt, überspringe diesen Eintrag
    while (isHeadingItem(newIndex)) {
      newIndex = newIndex === 0 ? items.length - 1 : newIndex - 1;
    }

    list.select(newIndex);
    updateListItems();
    screen.render();
  });

  list.key(['down'], () => {
    // Greife auf den aktuellen Index zu
    const currentIndex = (list as any).selected as number;
    let newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;

    // Solange newIndex auf eine Überschrift zeigt, überspringe diesen Eintrag
    while (isHeadingItem(newIndex)) {
      newIndex = newIndex === items.length - 1 ? 0 : newIndex + 1;
    }

    list.select(newIndex);
    updateListItems();
    screen.render();
  });

  // Aktualisiere die Anzeige der Liste mit dem Cursor
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

  // Initialen Zustand setzen
  const firstSelectableIndex = items.findIndex(item => !item.isHeading);
  if (firstSelectableIndex >= 0) {
    list.select(firstSelectableIndex);
    updateListItems();
  }

  return list;
}
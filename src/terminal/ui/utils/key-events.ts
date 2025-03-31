import blessed from 'more-blessed';

/**
 * Adds keyboard navigation functionality to a list element
 * Handles special behavior for headings and visual selection indicators
 *
 * @param list The list element to enhance with keyboard navigation
 * @param screen The screen where the list is displayed
 * @param choices The list items as strings
 */
export function addCustomKeyEventsToList(
  list: blessed.Widgets.ListElement,
  screen: blessed.Widgets.Screen,
  choices: string[]
): void {
  function isHeading(index: number): boolean {
    return choices[index].startsWith('{#D9ACDA-fg}');
  }

  list.focus();

  // Update display when user navigates
  list.on('keypress', (_ch, key) => {
    if (['up', 'down'].includes(key.name)) {
      // process.nextTick ensures list.selected is already updated
      process.nextTick(() => {
        const selectedIndex = (list as any).selected as number;
        list.setItems(
          choices.map((item, index) =>
            index === selectedIndex ? `❯ ${item}` : `  ${item}`
          )
        );
        screen.render();
      });
    }

    if (key.name === 'up') {
      const currentIndex = (list as any).selected as number;
      let newIndex = currentIndex === 0 ? choices.length - 1 : currentIndex - 1;

      // Skip entries that are headings
      while (isHeading(newIndex)) {
        newIndex = newIndex === 0 ? choices.length - 1 : newIndex - 1;
      }

      list.select(newIndex);
      screen.render();
    }
    else if (key.name === 'down') {
      const currentIndex = (list as any).selected as number;
      let newIndex = currentIndex === choices.length - 1 ? 0 : currentIndex + 1;

      while (isHeading(newIndex)) {
        newIndex = newIndex === choices.length - 1 ? 0 : newIndex + 1;
      }

      list.select(newIndex);
      screen.render();
    }
  });
}
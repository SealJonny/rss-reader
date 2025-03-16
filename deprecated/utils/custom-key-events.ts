import blessed from 'blessed';
// Funktion, die prüft, ob ein Eintrag eine Überschrift ist
function isHeading(list: blessed.Widgets.ListElement, choices: string[], index: number): boolean {
  return choices[index].startsWith('{#D9ACDA-fg}');
}

export function addCustomKeyEventsToList(list: blessed.Widgets.ListElement, screen: blessed.Widgets.Screen, choices: string[]): void {

    list.focus
    // Aktualisiere die Darstellung, wenn der Benutzer navigiert
    list.on('keypress', (_ch, key) => {
        if (['up', 'down'].includes(key.name)) {
        // process.nextTick stellt sicher, dass list.selected bereits aktualisiert ist
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
        // Greife auf den aktuellen Index zu
        const currentIndex = (list as any).selected as number;
        let newIndex = currentIndex === 0 ? choices.length - 1 : currentIndex - 1;

        // Solange newIndex auf eine Überschrift zeigt, überspringe diesen Eintrag
        while (isHeading(list, choices, newIndex)) {
            newIndex = newIndex === 0 ? choices.length - 1 : newIndex - 1;
        }

        list.select(newIndex);
        screen.render();
        }
        else if (key.name === 'down') {
        // Greife auf den aktuellen Index zu
        const currentIndex = (list as any).selected as number;
        let newIndex = currentIndex === choices.length - 1 ? 0 : currentIndex + 1;

        // Solange newIndex auf eine Überschrift zeigt, überspringe diesen Eintrag
        while (isHeading(list, choices, newIndex)) {
            newIndex = newIndex === choices.length - 1 ? 0 : newIndex + 1;
        }

        list.select(newIndex);
        screen.render();
        }
    });
}
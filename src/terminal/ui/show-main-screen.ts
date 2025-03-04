import blessed from 'blessed';
import { wait, hexToRgb, interpolateColor, colorText } from '../../utils/animation-utils';

export async function showMainScreen(screen: blessed.Widgets.Screen): Promise<number> {
  return new Promise<number>((resolve) => {
    // Erstelle eine Box, in der die Liste angezeigt wird
    const mainScreenBox = blessed.box({
      top:0,
      left: 0,
      width: '100%',
      height: '90%',
    });

    screen.append(mainScreenBox);

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
          fg: '#FFB4B4'
        }
      },
      padding: {
        left: 1,
        right: 1,
      },
    });

    titleBox.setContent(colorText("✻", hexToRgb("#FFB4B4")) +'  Welcome to the RSS Feed Reader!');

    const subtitleBox = blessed.box({
      parent: mainScreenBox,
      top: 4,
      left: 0,
      width: 'shrink',
      height: 1,
      padding: {
        left: 1,
        right: 1,
      },
    });
    subtitleBox.setContent('This is the Main Menu: ');

    const subSubtitleBox = blessed.box({
      parent: mainScreenBox,
      top: 5,
      left: 0,
      width: 'shrink',
      height: 1,
      padding: {
        left: 1,
        right: 1,
      },
      style: {
        fg: 'gray',
      },
    });
    subSubtitleBox.setContent('You can choose by either using the hotkeys or the list.');

    const topLine = blessed.line({
      parent: mainScreenBox,
      orientation: 'horizontal',
      top: 7,
      left: 0,
      width: '100%',
      style: {
        fg: '#D9ACDA'
      }
    });

    // Definiere die Listeneinträge (ohne Präfix)
    const choices = [
      '{#D9ACDA-fg}{bold}Feeds{/bold}{/#D9ACDA-fg}',
      ' Show General Feed (1)',
      ' Show Category Feed (2)',
      ' Show Favorite Feed (3)',

      '{#D9ACDA-fg}{bold}Settings{/bold}{/#D9ACDA-fg}',
      ' Edit Feed URLs (4)',
      ' Edit Favorites (5)',

      '{#D9ACDA-fg}{bold}Misc{/bold}{/#D9ACDA-fg}',
      ' Show Start Animation (6)',
    ];
    // Erstelle das List-Widget in der Box
    const list = blessed.list({
      parent: mainScreenBox,
      top: 9,
      left: 0,
      width: 'shrink',
      height: 8,
      keys: false,
      tags: true,
      wrap: true,     // Zirkuläre Navigation
      // Setze die Items initial – das erste Element als ausgewählt

      items: choices.map((item, index) => (index === 1 ? `❯ ${item}` : `  ${item}`)),
      style: {
        selected: {
          fg: '#B2A4FF'
        },
        fg: 'gray',
      }
    });

    // Setze die Auswahl auf das zweite Element (Index 1)
    list.select(1);

    // Setze den Fokus auf die Liste und rendere den Screen
    list.focus();
    screen.render();


    // Funktion, die prüft, ob ein Eintrag eine Überschrift ist
    function isHeading(index: number): boolean {
      return choices[index].startsWith('{#D9ACDA-fg}');
    }

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
        while (isHeading(newIndex)) {
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
        while (isHeading(newIndex)) {
          newIndex = newIndex === choices.length - 1 ? 0 : newIndex + 1;
        }

        list.select(newIndex);
        screen.render();
      }
    });

    // Manuelles Binden der Enter-Taste:
    list.key('enter', () => {
      const selectedIndex = (list as any).selected as number;
      // Zugriff auf die Items via Casting, da TS 'items' nicht kennt
      const items = (list as any).items as string[];
      list.emit('select', items[selectedIndex], selectedIndex);
    });

    // Behandle Tasteneingaben
    list.key(['1'], () => {
      resolve(1);
      list.setContent('');
      screen.render();
      mainScreenBox.destroy();
      screen.render();
    });
    list.key(['2'], () => {
      resolve(2);
      list.setContent('');
      screen.render();
      mainScreenBox.destroy();
      screen.render();
    });
    list.key(['6'], () => {
      resolve(6);
      list.setContent('');
      screen.render();
      mainScreenBox.destroy();
      screen.render();
    });

    // Wähle den aktuell fokussierten Eintrag per Enter
    list.on('select', (_item, index) => {
      // Versuche, den Text des ausgewählten Elements abzurufen.
      // Manchmal hat _item eine Methode getText(), andernfalls nutzen wir .content
      const itemText = _item.getText ? _item.getText() : _item.content;
      
      // Verwende einen regulären Ausdruck, um eine Zahl in Klammern zu finden, z. B. (1)
      const match = itemText.match(/\((\d+)\)/);
      
      if (match) {
        // Parse die gefundene Zahl und gebe sie zurück
        resolve(parseInt(match[1], 10));
      } else {
        // Falls keine Zahl gefunden wurde, fallback auf den Index
        resolve(0);
      }
      
      list.setContent('');
      screen.render();
      mainScreenBox.destroy();
      screen.render();
    });
    
  });
}

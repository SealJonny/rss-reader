import blessed from 'blessed';
import { wait, hexToRgb, interpolateColor, colorTextWithCode, colorTextWithRGB, rgbToCode } from '../../utils/animation-utils';

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

    titleBox.setContent(colorTextWithRGB("✻", hexToRgb("#FFB4B4")) +'  Welcome to the RSS Feed Reader!');

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
        fg: '#D9ACDA.'
      }
    });

    // Definiere die Listeneinträge (ohne Präfix)
    const choices = [
      'Show Start Animation (1)',
      'Show RSS Feed (2)',
      'Exit (ctrl + c; esc)',
      'test'
    ];
    // Erstelle das List-Widget in der Box
    const list = blessed.list({
      parent: mainScreenBox,
      top: 9,
      left: 0,
      width: 'shrink',
      height: 5,
      keys: false,
      wrap: true,     // Zirkuläre Navigation
      // Setze die Items initial – das erste Element als ausgewählt
      items: choices.map((item, index) => (index === 0 ? `❯ ${item}` : `  ${item}`)),
      style: {
        selected: {
          fg: '#B2A4FF'
        },
        fg: 'gray',
      }
    });

    // Setze den Fokus auf die Liste und rendere den Screen
    list.focus();
    screen.render();

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
        const newIndex = currentIndex === 0 ? choices.length - 1 : currentIndex - 1;
        list.select(newIndex);
        screen.render();
      }
      else if (key.name === 'down') {
        // Greife auf den aktuellen Index zu
        const currentIndex = (list as any).selected as number;
        const newIndex = currentIndex === choices.length - 1 ? 0 : currentIndex + 1;
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

    // Wähle den aktuell fokussierten Eintrag per Enter
    list.on('select', (_item, index) => {
      resolve(index + 1);
      list.setContent('');
      screen.render();
      mainScreenBox.destroy();
      screen.render();
    });
  });
}

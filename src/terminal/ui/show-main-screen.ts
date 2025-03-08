import blessed from 'blessed';
import { wait, hexToRgb, interpolateColor, colorText } from '../../utils/animation-utils';
import { addCustomKeyEventsToList } from '../../utils/custom-key-events';
import { createHelpBox } from './help-box';

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
      height: 9,
      keys: false,
      tags: true,
      wrap: true,
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


    addCustomKeyEventsToList(list, screen, choices);

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
      const helpBox = createHelpBox(screen, "nested-list");
      const nestedChoices = [
        '{#D9ACDA-fg}{bold}Categorized Feeds{/bold}{/#D9ACDA-fg}',
        ' Technical Feed (1)',
        ' Economical Feed (2)',
        ' Political Feed (3)',
      ];
      const nestedList = blessed.list({
        parent: mainScreenBox,
        top: 19,
        left: 0,
        width: 'shrink',
        height: 6,
        keys: false,
        tags: true,
        wrap: true,
        items: nestedChoices.map((item, index) => (index === 1 ? `❯ ${item}` : `  ${item}`)),
        style: {
          selected: {
            fg: '#B2A4FF'
          },
          fg: 'gray',
          border: {
            fg: '#FFB4B4'
          }
        },
        border: 'line',
        padding: {
          left: 1,
          right: 1,
        },
      });
      nestedList.select(1);
      nestedList.focus();
      screen.render();
      addCustomKeyEventsToList(nestedList, screen, nestedChoices);
      nestedList.key(['backspace', 'q'], () => {
        
        nestedList.setContent('');
        helpBox.destroy();
        screen.render();
        nestedList.destroy();
        screen.render();
        list.focus();
      });
      // Bestehender Handler für Taste '1'
      nestedList.key(['1'], () => {
        resolve(11);
        list.setContent('Test');
        nestedList.setContent('');
        helpBox.destroy();
        screen.render();
        nestedList.destroy();
        screen.render();
      });
      
      // Handler für Taste '2' (Economical Feed)
      nestedList.key(['2'], () => {
        resolve(12);
        list.setContent('');
        nestedList.setContent('');
        helpBox.destroy();
        screen.render();
        nestedList.destroy();
        screen.render();
      });
      
      // Handler für Taste '3' (Political Feed)
      nestedList.key(['3'], () => {
        resolve(13);
        list.setContent('');
        nestedList.setContent('');
        helpBox.destroy();
        screen.render();
        nestedList.destroy();
        screen.render();
      });
      
      // Enter-Taste für die verschachtelte Liste
      nestedList.key('enter', () => {
        const selectedIndex = (nestedList as any).selected as number;
        const items = (nestedList as any).items as string[];
        nestedList.emit('select', items[selectedIndex], selectedIndex);
      });
      
      // Handler für select-Event
      nestedList.on('select', (_item, index) => {
        // Extrahiere die Zahl aus dem ausgewählten Text (1, 2 oder 3)
        const itemText = _item.getText ? _item.getText() : _item.content;
        const match = itemText.match(/\((\d+)\)/);
        
        if (match) {
          // Wenn eine Zahl gefunden wurde, wandle sie um und füge 10 hinzu (10 + 1 = 11 für Technical usw.)
          const categoryNum = parseInt(match[1], 10);
          resolve(10 + categoryNum);
        } else {
          // Fallback basierend auf Index
          resolve(11 + index - 1); // -1 um den Header zu berücksichtigen
        }
        
        // Cleanup
        list.setContent('');
        nestedList.setContent('');
        helpBox.destroy();
        screen.render();
        nestedList.destroy();
        screen.render();
      });
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

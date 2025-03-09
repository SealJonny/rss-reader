import blessed from 'blessed';

/**
 * Zentrale Funktion zum Erstellen einer Bestätigungsbox
 */
export function createConfirmBox(screen: blessed.Widgets.Screen, message: string, timeout: number = 3): blessed.Widgets.MessageElement {
  const confirmBox = blessed.message({
    parent: screen,
    bottom: 0,
    right: 0,
    width: '100%',
    height: 'shrink',
    align: 'left',
    valign: 'middle',
    style: {
      fg: 'gray',
    }
  });
  
  confirmBox.display(message, timeout, () => {});
  return confirmBox;
}

/**
 * Erstellt eine Fehler-Box
 */
export function createErrorBox(screen: blessed.Widgets.Screen, errorMessage: string): blessed.Widgets.BoxElement {
  const errorBox = blessed.box({
    parent: screen,
    bottom: 0,
    right: 0,
    width: '100%',
    height: 'shrink',
    align: 'left',
    valign: 'middle',
    style: {
      fg: 'red',
    },
    content: `Error: ${errorMessage}`,
  });
  
  screen.render();
  return errorBox;
}

/**
 * Hilfsfunktion zum Zentrieren von Elementen
 */
export function centerElement(element: blessed.Widgets.BlessedElement, screen: blessed.Widgets.Screen): void {
  const screenWidth = (screen as any).width || process.stdout.columns;
  const screenHeight = (screen as any).height || process.stdout.rows;
  const elementWidth = (element as any).width || 0;
  const elementHeight = (element as any).height || 0;
  
  // Zentrieren horizontal
  if (typeof elementWidth === 'number' && typeof screenWidth === 'number') {
    element.left = Math.floor((screenWidth - elementWidth) / 2);
  } else {
    element.left = 'center';
  }
  
  // Zentrieren vertikal
  if (typeof elementHeight === 'number' && typeof screenHeight === 'number') {
    element.top = Math.floor((screenHeight - elementHeight) / 2);
  } else {
    element.top = 'center';
  }
}
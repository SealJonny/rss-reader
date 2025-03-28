import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';

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
      fg: colors.text.error,
    },
    content: `Error: ${errorMessage}`,
  });

  screen.render();
  return errorBox;
}

/**
 * Erstellt eine Notification-Box
 */
export function createNotificationBox(screen: blessed.Widgets.Screen, notification: string): blessed.Widgets.BoxElement {
  const notificationBox = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    tags: true,
    width: 'shrink',
    height: 'shrink',
    align: 'left',
    valign: 'middle',
    style: {
      fg: colors.green,
    },
    content: `${notification}  `,
  });

  screen.render();
  return notificationBox;
}

export function deleteBoxAfter(screen: blessed.Widgets.Screen, box: blessed.Widgets.BoxElement, timeout: number = 3): void {
  setTimeout(() => {
    box.destroy();
    screen.render();
  }, timeout * 1000);
}

import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';

/**
 * Creates a confirmation box at the bottom of the screen
 * 
 * @param screen The blessed screen instance
 * @param message Message to display in the confirmation box
 * @param timeout Time in seconds after which the box disappears
 * @returns The created message element
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
 * Creates an error box at the bottom of the screen
 * 
 * @param screen The blessed screen instance
 * @param errorMessage Error message to display
 * @returns The created box element
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
 * Creates a notification box at the bottom of the screen
 * 
 * @param screen The blessed screen instance
 * @param notification Notification message to display
 * @returns The created box element
 */
export function createNotificationBox(screen: blessed.Widgets.Screen, notification: string): blessed.Widgets.BoxElement {
  const notificationBox = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    tags: true,
    width: '100%',
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

/**
 * Removes a box from the screen after a specified timeout
 * 
 * @param screen The blessed screen instance
 * @param box The box element to remove
 * @param timeout Time in seconds after which the box is removed
 */
export function deleteBoxAfter(screen: blessed.Widgets.Screen, box: blessed.Widgets.BoxElement, timeout: number = 3): void {
  setTimeout(() => {
    box.destroy();
    screen.render();
  }, timeout * 1000);
}

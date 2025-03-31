import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';

/**
 * Interface representing a notification to be displayed
 */
export type Notification = {
  /** Message text to display */
  message: string;
  /** Duration in milliseconds to show the notification */
  durationInMs: number;
  /** Whether this is an error message (changes color) */
  isError: boolean;
  /** Whether this notification should be shown before others in queue */
  highPriority?: boolean;
}

/**
 * Component that displays temporary notification messages at the bottom of the screen
 */
export class NotificationBox {
  private box: blessed.Widgets.BoxElement | null = null;
  private queue: Notification[] = [];
  private isProcessing: boolean = false;
  private isPaused: boolean = false;

  /**
   * Initialize the notification box with a reference to the screen
   * @param screen The blessed screen instance to attach the notification box to
   */
  public initialize(screen: blessed.Widgets.Screen) {
    this.box = blessed.box({
      parent: screen,
      bottom: 0,
      right: 0,
      width: '100%',
      height: 'shrink',
      align: 'left',
      valign: 'middle',
    });
  }

  /**
   * Add a notification to the queue
   * @param notification Notification object to display
   */
  public addNotifcation(notification: Notification) {
    if (notification.highPriority) {
      this.queue.unshift(notification);
    } else {
      this.queue.push(notification);
    }
    this.processQueue();
  }

  /**
   * Pause notification processing and hide current notification
   */
  public pause() {
    if (this.box === null) return;
    this.isPaused = true;
    this.box.hide();
    this.box.screen.render();
  }

  /**
   * Resume notification processing
   */
  public continue() {
    this.isPaused = false;
    this.processQueue();
  }

  /**
   * Process the notification queue
   */
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      if (this.isPaused) break;

      const notification = this.queue.shift();
      if (notification) {
        await this.show(notification);
      }
    }
    this.isProcessing = false;
  }

  /**
   * Display a notification for the specified duration
   * @param notification The notification to display
   * @returns Promise that resolves when the notification is hidden
   */
  private async show(notification: Notification) {
    return new Promise<void>(resolve => {
      if (this.box === null) {
        resolve();
        return;
      }

      this.box.setContent(notification.message);
      if (notification.isError) {
        this.box.style = {
          fg: colors.text.error
        };
      } else {
        this.box.style = {
          fg: colors.green
        };
      }

      this.box.detach();
      this.box.screen.append(this.box);
      this.box.show();
      this.box.screen.render();

      setTimeout(() => {
        if (this.box === null) {
          resolve();
          return;
        }
        this.box.hide();
        this.box.screen.render();
        resolve();
      }, notification.durationInMs || 3000);
    });
  }
}

const notificationBox = new NotificationBox();
export default notificationBox;
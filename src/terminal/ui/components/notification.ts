import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';

export type Notification = {
  message: string;
  durationInMs: number;
  isError: boolean;
  highPriority?: boolean;
}

export class NotificationBox {
  private box: blessed.Widgets.BoxElement | null = null;
  private queue: Notification[] = [];
  private isProcessing: boolean = false;
  private isPaused: boolean = false;

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

  public addNotifcation(notification: Notification) {
    if (notification.highPriority) {
      this.queue.unshift(notification);
    } else {
      this.queue.push(notification);
    }
    this.processQueue();
  }

  public pause() {
    if (this.box === null) return;
    this.isPaused = true;
    this.box.hide();
    this.box.screen.render();
  }

  public continue() {
    this.isPaused = false;
    this.processQueue();
  }

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
        }
      } else {
        this.box.style = {
          fg: colors.green
        }
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
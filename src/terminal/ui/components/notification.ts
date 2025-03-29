import blessed from 'more-blessed';
import { colors } from '../themes/default-theme';

export type Notification = {
  message: string;
  durationInMs: number;
  isError: boolean;
}

export class NotificationBox {
  private box: blessed.Widgets.BoxElement
  private queue: Notification[] = [];
  private isProcessing: boolean = false;

  constructor (screen: blessed.Widgets.Screen) {
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
    this.queue.push(notification);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const notification = this.queue.shift();
      if (notification) {
        await this.show(notification);
      }
    }
    this.isProcessing = false;
  }

  private async show(notification: Notification) {
    return new Promise<void>(resolve => {
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

      this.box.show();
      this.box.screen.render();

      setTimeout(() => {
        this.box.hide();
        this.box.screen.render();
        resolve();
      }, notification.durationInMs || 3000);
    });
  }

}
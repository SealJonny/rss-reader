import { EventEmitter } from "stream";

export abstract class DbJob<T> extends EventEmitter {
  protected isRunning: boolean;
  protected abortController: AbortController;

  constructor() {
    super();
    this.isRunning= false;
    this.abortController = new AbortController();
  }

  public abstract execute(): Promise<T>;

  public isActive(): boolean {
    return this.isRunning;
  }

  public cancel(): void {
    this.abortController.abort();
  }

  protected sendStatusError() {
    this.emit("error");
  }

  protected sendStatusComplete() {
    this.emit("complete");
  }
}

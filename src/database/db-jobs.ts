import { EventEmitter } from "stream";

/**
 * Abstract base class for database jobs that can be executed and monitored
 * @template T The return type of the execute method
 */
export abstract class DbJob<T> extends EventEmitter {
  protected isRunning: boolean;
  protected abortController: AbortController;

  constructor() {
    super();
    this.isRunning= false;
    this.abortController = new AbortController();
  }

  /**
   * Execute the database job
   * @returns A promise that resolves with the job result
   */
  public abstract execute(): Promise<T>;

  /**
   * Check if the job is currently running
   * @returns True if the job is active, false otherwise
   */
  public isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Cancel the currently running job
   */
  public cancel(): void {
    this.abortController.abort();
  }

  /**
   * Emit an error event to notify listeners that the job failed
   */
  protected sendStatusError() {
    this.emit("error");
  }

  /**
   * Emit a complete event to notify listeners that the job finished successfully
   */
  protected sendStatusComplete() {
    this.emit("complete");
  }
}

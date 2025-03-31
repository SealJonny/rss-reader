/**
 * Error thrown when an operation is aborted
 */
export class AbortError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Error thrown when trying to start a job that is already running
 */
export class JobAlreadyRunning extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

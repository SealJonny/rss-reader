export class AbortError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class JobAlreadyRunning extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

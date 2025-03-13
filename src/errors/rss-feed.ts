export class RssFeedError extends Error {
  public readonly link: string;

  constructor(msg: string, link: string) {
    super(msg);
    this.name = new.target.name;
    this.link = link;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class RssFeedNotFoundError extends RssFeedError {}
export class RssFeedInvalidError extends RssFeedError {}
export class RssFeedEmptyError extends RssFeedError {}
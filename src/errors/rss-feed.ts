/**
 * Base class for RSS feed related errors
 */
export class RssFeedError extends Error {
  public readonly link: string;

  /**
   * Creates a new RSS feed error
   * @param msg Error message
   * @param link URL of the RSS feed that caused the error
   */
  constructor(msg: string, link: string) {
    super(msg);
    this.name = new.target.name;
    this.link = link;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Error thrown when an RSS feed URL cannot be found or accessed
 */
export class RssFeedNotFoundError extends RssFeedError {}

/**
 * Error thrown when an RSS feed has invalid format or cannot be parsed
 */
export class RssFeedInvalidError extends RssFeedError {}

/**
 * Error thrown when an RSS feed is empty or contains no items
 */
export class RssFeedEmptyError extends RssFeedError {}
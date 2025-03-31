/**
 * Base class for AI-related errors
 */
export class AiIError extends Error {
  public prompt: string;

  /**
   * Creates a new AI error
   * @param msg Error message
   * @param prompt Prompt that caused the error
   */
  constructor(msg: string, prompt: string) {
    super(msg);
    this.name = new.target.name;
    this.prompt = prompt;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Error thrown when an AI request fails
 */
export class AiRequestError extends Error {}

/**
 * Error thrown when an AI response cannot be parsed or is invalid
 */
export class AiInvalidResponseError extends Error {}

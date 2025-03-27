export class AiIError extends Error {
  public prompt: string;

  constructor(msg: string, prompt: string) {
    super(msg);
    this.name = new.target.name;
    this.prompt = prompt;
    Error.captureStackTrace?.(this, this.constructor);
  }
}


export class AiRequestError extends Error {}
export class AiInvalidResponseError extends Error {}

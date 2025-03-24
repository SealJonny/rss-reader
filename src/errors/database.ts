export class DatabaseError extends Error {
  public readonly code: string;
  public readonly tableName?: string;

  constructor(msg: string, code: string, tableName?: string) {
    super(msg);
    this.name = new.target.name;
    this.code = code;
    this.tableName = tableName;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static from<T extends typeof DatabaseError>(this: T, error: any, tableName?: string): InstanceType<T> {
    if (error instanceof DatabaseError) return error as InstanceType<T>;
    let code = error?.code || "";
    let msg = error?.message || String(error) || "";
    return new this(msg, code, tableName) as InstanceType<T>;
  }
}

export class DatabaseConnectionError extends DatabaseError {}
export class EntityNotFoundError extends DatabaseError {};
export class EntityUpdateError extends DatabaseError {};
export class EntityCreateError extends DatabaseError {};
export class EntityMultiCreateError extends DatabaseError {};
export class EntityMultiUpdateError extends DatabaseError {};
export class EntityDeleteError extends DatabaseError {};
export class QueryInvalidError extends DatabaseError {};

/**
 * Base class for database-related errors
 */
export class DatabaseError extends Error {
  public readonly code: string;
  public readonly tableName?: string;

  /**
   * Creates a new database error
   * @param msg Error message
   * @param code Error code from the database
   * @param tableName Name of the table where the error occurred
   */
  constructor(msg: string, code: string, tableName?: string) {
    super(msg);
    this.name = new.target.name;
    this.code = code;
    this.tableName = tableName;
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Creates a database error from any error object
   * @param error The original error
   * @param tableName Name of the table where the error occurred
   * @returns A new instance of the error class
   */
  static from<T extends typeof DatabaseError>(this: T, error: any, tableName?: string): InstanceType<T> {
    if (error instanceof DatabaseError) return error as InstanceType<T>;
    let code = error?.code || "";
    let msg = error?.message || String(error) || "";
    return new this(msg, code, tableName) as InstanceType<T>;
  }
}

/**
 * Error thrown when connection to the database fails
 */
export class DatabaseConnectionError extends DatabaseError {}

/**
 * Error thrown when an entity is not found in the database
 */
export class EntityNotFoundError extends DatabaseError {};

/**
 * Error thrown when updating an entity fails
 */
export class EntityUpdateError extends DatabaseError {};

/**
 * Error thrown when creating an entity fails
 */
export class EntityCreateError extends DatabaseError {};

/**
 * Error thrown when batch creation of multiple entities fails
 */
export class EntityMultiCreateError extends DatabaseError {};

/**
 * Error thrown when batch update of multiple entities fails
 */
export class EntityMultiUpdateError extends DatabaseError {};

/**
 * Error thrown when deleting an entity fails
 */
export class EntityDeleteError extends DatabaseError {};

/**
 * Error thrown when a query is invalid or malformed
 */
export class QueryInvalidError extends DatabaseError {};

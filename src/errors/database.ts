export class DatabaseError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class DatabaseConnectionError extends DatabaseError {}

export class DbTableError extends DatabaseError {
  public readonly tableName: string;
  constructor(msg: string, tableName: string) {
    super(msg);
    this.tableName = tableName;
  }
}

export class EntityNotFoundError extends DbTableError {};
export class EntityUpdateError extends DbTableError {};
export class EntityCreateError extends DbTableError {};
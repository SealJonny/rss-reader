import { Database } from "sqlite";
import { DatabaseError, EntityCreateError, EntityDeleteError, EntityUpdateError, QueryInvalidError } from "../errors/database";

/**
 * Abstract base class for database table operations
 * @template T The entity type this table manages
 */
export abstract class DbTable<T> {
    protected readonly dbConnection: Database;
    protected readonly tableName: string;

    /**
     * Creates a new table manager
     * @param dbConnection SQLite database connection
     * @param tableName Name of the table this class manages
     */
    constructor(dbConnection: Database, tableName: string) {
        this.dbConnection = dbConnection;
        this.tableName = tableName;
    }

    /**
     * Executes an update query and returns the updated entity
     * @param id ID of the entity to update
     * @param query SQL update query
     * @param params Query parameters
     * @returns The updated entity or undefined if not found
     * @throws {EntityUpdateError} If the update operation fails
     */
    protected async executeUpdate(id: number, query: string, ...params: any[]): Promise<T | undefined> {
      try {
        const result = await this.dbConnection.run(query, ...params);
        if (typeof result.changes === "undefined") {
          return undefined;
        }

        if (result.changes === 0) {
          return undefined;
        }
        return await this.executeSingleFind(`SELECT * FROM ${this.tableName} WHERE id = ?`, id);
      } catch (error) {
        throw EntityUpdateError.from(error, this.tableName);
      }
    }

    /**
     * Executes a delete query
     * @param query SQL delete query
     * @param id ID of the entity to delete
     * @returns True if entity was deleted, false otherwise
     * @throws {EntityDeleteError} If the delete operation fails
     */
    protected async executeDelete(query: string, id: number): Promise<boolean> {
      try {
        const result = await this.dbConnection.run(query, id);
        return result.changes! > 0;
      } catch (error) {
        throw EntityDeleteError.from(error, this.tableName);
      }
    }

    /**
     * Executes an insert query and returns the created entity
     * @param query SQL insert query
     * @param params Query parameters
     * @returns The created entity or undefined if creation failed
     * @throws {EntityCreateError} If the insert operation fails
     */
    protected async executeInsert(query: string, ...params: any[]): Promise<T | undefined> {
        try {
          const result = await this.dbConnection.run(query, ...params);
          if (typeof result.lastID === "undefined") return undefined;
          return await this.executeSingleFind(`SELECT * FROM ${this.tableName} WHERE id = ?`, result.lastID);
        } catch (error) {
          throw EntityCreateError.from(error, this.tableName);
        }
    }

    /**
     * Executes a query that returns a single entity
     * @param query SQL query
     * @param params Query parameters
     * @returns The found entity or undefined if not found
     * @throws {DatabaseError} If the query execution fails
     */
    protected async executeSingleFind(query: string, ...params: any[]): Promise<T | undefined> {
      try {
        let result = await this.dbConnection.get<T>(query, ...params);
        return result;
      } catch (error) {
        throw DatabaseError.from(error, this.tableName);
      }
    }

    /**
     * Executes a query that returns multiple entities
     * @param query SQL query
     * @param params Query parameters
     * @returns Array of found entities
     * @throws {DatabaseError} If the query execution fails
     */
    protected async executeMultiFind(query: string, ...params: any[]): Promise<T[]> {
      try {
        return await this.dbConnection.all<T[]>(query, ...params);
      } catch (error) {
        throw DatabaseError.from(error, this.tableName);
      }
    }

    /**
     * Builds a query from a criteria object
     * @param criteria Object containing field-value pairs to search for
     * @returns Object with query string and parameter values
     * @throws {QueryInvalidError} If no criteria are specified
     */
    protected buildQueryFromCriteria(criteria: Partial<T>): {query: string; values: any[]} {
      const keys = Object.keys(criteria);
      if (keys.length === 0) {
        throw new QueryInvalidError("At least one criteria must be specified!", this.tableName);
      }

      const conditions = keys.map(key => `${key} = ?`).join(" AND ");
      const values = keys.map(key => (criteria as any)[key]).map(v => {
        if (typeof v === "boolean") {
          return Number(v);
        }
        return v;
      });

      const query = `SELECT * FROM ${this.tableName} WHERE ${conditions}`;
      return {query: query, values: values};
    }
}
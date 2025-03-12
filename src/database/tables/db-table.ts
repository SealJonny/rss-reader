import { Database } from "sqlite";
import { EntityUpdateError } from "../../errors/database";
export class DbTable {
    protected readonly dbConnection: Database;
    protected readonly tableName: string;

    constructor(dbConnection: Database, tableName: string) {
        this.dbConnection = dbConnection;
        this.tableName = tableName;
    }

    protected async executeUpdateOrDelete(query: string, ...params: any[]): Promise<boolean> {
      const result = await this.dbConnection.run(query, ...params);
      return result.changes! > 0;
    }

    protected async executeUpdate(query: string, ...params: any[]): Promise<boolean> {
      try {
        return this.executeUpdateOrDelete(query, ...params);
      } catch (error: any) {
        if (error instanceof Error) {
          throw new EntityUpdateError(error.message, this.tableName);
        }
        throw new EntityUpdateError(error, this.tableName);
      }
    }

    protected async executeInsert(query: string, ...params: any[]): Promise<boolean> {
        try {
            const result = await this.dbConnection.run(query, ...params);
            return typeof result.lastID !== "undefined";
        } catch (error) {
            console.error("Error while executing query:", error);
            return false;
        }
    }

    protected async executeSingleFind<T>(query: string, ...params: any[]): Promise<T | null> {
        try {
            let result = await this.dbConnection.get<T>(query, ...params);
            return result ?? null;
        } catch (error) {
            console.error("Error while searching db:", error);
            return null;
        }
    }

    protected async executeMultiFind<T>(query: string, ...params: any[]): Promise<T[]> {
        try {
            return await this.dbConnection.all<T[]>(query, ...params);
        } catch (error) {
            console.error("Error while searching db:", error);
            return [];
        }
    }

    protected buildQueryFromCriteria<T>(criteria: Partial<T>): {query: string; values: any[]} {
        const keys = Object.keys(criteria);
        if (keys.length === 0) {
            throw new Error("At least one criteria must be specified!");
        }

        const conditions = keys.map(key => `${key} = ?`).join(" AND ");
        const values = keys.map(key => (criteria as any)[key]);

        const query = `SELECT * FROM ${this.tableName} WHERE ${conditions}`;
        return {query: query, values: values};
    }
}
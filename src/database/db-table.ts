import { Database } from "sqlite";
import { DatabaseError, EntityCreateError, EntityDeleteError, EntityUpdateError, QueryInvalidError } from "../errors/database";

export abstract class DbTable<T> {
    protected readonly dbConnection: Database;
    protected readonly tableName: string;

    constructor(dbConnection: Database, tableName: string) {
        this.dbConnection = dbConnection;
        this.tableName = tableName;
    }

    protected async executeUpdate(query: string, ...params: any[]): Promise<T | undefined> {
      try {
        const result = await this.dbConnection.run(query, ...params);
        if (typeof result.changes === undefined) {
          return undefined;
        }

        if (result.changes === 0) {
          return undefined;
        }
        return await this.executeSingleFind(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      } catch (error) {
        throw EntityUpdateError.from(error, this.tableName);
      }
    }

    protected async executeDelete(query: string, ...params: any[]): Promise<boolean> {
      try {
        const result = await this.dbConnection.run(query, ...params);
        return result.changes! > 0;
      } catch (error) {
        throw EntityDeleteError.from(error, this.tableName);
      }
    }

    protected async executeInsert(query: string, ...params: any[]): Promise<T | undefined> {
        try {
          const result = await this.dbConnection.run(query, ...params);
          if (typeof result.lastID === "undefined") return undefined;
          return await this.executeSingleFind(`SELECT * FROM ${this.tableName} WHERE id = ?`, result.lastID);
        } catch (error) {
          throw EntityCreateError.from(error, this.tableName);
        }
    }

    protected async executeSingleFind(query: string, ...params: any[]): Promise<T | undefined> {
      try {
        let result = await this.dbConnection.get<T>(query, ...params);
        return result;
      } catch (error) {
        throw DatabaseError.from(error, this.tableName);
      }
    }

    protected async executeMultiFind(query: string, ...params: any[]): Promise<T[]> {
      try {
        return await this.dbConnection.all<T[]>(query, ...params);
      } catch (error) {
        throw DatabaseError.from(error, this.tableName);
      }
    }

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
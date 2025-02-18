import { Database } from "sqlite";

export class DbTable {
    protected dbConnection: Database;

    constructor(dbConnection: Database) {
        this.dbConnection = dbConnection;
    }

    async executeUpdateOrDelete(query: string, ...params: any[]): Promise<boolean> {
        try {
            const result = await this.dbConnection.run(query, params);
            return result.changes! > 0;
        } catch (error) {
            console.error("Error while executing query:", error);
            return false;
        }
    }

    async executeInsert(query: string, ...params: any[]): Promise<boolean> {
        try {
            const result = await this.dbConnection.run(query, params);
            return typeof result.lastID === "undefined";
        } catch (error) {
            console.error("Error while executing query:", error);
            return false;
        }
    }
}
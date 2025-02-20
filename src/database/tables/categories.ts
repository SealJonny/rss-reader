import { Database } from "sqlite";
import { DbTable } from "./db-table";
import { Category } from "../../interfaces/category";

export class Categories extends DbTable {
    constructor(dbConnection: Database, tableName: string) {
        super(dbConnection, tableName);
    }

    async add(category: Category): Promise<boolean> {
        const query = `INSERT INTO ${this.tableName} (name) VALUES (?)`;
        return await this.executeInsert(query, category.name);
    }

    async update(id: number, category: Category): Promise<boolean> {
        const query = `UPDATE ${this.tableName} SET name = ? WHERE id = ?`;
        return await this.executeUpdateOrDelete(query, category.name, id);
    }

    /**
     * Convenience wrapper for {@link addCategory} and {@link updateCategory}.
     * 
     * @param category A {@link Category} object which will be saved.
     * @returns true if saving {@link news} was successful; otherwise false.
     */
    public async save(category: Category) {
        if (typeof category.id === "undefined") {
            return this.add(category); 
        }
        return this.update(category.id, category)
    }

    async delete(id: number): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        return await this.executeUpdateOrDelete(query, id);
    }

    async findSingleBy(criteria: Partial<Category>): Promise<Category | null> {
        const result = this.buildQueryFromCriteria(criteria);
        return this.executeSingleFind<Category>(result.query, result.values);
    }

    async all(criteria?: Partial<Category>): Promise<Category[]> {
        if (criteria) {
            const result = this.buildQueryFromCriteria(criteria);
            return await this.executeMultiFind<Category>(result.query, result.values);
        }
        return this.executeMultiFind<Category>(`SELECT * FROM ${this.tableName}`);
    }

}
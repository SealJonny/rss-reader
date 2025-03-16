import { Database } from "sqlite";
import { DbTable } from "../db-table";
import { Category } from "../../interfaces/category";

export class Categories extends DbTable<Category> {
    constructor(dbConnection: Database, tableName: string) {
        super(dbConnection, tableName);
    }

    async add(category: Category): Promise<Category | undefined> {
        const query = `
          INSERT INTO ${this.tableName}
          (name) VALUES (?)
        `;
        return await this.executeInsert(query, category.name);
    }

    async update(id: number, category: Category): Promise<Category | undefined> {
        const query = `
          UPDATE ${this.tableName}
          SET name = ?
          WHERE id = ?
        `;
        return await this.executeUpdate(query, category.name, id);
    }

    /**
     * Convenience wrapper for {@link addCategory} and {@link updateCategory}.
     *
     * @param category A {@link Category} object which will be saved.
     * @returns true if saving {@link news} was successful; otherwise false.
     */
    public async save(category: Category): Promise<Category | undefined> {
        if (typeof category.id === "undefined") {
            return await this.add(category);
        }
        return await this.update(category.id, category)
    }

    async delete(id: number): Promise<boolean> {
      const query = `
        DELETE
        FROM ${this.tableName}
        WHERE id = ?
      `;
      return await this.executeDelete(query, id);
    }

    async findBy(criteria: Partial<Category>): Promise<Category | undefined> {
        const result = this.buildQueryFromCriteria(criteria);
        return await this.executeSingleFind(result.query, result.values);
    }

    async all(criteria?: Partial<Category>): Promise<Category[]> {
        if (criteria) {
            const result = this.buildQueryFromCriteria(criteria);
            return await this.executeMultiFind(result.query, result.values);
        }
        return await this.executeMultiFind(`SELECT * FROM ${this.tableName}`);
    }

}
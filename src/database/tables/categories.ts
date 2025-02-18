import { Database } from "sqlite";
import { DbTable } from "./db-table";
import { Category } from "../../interfaces/category";

export class Categories extends DbTable {
    constructor(dbConnection: Database) {
        super(dbConnection);
    }

    async add(category: Category): Promise<boolean> {
        const query = "INSERT INTO categories (name) VALUES (?)";
        return await this.executeInsert(query, category.name);
    }

    async update(id: number, category: Category): Promise<boolean> {
        const query = "UPDATE categories SET name = ? WHERE id = ?";
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
        const query = "DELETE FROM categories WHERE id = ?";
        return await this.executeUpdateOrDelete(query, id);
    }

    async findSingleBy(criteria: Partial<Category>): Promise<Category | null> {
        const keys = Object.keys(criteria);
        if (keys.length === 0) {
            throw new Error("At least one criteria must be specified!");
        }

        const conditions = keys.map(key => `${key} = ?`).join(" AND ");
        const values = keys.map(key => (criteria as any)[key]);
        
        const query = `SELECT * FROM categories WHERE ${conditions}`;
        try {
            let result = await this.dbConnection.get<Category>(query, values);
            return result ? result : null;
        } catch (error) {
            console.error("Error while searching db:", error);
            return null;
        }
    }

}
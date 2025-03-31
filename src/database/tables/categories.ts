import { Database } from "sqlite";
import { DbTable } from "../db-table";
import { Category } from "../../interfaces/category";

/**
 * Database table manager for category entities
 */
export class Categories extends DbTable<Category> {
  constructor(dbConnection: Database, tableName: string) {
      super(dbConnection, tableName);
  }

  /**
   * Adds a new category to the database
   * @param category Category to add
   * @returns The added category with ID or undefined if insertion failed
   */
  async add(category: Category): Promise<Category | undefined> {
    const query = `
      INSERT INTO ${this.tableName}
      (name, description) VALUES (?, ?)
    `;
    return await this.executeInsert(query, category.name, category.description);
  }

  /**
   * Updates an existing category in the database
   * @param id ID of the category to update
   * @param category Category data to update
   * @returns The updated category or undefined if update failed
   */
  async update(id: number, category: Category): Promise<Category | undefined> {
    const query = `
      UPDATE ${this.tableName}
      SET name = ?, description = ?
      WHERE id = ?
    `;
    return await this.executeUpdate(
      id,
      query,
      category.name,
      category.description,
      id
    );
  }

  /**
   * Convenience wrapper for {@link add} and {@link update}.
   *
   * @param category {@link Category} object to save
   * @returns The saved category or undefined if operation failed
   */
  public async save(category: Category): Promise<Category | undefined> {
      if (typeof category.id === "undefined") {
          return await this.add(category);
      }
      return await this.update(category.id, category);
  }

  /**
   * Deletes a category from the database
   * @param id ID of the category to delete
   * @returns True if deletion was successful, false otherwise
   */
  async delete(id: number): Promise<boolean> {
    const query = `
      DELETE
      FROM ${this.tableName}
      WHERE id = ?
    `;
    return await this.executeDelete(query, id);
  }

  /**
   * Finds a category by specified criteria
   * @param criteria Object containing field-value pairs to search for
   * @returns Matching category or undefined if not found
   */
  async findBy(criteria: Partial<Category>): Promise<Category | undefined> {
    const result = this.buildQueryFromCriteria(criteria);
    return await this.executeSingleFind(result.query, result.values);
  }

  /**
   * Retrieves all categories, optionally filtered by criteria
   * @param criteria Optional criteria to filter categories
   * @returns Array of categories
   */
  async all(criteria?: Partial<Category>): Promise<Category[]> {
    if (criteria) {
      const result = this.buildQueryFromCriteria(criteria);
      return await this.executeMultiFind(result.query, result.values);
    }
    return await this.executeMultiFind(`SELECT * FROM ${this.tableName}`);
  }
}
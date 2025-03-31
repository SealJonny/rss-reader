import { Database } from "sqlite";
import { NewsItem } from "../../interfaces/news-item";
import { Category } from "../../interfaces/category";
import { EntityCreateError } from "../../errors/database";

/**
 * Type representing a relationship between a news item and a category
 */
export type CategoryNewsRelationship = {
  newsId: number;
  categoryId: number;
};

/**
 * Database manager for the many-to-many relationship between news items and categories
 */
export class NewsCategories {
  dbConnection: Database;
  tableName: string;

  /**
   * Creates a new news-categories relationship manager
   * @param dbConnection SQLite database connection
   * @param tableName Name of the junction table
   */
  constructor(dbConnection: Database, tableName: string) {
    this.dbConnection = dbConnection;
    this.tableName = tableName;
  }

  /**
   * Adds one or more category-news relationships to the database
   * @param relationships Array of CategoryNewsRelationship objects to add
   * @returns True if at least one relationship was added successfully
   * @throws {EntityCreateError} If the operation fails
   */
  async addCategoryToNews(...relationships: CategoryNewsRelationship[]): Promise<boolean> {
    relationships = relationships.filter(r => !isNaN(r.newsId) && !isNaN(r.categoryId));
    if (relationships.length === 0) {
      return false;
    }
    const useTransaction = relationships.length > 1;

    const placeholders = relationships.map(() => "(?, ?)").join(", ");
    const query = `
      INSERT INTO 
      ${this.tableName}
      (categoryId, newsId)
      VALUES ${placeholders}
    `;
    const values = relationships.flatMap(r => [r.categoryId, r.newsId]);
    try {
      if (useTransaction) {
        await this.dbConnection.run("BEGIN TRANSACTION");
      }

      const result = await this.dbConnection.run(query, values);

      if (useTransaction) {
        await this.dbConnection.run("COMMIT");
      }

      return typeof result.lastID === "number";
    } catch (error) {
      if (useTransaction) {
        await this.dbConnection.run("ROLLBACK");
      }

      throw EntityCreateError.from(error, this.tableName);
    }
  }

  /**
   * Gets all news items for a specific category
   * @param categoryId ID of the category
   * @returns Array of news items belonging to the category
   */
  async getNewsForCategory(categoryId: number): Promise<NewsItem[]> {
    const query = `
      SELECT news.* FROM news
      JOIN news_categories ON news.id = news_categories.newsId
      WHERE news_categories.categoryId = ?;
    `;
    return await this.dbConnection.all<NewsItem[]>(query, categoryId);
  }

  /**
   * Gets all categories for a specific news item
   * @param newsId ID of the news item
   * @returns Array of categories assigned to the news item
   */
  async getCategoriesForNews(newsId: number): Promise<Category[]> {
    const query = `
      SELECT categories.* FROM categories
      JOIN news_categories ON categories.id = news_categories.categoryId
      WHERE news_categories.newsId = ?;
    `;

    return await this.dbConnection.all<Category[]>(query, newsId);
  }
}

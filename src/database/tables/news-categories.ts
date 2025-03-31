import { Database } from "sqlite";
import { NewsItem } from "../../interfaces/news-item";
import { Category } from "../../interfaces/category";
import { EntityCreateError, EntityDeleteError } from "../../errors/database";

export type CategoryNewsRelationship = {
  newsId: number;
  categoryId: number;
};

export class NewsCategories {
  dbConnection: Database;
  tableName: string;

  constructor(dbConnection: Database, tableName: string) {
    this.dbConnection = dbConnection;
    this.tableName = tableName;
  }

  async deleteAllRelationships() {
    const query = `DELETE FROM ${this.tableName}`;
    try {
      await this.dbConnection.run(query);
    } catch (error) {
      throw EntityDeleteError.from(error, this.tableName);
    }
  }

  async addCategoryToNews(...relationships: CategoryNewsRelationship[]): Promise<boolean> {
    relationships = relationships.filter(r => !isNaN(r.newsId) && !isNaN(r.categoryId));
    if (relationships.length === 0) {
      return false;
    }
    const useTransaction = relationships.length > 1;

    const placeholders = relationships.map(() => "(?, ?)").join(", ")
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

  async getNewsForCategory(categoryId: number): Promise<NewsItem[]> {
    const query = `
      SELECT news.* FROM news
      JOIN news_categories ON news.id = news_categories.newsId
      WHERE news_categories.categoryId = ?;
    `;
    return await this.dbConnection.all<NewsItem[]>(query, categoryId);
  }

  async getCategoriesForNews(newsId: number): Promise<Category[]> {
    const query = `
      SELECT categories.* FROM categories
      JOIN news_categories ON categories.id = news_categories.categoryId
      WHERE news_categories.newsId = ?;
    `;

    return await this.dbConnection.all<Category[]>(query, newsId);
  }

}

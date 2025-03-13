import { Database } from "sqlite";
import { NewsItem } from "../../interfaces/news-item";
import { Category } from "../../interfaces/category";
import { EntityCreateError } from "../../errors/database";
export class NewsCategories {
  dbConnection: Database;
  tableName: string;

  constructor(dbConnection: Database, tableName: string) {
    this.dbConnection = dbConnection;
    this.tableName = tableName;
  }

  async addCategoryToNews(newsId: number, categoryId: number): Promise<boolean> {
    if (isNaN(newsId) || isNaN(categoryId)) {
        return false;
    }
    const query = `INSERT INTO ${this.tableName} (category_id, news_id) VALUES (?, ?)`;
    try {
      const result = await this.dbConnection.run(query, categoryId, newsId)
      return typeof result.lastID === "number";
    } catch (error) {
      throw EntityCreateError.from(error, this.tableName);
    }
  }

  async getNewsForCategory(categoryId: number): Promise<NewsItem[]> {
    const query = `
      SELECT news.* FROM news
      JOIN news_categories ON news.id = news_categories.news_id
      WHERE news_categories.category_id = ?;
    `;
    return await this.dbConnection.all<NewsItem[]>(query, categoryId);
  }

  async getCategoriesForNews(newsId: number): Promise<Category[]> {
    const query = `
      SELECT categories.* FROM categories
      JOIN news_categories ON categories.id = news_categories.category_id
      WHERE news_categories.news_id = ?;
    `;

    return await this.dbConnection.all<Category[]>(query, newsId);
  }

}
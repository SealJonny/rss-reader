import { Database } from "sqlite";
import { DbTable } from "./db-table";
import { NewsItem } from "../../interfaces/news-item";
import { Category } from "../../interfaces/category";

export class NewsCategories extends DbTable {
    constructor(dbConnection: Database, tableName: string) {
        super(dbConnection, tableName);
    }

    async addCategoryToNews(newsId: number, categoryId: number): Promise<boolean> {
        if (isNaN(newsId) || isNaN(categoryId)) {
            return false;
        }
        const query = "INSERT INTO news_categories (category_id, news_id) VALUES (?, ?)";
        return await this.executeInsert(query, categoryId, newsId);
    }

    async getNewsForCategory(categoryId: number): Promise<NewsItem[]> {
        const query = `
            SELECT news.* FROM news
            JOIN news_categories ON news.id = news_categories.news_id
            WHERE news_categories.category_id = ?;
        `;
        
        try {
            return await this.dbConnection.all<NewsItem[]>(query, categoryId);
        } catch (error) {
            console.error("Error while fetching news for a category:", error);
            return [];
        }
    }

    async getCategoriesForNews(newsId: number): Promise<Category[]> {
        const query = `
            SELECT categories.* FROM categories 
            JOIN news_categories ON categories.id = news_categories.category_id
            WHERE news_categories.news_id = ?;
        `;

        try {
            return await this.dbConnection.all<Category[]>(query, newsId);
        } catch (error) {
            console.error("Error while fetching news for a category:", error);
            return [];
        }
    }

}
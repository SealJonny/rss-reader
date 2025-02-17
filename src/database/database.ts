import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { Category } from "../interfaces/category";
import { NewsItem } from "../interfaces/news-item";

/////////////
// General //
/////////////
export class Db {
    protected dbInstance: Database | null = null;

    async connectDb() {
        if (!this.dbInstance) {
            this.dbInstance = await open({
                filename: "database.sqlite",
                driver: sqlite3.Database
            });
        }
        return this.dbInstance;
    }

    async initTables() {
        const db = await this.connectDb();
        const categories = `
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );
        `;

        const news = `
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                link TEXT,
                pubDate TEXT,
                description TEXT
            );
        `; 

        const categories_news = `
            CREATE TABLE IF NOT EXISTS news_categories (
                category_id INTEGER,
                news_id INTEGER,
                PRIMARY KEY (category_id, news_id),
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
            );
        `;

        await db.exec(categories);
        await db.exec(news);
        await db.exec(categories_news);
    }

    async executeUpdateOrDelete(query: string, ...params: any[]): Promise<boolean> {
        try {
            const db = await this.connectDb();
            const result = await db.run(query, params);
            return result.changes! > 0;
        } catch (error) {
            console.error("Error while executing query:", error);
            return false;
        }
    }

    async  executeInsert(query: string, ...params: any[]): Promise<boolean> {
        try {
            const db = await this.connectDb();
            const result = await db.run(query, params);
            return typeof result.lastID === "undefined";
        } catch (error) {
            console.error("Error while executing query:", error);
            return false;
        }
    }


    //////////////////////
    // Categories-Table //
    //////////////////////

    async  addCategory(category: Category): Promise<boolean> {
        const query = "INSERT INTO categories (name) VALUES (?)";
        return await this.executeInsert(query, category.name);
    }

    async updateCategory(id: number, category: Category): Promise<boolean> {
        const query = "UPDATE categories SET name = ? WHERE id = ?";
        return await this.executeUpdateOrDelete(query, category.name, id);
    }

    /**
     * Convenience wrapper for {@link addCategory} and {@link updateCategory}.
     * 
     * @param category A {@link Category} object which will be saved.
     * @returns true if saving {@link news} was successful; otherwise false.
     */
    async saveCategory(category: Category) {
        if (typeof category.id === "undefined") {
            return this.addCategory(category); 
        }
        return this.updateCategory(category.id, category)
    }

    async deleteCategory(id: number): Promise<boolean> {
        const query = "DELETE FROM categories WHERE id = ?";
        return await this.executeUpdateOrDelete(query, id);
    }

    async findSingleCategoryBy(criteria: Partial<Category>): Promise<Category | null> {
        const db = await this.connectDb();

        const keys = Object.keys(criteria);
        if (keys.length === 0) {
            throw new Error("At least one criteria must be specified!");
        }

        const conditions = keys.map(key => `${key} = ?`).join(" AND ");
        const values = keys.map(key => (criteria as any)[key]);
        
        const query = `SELECT * FROM categories WHERE ${conditions}`;
        try {
            let result = await db.get<Category>(query, values);
            return result ? result : null;
        } catch (error) {
            console.error("Error while searching db:", error);
            return null;
        }
    }

    ////////////////
    // News-Table //
    ////////////////

    async addNews(news: NewsItem): Promise<boolean> {
        const query = "INSERT INTO news (title, link, pubDate, description) VALUES (?, ?, ?, ?)";
        return await this.executeInsert(query, news.title, news.link, news.pubDate, news.description);
    }

    async updateNews(id: number, news: NewsItem): Promise<boolean> {
        const query = "UPDATE news SET title = ?, link = ?, pubDate = ?, description = ? WHERE id = ?";
        return await this.executeUpdateOrDelete(query, news.title, news.link, news.pubDate, news.description, id);
    }

    /**
     * Convenience wrapper for {@link addNews} and {@link updateNews}.
     * 
     * @param news A {@link NewsItem} object which will be saved.
     * @returns true if saving {@link news} was successful; otherwise false.
     */
    async saveNews(news: NewsItem) {
        if (typeof news.id === "undefined") {
            return this.addNews(news); 
        }
        return this.updateNews(news.id, news)
    }

    async deleteNews(id: number): Promise<boolean> {
        const query = "DELETE FROM news WHERE id = ?";
        return await this.executeUpdateOrDelete(query, id);
    }

    async findSingleNewsBy(criteria: Partial<NewsItem>): Promise<NewsItem | null> {
        const db = await this.connectDb();

        const keys = Object.keys(criteria);
        if (keys.length === 0) {
            throw new Error("At least one criteria must be specified!");
        }

        const conditions = keys.map(key => `${key} = ?`).join(" AND ");
        const values = keys.map(key => (criteria as any)[key]);
        
        const query = `SELECT * FROM news WHERE ${conditions}`;
        try {
            let result = await db.get<NewsItem>(query, values);
            return result ? result : null;
        } catch (error) {
            console.error("Error while searching db:", error);
            return null;
        }
    }


    ////////////////
    // Join-Table //
    ////////////////

    async addCategoryToNews(newsId: number, categoryId: number): Promise<boolean> {
        const query = "INSERT INTO news_categories (category_id, news_id) VALUES (?, ?)";
        return await this.executeInsert(query, categoryId, newsId);
    }

    async getNewsForCategory(categoryId: number): Promise<NewsItem[]> {
        const db = await this.connectDb();
        const query = `
            SELECT news.* FROM news
            JOIN news_categories ON news.id = news_categories.news_id
            WHERE news_categories.category_id = ?;
        `;
        
        try {
            return await db.all<NewsItem[]>(query, categoryId);
        } catch (error) {
            console.error("Error while fetching news for a category:", error);
            return [];
        }
    }
}


const db = new Db();
export default db;
import { Database } from "sqlite";
import { DbTable } from "./db-table";
import { NewsItem } from "../../interfaces/news-item";

class News extends DbTable {
    constructor(dbConnection: Database) {
        super(dbConnection);
    }

    async add(news: NewsItem): Promise<boolean> {
        const query = "INSERT INTO news (title, link, pubDate, description) VALUES (?, ?, ?, ?)";
        return await this.executeInsert(query, news.title, news.link, news.pubDate, news.description);
    }

    async update(id: number, news: NewsItem): Promise<boolean> {
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
            return this.add(news); 
        }
        return this.update(news.id, news)
    }

    async delete(id: number): Promise<boolean> {
        const query = "DELETE FROM news WHERE id = ?";
        return await this.executeUpdateOrDelete(query, id);
    }

    async findSingleBy(criteria: Partial<NewsItem>): Promise<NewsItem | null> {
        const keys = Object.keys(criteria);
        if (keys.length === 0) {
            throw new Error("At least one criteria must be specified!");
        }

        const conditions = keys.map(key => `${key} = ?`).join(" AND ");
        const values = keys.map(key => (criteria as any)[key]);
        
        const query = `SELECT * FROM news WHERE ${conditions}`;
        try {
            let result = await this.dbConnection.get<NewsItem>(query, values);
            return result ? result : null;
        } catch (error) {
            console.error("Error while searching db:", error);
            return null;
        }
    }
}
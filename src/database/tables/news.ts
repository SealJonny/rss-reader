import { Database } from "sqlite";
import { DbTable } from "./db-table";
import { NewsItem } from "../../interfaces/news-item";

export class News extends DbTable {
    constructor(dbConnection: Database, tableName: string) {
        super(dbConnection, tableName);
    }

    async add(news: NewsItem): Promise<boolean> {
        const query = `INSERT INTO ${this.tableName} (title, link, pubDate, description, creationDate, isFavorite) VALUES (?, ?, ?, ?, datetime(), 0)`;
        return await this.executeInsert(query, news.title, news.link, news.pubDate, news.description);
    }

    async update(id: number, news: NewsItem): Promise<boolean> {
        const query = `UPDATE ${this.tableName} SET title = ?, link = ?, pubDate = ?, description = ? WHERE id = ?`;
        return await this.executeUpdateOrDelete(query, news.title, news.link, news.pubDate, news.description, id);
    }

    /**
     * Convenience wrapper for {@link addNews} and {@link updateNews}.
     * 
     * @param news A {@link NewsItem} object which will be saved.
     * @returns true if saving {@link news} was successful; otherwise false.
     */
    async save(news: NewsItem): Promise<boolean> {
        if (typeof news.id === "undefined") {
            return await this.add(news); 
        }
        return await this.update(news.id, news)
    }

    async delete(id: number): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        return await this.executeUpdateOrDelete(query, id);
    }

    async findSingleBy(criteria: Partial<NewsItem>): Promise<NewsItem | null> {
        const result = this.buildQueryFromCriteria(criteria);
        return await this.executeSingleFind<NewsItem>(result.query, result.values);
    }

    async all(criteria?: Partial<NewsItem>): Promise<NewsItem[]> {
        if (criteria) {
            const result = this.buildQueryFromCriteria(criteria)
            return await this.executeMultiFind<NewsItem>(result.query, result.values);
        }
        const query = `SELECT * FROM ${this.tableName}`;
        return await this.executeMultiFind<NewsItem>(query);
    }
}
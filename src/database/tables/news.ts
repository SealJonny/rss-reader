import { Database } from "sqlite";
import { DbTable } from "../db-table";
import { NewsItem } from "../../interfaces/news-item";
import { sha256 } from "../utils/sha256";

export class News extends DbTable<NewsItem> {
  constructor(dbConnection: Database, tableName: string) {
    super(dbConnection, tableName);
  }

  async add(news: NewsItem): Promise<NewsItem | undefined> {
    const query = `INSERT INTO ${this.tableName} (title, link, pubDate, description, creationDate, isFavorite, hash, rss_feed_id) VALUES (?, ?, ?, ?, datetime(), 0, ?, ?)`;
    return await this.executeInsert(query, news.title, news.link, news.pubDate, news.description, sha256(news), news.rssFeedId);
  }

  async update(id: number, news: NewsItem): Promise<NewsItem | undefined> {
    const query = `UPDATE ${this.tableName} SET title = ?, link = ?, pubDate = ?, description = ?, isFavorite = ?, hash = ?) WHERE id = ?`;
    return await this.executeUpdate(query, news.title, news.link, news.pubDate, news.description, news.isFavorite, sha256(news), id);
  }

  async setFavorite(id: number, isFavorite: boolean): Promise<NewsItem | undefined> {
    const query = `UPDATE ${this.tableName} SET isFavorite = ? WHERE id = ?`;
    return await this.executeUpdate(query, isFavorite, id);
  }

  /**
   * Convenience wrapper for {@link addNews} and {@link updateNews}.
   *
   * @param news A {@link NewsItem} object which will be saved.
   * @returns true if saving {@link news} was successful; otherwise false.
   */
  async save(news: NewsItem): Promise<NewsItem | undefined> {
    if (typeof news.id === "undefined") {
      return await this.add(news);
    }
    return await this.update(news.id, news)
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    return await this.executeDelete(query, id);
  }

  async findBy(criteria: Partial<NewsItem>): Promise<NewsItem | undefined> {
    const result = this.buildQueryFromCriteria(criteria);
    return await this.executeSingleFind(result.query, result.values);
  }

  async all(criteria?: Partial<NewsItem>): Promise<NewsItem[]> {
    if (criteria) {
      const result = this.buildQueryFromCriteria(criteria)
      return await this.executeMultiFind(result.query, result.values);
    }
    const query = `SELECT * FROM ${this.tableName}`;
    return await this.executeMultiFind(query);
  }
}
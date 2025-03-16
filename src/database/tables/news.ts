import { Database } from "sqlite";
import { DbTable } from "../db-table";
import { NewsItem } from "../../interfaces/news-item";
import { sha256 } from "../utils/sha256";

export class News extends DbTable<NewsItem> {
  constructor(dbConnection: Database, tableName: string) {
    super(dbConnection, tableName);
  }

  private sanitize(news: NewsItem | undefined): NewsItem | undefined {
    if (news)
      news.isFavorite = Boolean(news.isFavorite)
    return news;
  }

  private sanitizeArray(newsList: NewsItem[]): NewsItem[] {
    return newsList.map(n => {
      if (n)
        n.isFavorite = Boolean(n.isFavorite)
      return n;
    });
  }

  async add(news: NewsItem): Promise<NewsItem | undefined> {
    const query = `
      INSERT INTO ${this.tableName}
      (title, link, description, creationDate, hash, isFavorite, source, pubDate, rssFeedId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return this.sanitize(await this.executeInsert(
      query,
      news.title,
      news.link,
      news.description,
      Date.now(),
      sha256(news),
      0,
      news.source,
      news.pubDate,
      news.rssFeedId
    ));
  }

  async update(id: number, news: NewsItem): Promise<NewsItem | undefined> {
    const query = `
      UPDATE ${this.tableName}
      SET title = ?, link = ?, description = ?, hash = ?, isFavorite = ?, source = ?, pubDate = ?
      WHERE id = ?
    `;
    return this.sanitize(await this.executeUpdate(query,
      news.title,
      news.link,
      news.description,
      sha256(news),
      Number(news.isFavorite),
      news.source,
      news.pubDate,
      id
    ));
  }

  async setFavorite(id: number, isFavorite: boolean): Promise<NewsItem | undefined> {
    const query = `
      UPDATE ${this.tableName}
      SET isFavorite = ?
      WHERE id = ?
    `;
    return this.sanitize(await this.executeUpdate(query, Number(isFavorite), id));
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
    const query = `
      DELETE
      FROM ${this.tableName}
      WHERE id = ?
    `;
    return await this.executeDelete(query, id);
  }

  async findBy(criteria: Partial<NewsItem>): Promise<NewsItem | undefined> {
    const result = this.buildQueryFromCriteria(criteria);
    return this.sanitize(await this.executeSingleFind(result.query, result.values));
  }

  async all(criteria?: Partial<NewsItem>): Promise<NewsItem[]> {
    if (criteria) {
      const result = this.buildQueryFromCriteria(criteria)
      return this.sanitizeArray(await this.executeMultiFind(result.query, result.values));
    }
    const query = `
      SELECT *
      FROM ${this.tableName}
    `;
    return this.sanitizeArray(await this.executeMultiFind(query));
  }
}
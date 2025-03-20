import { Database } from "sqlite";
import { DbTable } from "../db-table";
import { NewsItem } from "../../interfaces/news-item";
import { sha256 } from "../utils/sha256";
import { DatabaseError, EntityDeleteError, EntityMultiCreateError, EntityUpdateError, QueryInvalidError } from "../../errors/database";
import { queryObjects } from "v8";

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

  async addAll(newsItems: NewsItem[]) {
    if (newsItems.length === 0) return false;

    const placeholders = newsItems.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    const query = `
      INSERT INTO ${this.tableName}
      (title, link, description, creationDate, hash, isFavorite, source, pubDate, rssFeedId)
      VALUES ${placeholders}
    `;
    const values = newsItems.flatMap(news => [news.title, news.link, news.description, Date.now(), sha256(news), 0, news.source, news.pubDate, news.rssFeedId]);

    try {
      await this.dbConnection.run("BEGIN TRANSACTION");
      await this.dbConnection.run(query, values);
      await this.dbConnection.run("COMMIT");
    } catch (error) {
      await this.dbConnection.run("ROLLBACK");
      throw EntityMultiCreateError.from(error, this.tableName);
    }
  }

  /**
   * Update a {@link NewsItem}
   *
   * @param id Id of the {@link NewsItem}
   * @param news
   * @returns The updated {@link NewsItem}
   * @throws {EntityUpdateError}
   */
  async update(id: number, news: NewsItem): Promise<NewsItem | undefined> {
    const query = `
      UPDATE ${this.tableName}
      SET title = ?, link = ?, description = ?, hash = ?, isFavorite = ?, source = ?, pubDate = ?
      WHERE id = ?
    `;
    return this.sanitize(await this.executeUpdate(
      id,
      query,
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
    return this.sanitize(await this.executeUpdate(
      id,
      query,
      Number(isFavorite),
      id
    ));
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

  /**
   * Delete a single {@link NewsItem}
   *
   * @param id Id of the {@link NewsItem}
   * @returns true if delete operation was successfull; otherwise false
   * @throws {EntityDeleteError} If deleting fails
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
   * Delete all {@link NewsItem} which are older than 1 day
   *
   * @throws {EntityDeleteError} If deleting fails
   */
  async deleteAllOlderThanOneDay() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const query = `
      DELETE
      FROM ${this.tableName}
      WHERE creationDate <= ?
    `;
    try {
      await this.dbConnection.run("BEGIN TRANSACTION");
      await this.executeDelete(query, oneDayAgo);
      await this.dbConnection.run("COMMIT");
    } catch (error) {
      await this.dbConnection.run("ROLLBACK");
      throw error;
    }
  }

  /**
   * Retrieve a single {@link NewsItem} which matches the specified criteria
   *
   * @param criteria Search criteria
   * @returns A {@link NewsItem} which matches the criteria or undefined
   * @throws {QueryInvalidError} If criteria is an empty object
   * @throws {DatabaseError} If request fails
   */
  async findBy(criteria: Partial<NewsItem>): Promise<NewsItem | undefined> {
    const result = this.buildQueryFromCriteria(criteria);
    return this.sanitize(await this.executeSingleFind(result.query, result.values));
  }

  /**
   * Retrieve a list of {@link NewsItem} where each matches the specified criteria
   *
   * @param criteria Search criteria
   * @returns A list of {@link NewsItem}
   * @throws {QueryInvalidError} If criteria is an empty object
   * @throws {DatabaseError} If request fails
   */
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
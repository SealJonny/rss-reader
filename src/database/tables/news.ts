import { Database } from "sqlite";
import { DbTable } from "../db-table";
import { NewsItem } from "../../interfaces/news-item";
import { sha256 } from "../utils/sha256";
import { EntityMultiCreateError, EntityMultiUpdateError } from "../../errors/database";

/**
 * Database table manager for news items
 */
export class News extends DbTable<NewsItem> {
  constructor(dbConnection: Database, tableName: string) {
    super(dbConnection, tableName);
  }

  /**
   * Fixes boolean fields in a news item that might be stored as numbers
   * @param news News item to sanitize
   * @returns Sanitized news item or undefined
   */
  private sanitize(news: NewsItem | undefined): NewsItem | undefined {
    if (news) {
      news.isFavorite = Boolean(news.isFavorite);
      news.isProcessed = Boolean(news.isProcessed);
    }
    return news;
  }

  /**
   * Fixes boolean fields in an array of news items
   * @param newsList Array of news items to sanitize
   * @returns Array of sanitized news items
   */
  private sanitizeArray(newsList: NewsItem[]): NewsItem[] {
    return newsList.map(n => {
      if (n) {
        n.isFavorite = Boolean(n.isFavorite);
        n.isProcessed = Boolean(n.isProcessed);
      }
      return n;
    });
  }

  /**
   * Adds a single news item to the database
   * @param news News item to add
   * @returns The added news item with ID or undefined if insertion failed
   */
  async add(news: NewsItem): Promise<NewsItem | undefined> {
    const query = `
      INSERT INTO ${this.tableName}
      (title, link, description, creationDate, hash, isFavorite, source, pubDate, isProcessed, rssFeedId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      0,
      news.rssFeedId
    ));
  }

  /**
   * Adds multiple news items to the database in a single transaction
   * @param newsItems Array of news items to add
   * @returns True if operation was successful
   * @throws {EntityMultiCreateError} If the batch insert fails
   */
  async addAll(newsItems: NewsItem[]) {
    if (newsItems.length === 0) return false;

    const placeholders = newsItems.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    const query = `
      INSERT OR IGNORE INTO ${this.tableName}
      (title, link, description, creationDate, hash, isFavorite, source, pubDate, isProcessed, rssFeedId)
      VALUES ${placeholders}
    `;
    const values = newsItems.flatMap(news => [
      news.title,
      news.link,
      news.description,
      Date.now(),
      sha256(news),
      0,
      news.source,
      news.pubDate,
      0,
      news.rssFeedId
    ]);

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
   * Updates an existing news item in the database
   * @param id ID of the news item to update
   * @param news News item data to update
   * @returns The updated news item or undefined if update failed
   * @throws {EntityUpdateError} If the update operation fails
   */
  async update(id: number, news: NewsItem): Promise<NewsItem | undefined> {
    const query = `
      UPDATE ${this.tableName}
      SET title = ?, link = ?, description = ?, hash = ?, isFavorite = ?, source = ?, pubDate = ?, isProcessed = ?
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
      news.isProcessed,
      id
    ));
  }

  /**
   * Updates the processed status of a news item
   * @param id ID of the news item
   * @param isProcessed New processed status
   * @returns The updated news item or undefined if update failed
   */
  async setProcessed(id: number, isProcessed: boolean): Promise<NewsItem | undefined> {
    if (isNaN(id)) {
      return;
    }
    const query = `
      UPDATE ${this.tableName}
      SET isProcessed = ?
      WHERE id = ?
    `;
    return this.sanitize(await this.executeUpdate(
      id,
      query,
      Number(isProcessed),
      id
    ));
  }

  /**
   * Updates the processed status of multiple news items in a single transaction
   * @param ids Array of news item IDs to update
   * @param isProcessed New processed status
   * @throws {EntityMultiUpdateError} If the batch update fails
   */
  async setProcessedBatch(ids: number[], isProcessed: boolean): Promise<void> {
    ids = ids.filter(i => !isNaN(i));
    if (ids.length === 0) {
      return;
    }

    const idsString = ids.map(() => "?").join(", ");
    const query = `
      UPDATE ${this.tableName}
      SET isProcessed = ?
      WHERE id IN (${idsString})
    `;

    const values = [Number(isProcessed), ...ids];

    try {
      await this.dbConnection.run("BEGIN TRANSACTION");
      await this.dbConnection.run(query, values);
      await this.dbConnection.run("COMMIT");
    } catch (error) {
      await this.dbConnection.run("ROLLBACK");
      throw EntityMultiUpdateError.from(error, this.tableName);
    }
  }

  /**
   * Updates the favorite status of a news item
   * @param id ID of the news item
   * @param isFavorite New favorite status
   * @returns The updated news item or undefined if update failed
   */
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
   * Convenience wrapper for add and update methods
   * @param news News item to save
   * @returns The saved news item or undefined if operation failed
   */
  async save(news: NewsItem): Promise<NewsItem | undefined> {
    if (typeof news.id === "undefined") {
      return await this.add(news);
    }
    return await this.update(news.id, news);
  }

  /**
   * Deletes a news item from the database
   * @param id ID of the news item to delete
   * @returns True if deletion was successful, false otherwise
   * @throws {EntityDeleteError} If the delete operation fails
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
   * Deletes all non-favorite news items that are older than one day
   * @throws {EntityDeleteError} If the delete operation fails
   */
  async deleteAllOlderThanOneDay() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const query = `
      DELETE
      FROM ${this.tableName}
      WHERE creationDate <= ? AND isFavorite = 0
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
   * Finds a news item by specified criteria
   * @param criteria Object containing field-value pairs to search for
   * @returns Matching news item or undefined if not found
   * @throws {QueryInvalidError} If criteria is an empty object
   * @throws {DatabaseError} If the query execution fails
   */
  async findBy(criteria: Partial<NewsItem>): Promise<NewsItem | undefined> {
    const result = this.buildQueryFromCriteria(criteria);
    return this.sanitize(await this.executeSingleFind(result.query, result.values));
  }

  /**
   * Retrieves all news items, optionally filtered by criteria
   * @param criteria Optional criteria to filter news items
   * @returns Array of news items
   * @throws {QueryInvalidError} If criteria is an empty object
   * @throws {DatabaseError} If the query execution fails
   */
  async all(criteria?: Partial<NewsItem>): Promise<NewsItem[]> {
    if (criteria) {
      const result = this.buildQueryFromCriteria(criteria);
      return this.sanitizeArray(await this.executeMultiFind(result.query, result.values));
    }
    const query = `
      SELECT *
      FROM ${this.tableName}
    `;
    return this.sanitizeArray(await this.executeMultiFind(query));
  }
}

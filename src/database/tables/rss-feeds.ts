import { Database } from "sqlite";
import { DbTable } from "../db-table";
import { RssFeed } from "../../interfaces/rss-feed";

/**
 * Database table manager for RSS feed entities
 */
export class RssFeeds extends DbTable<RssFeed> {
  constructor(dbConnection: Database, tableName: string) {
    super(dbConnection, tableName);
  }

  /**
   * Adds a new RSS feed to the database
   * @param rssFeed RSS feed to add
   * @returns The added RSS feed with ID or undefined if insertion failed
   */
  public async add(rssFeed: RssFeed): Promise<RssFeed | undefined> {
    const query = `
      INSERT INTO ${this.tableName}
      (link, title, description, language, lastBuildDate) VALUES (?, ?, ?, ?, ?)
    `;
    return await this.executeInsert(
      query,
      rssFeed.link,
      rssFeed.title,
      rssFeed.description,
      rssFeed.language,
      rssFeed.lastBuildDate
    );
  }

  /**
   * Updates an existing RSS feed in the database
   * @param id ID of the RSS feed to update
   * @param rssFeed RSS feed data to update
   * @returns The updated RSS feed or undefined if update failed
   */
  public async update(id: number, rssFeed: RssFeed): Promise<RssFeed | undefined> {
    const query = `
      UPDATE ${this.tableName}
      SET link = ?, title = ?, description = ?, language = ?, lastBuildDate = ?
      WHERE id = ?
    `;
    return await this.executeUpdate(
      id,
      query,
      rssFeed.link,
      rssFeed.title,
      rssFeed.description,
      rssFeed.language,
      rssFeed.lastBuildDate,
      id
    );
  }

  /**
   * Convenience wrapper for add and update methods
   * @param rssFeed RSS feed to save
   * @returns The saved RSS feed or undefined if operation failed
   */
  public async save(rssFeed: RssFeed): Promise<RssFeed | undefined> {
    if (typeof rssFeed.id === "undefined") {
      return await this.add(rssFeed);
    }
    return await this.update(rssFeed.id, rssFeed);
  }

  /**
   * Deletes an RSS feed from the database
   * @param id ID of the RSS feed to delete
   * @returns True if deletion was successful, false otherwise
   */
  public async delete(id: number): Promise<boolean>  {
    const query = `
      DELETE
      FROM ${this.tableName}
      WHERE id = ?
    `;
    return await this.executeDelete(query, id);
  }

  /**
   * Retrieves all RSS feeds from the database
   * @returns Array of all RSS feeds
   */
  public async all(): Promise<RssFeed[]> {
    const query = `
      SELECT *
      FROM ${this.tableName}
    `;
    return await this.executeMultiFind(query);
  }

  /**
   * Finds an RSS feed by specified criteria
   * @param criteria Object containing field-value pairs to search for
   * @returns Matching RSS feed or undefined if not found
   */
  public async findBy(criteria: Partial<RssFeed>): Promise<RssFeed | undefined> {
    const result = this.buildQueryFromCriteria(criteria);
    return await this.executeSingleFind(result.query, result.values);
  }
}
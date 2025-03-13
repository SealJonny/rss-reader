import { Database } from "sqlite";
import { DbTable } from "../db-table";
import { RssFeed } from "../../interfaces/rss-feed";

export class RssFeeds extends DbTable<RssFeed> {
  constructor(dbConnection: Database, tableName: string) {
    super(dbConnection, tableName);
  }

  public async add(rssFeed: RssFeed): Promise<RssFeed | undefined> {
    const query = `
      INSERT INTO ${this.tableName}
      (link, title, description, language, lastBuildDate) VALUES (?, ?, ?, ?, ?)
    `;
    return await this.executeInsert(query, rssFeed.link, rssFeed.title, rssFeed.description, rssFeed.language, rssFeed.lastBuildDate);
  }

  public async update(id: number, rssFeed: RssFeed): Promise<RssFeed | undefined> {
    const query = `
      UPDATE ${this.tableName}
      SET link = ?, title = ?, description = ?, language = ?, lastBuildDate = ?
      WHERE id = ?
    `;
    return await this.executeUpdate(query, rssFeed.link, rssFeed.title, rssFeed.description, rssFeed.language, rssFeed.lastBuildDate, id);
  }

  public async save(rssFeed: RssFeed): Promise<RssFeed | undefined> {
    if (typeof rssFeed.id === "undefined") {
      return await this.add(rssFeed);
    }
    return await this.update(rssFeed.id, rssFeed);
  }

  public async delete(id: number): Promise<boolean>  {
    const query = `
      DELETE
      FROM ${this.tableName}
      WHERE id = ?
    `;
    return await this.executeDelete(query, id);
  }

  public async all(): Promise<RssFeed[]> {
    const query = `
      SELECT *
      FROM ${this.tableName}
    `;
    return await this.executeMultiFind(query);
  }

  public async findBy(criteria: Partial<RssFeed>): Promise<RssFeed | undefined> {
    const result = this.buildQueryFromCriteria(criteria);
    return await this.executeSingleFind(result.query, result.values);
  }
}
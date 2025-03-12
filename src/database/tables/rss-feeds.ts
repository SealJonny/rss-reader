import { Database } from "sqlite";
import { DbTable } from "./db-table";
import { RssFeed } from "../../interfaces/rss-feed";

export class RssFeeds extends DbTable {
  constructor(dbConnection: Database, tableName: string) {
    super(dbConnection, tableName);
  }

  public async add(rssFeed: RssFeed): Promise<boolean> {
    const query = `INSERT INTO ${this.tableName} (link) VALUES (?)`;
    return await this.executeInsert(query, rssFeed.link);
  }

  public async update(id: number, rssFeed: RssFeed): Promise<boolean> {
    const query = `UPDATE ${this.tableName} SET link = ? WHERE id = ?`;
    return await this.executeUpdateOrDelete(query, rssFeed.link, id);
  }

  public async save(rssFeed: RssFeed): Promise<boolean> {
    if (typeof rssFeed.id === "undefined") {
      return await this.add(rssFeed);
    }
    return await this.update(rssFeed.id, rssFeed);
  }

  public async delete(id: number): Promise<boolean>  {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    return await this.executeUpdateOrDelete(query, id);
  }

  public async all(): Promise<RssFeed[]> {
    const query = `SELECT * FROM ${this.tableName}`;
    return await this.executeMultiFind<RssFeed>(query);
  }
}
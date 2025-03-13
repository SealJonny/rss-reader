import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { Categories } from "./tables/categories";
import { News } from "./tables/news";
import { NewsCategories } from "./tables/news-categories";
import { RssFeeds } from "./tables/rss-feeds";
import { DatabaseConnectionError } from "../errors/database";

export class Db {
  public categories!: Categories;
  public news!: News;
  public join!: NewsCategories;
  public rssFeeds!: RssFeeds;

  public async initialize(): Promise<void> {
    let db: Database;
    try {
      db = await open({
        filename: "database.sqlite",
        driver: sqlite3.Database
      });
    } catch (error) {
      throw DatabaseConnectionError.from(error);
    }

    this.categories = new Categories(db, "categories");
    this.news = new News(db, "news");
    this.join = new NewsCategories(db, "news_categories");
    this.rssFeeds = new RssFeeds(db, "rss_feeds");

    await this.initTables(db);
  }

  private async initTables(db: Database): Promise<void> {
    const categories = `
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
    `;

    const rss_feeds = `
      CREATE TABLE IF NOT EXISTS rss_feeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        link TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        language TEXT,
        lastBuildDate INTEGER
      );
    `;

    const news = `
      CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        description TEXT NOT NULL,
        creationDate INTEGER NOT NULL,
        hash TEXT NOT NULL,
        isFavorite INTEGER NOT NULL,
        source TEXT,
        pubDate TEXT,
        rssFeedId INTEGER,
        FOREIGN KEY (rssFeedId) REFERENCES rss_feeds(id) ON DELETE CASCADE
      );
    `;

    const news_categories = `
        CREATE TABLE IF NOT EXISTS news_categories (
          categoryId INTEGER,
          newsId INTEGER,
          PRIMARY KEY (categoryId, newsId),
          FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
          FOREIGN KEY (newsId) REFERENCES news(id) ON DELETE CASCADE
        );
    `;

    // Activate foreign keys integrity
    db.exec("PRAGMA foreign_keys = ON;");
    await db.exec(categories);
    await db.exec(rss_feeds);
    await db.exec(news);
    await db.exec(news_categories);
  }
}

const db = new Db();
export default db;
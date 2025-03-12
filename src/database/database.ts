import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { Categories } from "./tables/categories";
import { News } from "./tables/news";
import { NewsCategories } from "./tables/news-categories";
import { RssFeeds } from "./tables/rss-feeds";

/////////////
// General //
/////////////
export class Db {
    public categories!: Categories;
    public news!: News;
    public join!: NewsCategories;
    public rssFeeds!: RssFeeds;

    public async initialize(): Promise<void> {
        const db = await open({
            filename: "database.sqlite",
            driver: sqlite3.Database
        });
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
                name TEXT NOT NULL
            );
        `;

        const news = `
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                link TEXT,
                pubDate TEXT,
                description TEXT,
                creationDate TEXT,
                isFavorite INTEGER,
                hash TEXT
            );
        `;

        const categories_news = `
            CREATE TABLE IF NOT EXISTS news_categories (
                category_id INTEGER,
                news_id INTEGER,
                PRIMARY KEY (category_id, news_id),
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
            );
        `;

        const rss_feeds = `
            CREATE TABLE IF NOT EXISTS rss_feeds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                link TEXT NOT NULL
            );
        `;

        // Activate foreign keys integrity
        db.exec("PRAGMA foreign_keys = ON;");
        await db.exec(categories);
        await db.exec(news);
        await db.exec(categories_news);
        await db.exec(rss_feeds);
    }
}

const db = new Db();
export default db;
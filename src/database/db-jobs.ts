import EventEmitter from "events";
import { fetchRss } from "../xml/rss";
import db from "./database";

export class DbJobs extends EventEmitter {
  /**
   * Fetches all news from RSS feeds (saved in the database) and inserts them into the database
   *
   * @emits complete
   * @throws {EntityMultiCreateError} If inserting into database fails
   */
  async insertAllNews() {
    const feeds = await db.rssFeeds.all();
    const result = await Promise.all(feeds.map(async f => {
      const news = await fetchRss(f);
      return news;
    }));
    const allNews = result.flat();
    await db.news.addAll(allNews);
    this.emit("complete");
  }

  async categoriesAllNews() {

  }
}

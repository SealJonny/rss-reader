import { fetchRss } from "../xml/rss";
import db from "./database";

export async function insertAllNews() {
  const feeds = await db.rssFeeds.all();
  feeds.forEach(async f => {
    const news = await fetchRss(f.link);
    if (news === null) {
      throw new Error(`Error while fetching news for ${f.link}`);
    }


  });
}

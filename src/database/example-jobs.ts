import { RssFeed } from "../interfaces/rss-feed";
import db from "./database";
import { DbJobs } from "./db-jobs";

async function insertExample() {
  let feed: RssFeed = {
    title: "test",
    link: "https://news.google.com/rss/search?q=Technology&hl=de&gl=DE&ceid=DE:de",
    description: "",
    language: null,
    lastBuildDate: null,
  }
  try {
    await db.rssFeeds.add(feed);
  } catch (error) {}

  const jobs = new DbJobs();
  jobs.on("complete", () => console.log("complete"));
  await jobs.insertAllNews();
}

async function main() {
  await db.initialize();
  await insertExample();
  let test = await db.news.setFavorite(1, true);
  test = await db.news.setProcessed(1, true);

  await db.news.deleteAllOlderThanOneDay();
}

main().catch(e => console.log(e));

import { categoriseNewsItems } from "../ai/categorise-newsitem";
import { NewsItem } from "../interfaces/news-item";
import { RssFeed } from "../interfaces/rss-feed";
import db from "./database";
import { DbJobs } from "./db-jobs";

async function insertExample() {
  let feed: RssFeed = {
    title: "test",
    link: "https://news.google.com/rss/search?q=Technology&hl=de&gl=DE&ceid=DE:de",
    //link: "https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml",
    description: "",
    language: null,
    lastBuildDate: null,
  }
  try {
    await db.rssFeeds.add(feed);
  } catch (error) {}

  const jobs = new DbJobs();
  await jobs.insertAllNews();
}

async function main() {
  await db.initialize();
  ["Wirtschaft", "Technik", "Politik"].forEach(async s => await db.categories.save({id: undefined, name: s}));
  const jobs = new DbJobs();
  await insertExample();
  await jobs.categoriseAllNews();
  // let test = await db.news.setFavorite(1, true);
  // test = await db.news.setProcessed(1, true);
  //
  // await db.news.deleteAllOlderThanOneDay();
  // let news = await db.news.all();
  // news.splice(10);
  // let catNames = (await db.categories.all()).map(c => c.name);
  // const result = await categoriseNewsItems(news,catNames);
  // news.forEach((n, index) => {
  //   let cats = result[index + 1];
  //   console.log(n.title, cats);
  // });
}

main().catch(e => console.log(e));

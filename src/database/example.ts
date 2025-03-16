import db from "./database";
import { NewsItem } from "../interfaces/news-item";
import { sha256 } from "./utils/sha256";
import { RssFeed } from "../interfaces/rss-feed";

async function main() {
    await db.initialize();

    // Create multiple categories
    ["Wirtschaft", "Technik", "Politik"].forEach(async s => await db.categories.save({id: undefined, name: s}));
    console.log(await db.categories.all());

    let feed: RssFeed = {
      title: "Test",
      link: "ahsdfkaslfjalskjföal",
      description: "Test Rssfeed",
      language: "de",
      lastBuildDate: Date.now()
    };
    feed = await db.rssFeeds.save(feed) ?? feed;

    // Create single news
    let news: NewsItem = {
      title: "Hello",
      link: "https://nextcloudfritsch.dedyn.io",
      source: null,
      pubDate: "17.02.2025",
      description: "World",
      isFavorite: true,
      creationDate: 0,
      hash: "",
      rssFeedId: 1
    };
    news = await db.news.save(news) ?? news;

    // Find single news
    let found = await db.news.findBy({id: news.id});

    let business = await db.categories.findBy({name: "Wirtschaft"});
    if (await db.join.addCategoryToNews(found?.id!, business?.id!)) {
        console.log("Successfully inserted an n:m relationship!")
    }

    found = await db.news.setFavorite(found!.id!, true);

    // Deleting a NewsItem from db, also removes referenced entries in join table
    console.log("First", await db.join.getNewsForCategory(business?.id!));
    //db.news.delete(found?.id!);
    console.log("Second", await db.join.getNewsForCategory(business?.id!));
}

main().catch(e => console.error(e));
import db from "./database";
import { NewsItem } from "../interfaces/news-item";
import { sha256 } from "./utils/sha256";
import { RssFeed } from "../interfaces/rss-feed";

async function main() {
    await db.initialize();

    // Create multiple categories
    ["Wirtschaft", "Technik", "Politik"].forEach(async s => await db.categories.save({id: undefined, name: s}));

    let feed: RssFeed = {name: "Test", link: "ahsdfkaslfjalskjföal"};
    feed = await db.rssFeeds.save(feed) ?? feed;

    // Create single news
    let news: NewsItem = {title: "Hello", link: "https://nextcloudfritsch.dedyn.io", pubDate: "17.02.2025", description: "World", isFavorite: false, rssFeedId: 1}
    news = await db.news.save(news) ?? news;

    // Find single news
    let found = await db.news.findBy({id: 1});

    let business = await db.categories.findBy({name: "Wirtschaft"});
    if (await db.join.addCategoryToNews(found?.id!, business?.id!)) {
        console.log("Successfully inserted an n:m relationship!")
    }

    console.log("First", await db.join.getNewsForCategory(business?.id!));
    db.news.delete(found?.id!);
    console.log("Second", await db.join.getNewsForCategory(business?.id!));
    if (found)
      console.log(sha256(found));
    else
      console.log("no");
}

main().catch(e => console.error(e));
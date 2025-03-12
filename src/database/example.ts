import db from "./database";
import { NewsItem } from "../interfaces/news-item";
import { sha256 } from "./utils/sha256";
import { RssFeedEmptyError, RssFeedNotFoundError } from "../errors/rss-feed";

async function main() {
    await db.initialize();

    // Create multiple categories
    ["Wirtschaft", "Technik", "Politik"].forEach(async s => await db.categories.save({id: undefined, name: s}));

    // Create single news
    let news: NewsItem = {id: undefined, title: "Hello", link: "https://nextcloudfritsch.dedyn.io", pubDate: "17.02.2025", description: "World"}
    if (await db.news.save(news)) {
        console.log("success");
    }

    // Find single news
    let found = await db.news.findSingleBy({id: 1});
    console.log(found);

    let business = await db.categories.findSingleBy({name: "Wirtschaft"});
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

    try {
      throw new RssFeedEmptyError("tst msg", "hhtpps");
    } catch(err) {
      if (err instanceof RssFeedEmptyError) {
        console.log(err.message, err.link);
      }
    }
}

main().catch(e => console.error(e));
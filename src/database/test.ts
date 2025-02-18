import db from "./database";
import { Category } from "../interfaces/category";
import { NewsItem } from "../interfaces/news-item";

async function main() {
    await db.initialize();
    let cat: Category = {id: undefined, name: "Hello"};
    await db.categories.save(cat);

    let news: NewsItem = {id: undefined, title: "Hello", link: "https://nextcloudfritsch.dedyn.io", pubDate: "17.02.2025", description: "World"}
    await db.news.save(news);

    let foundNews = await db.news.findSingleBy({title: "Hello"});
    console.log(await db.categories.findSingleBy({name: "Hello"}));

    // await db.addCategoryToNews(foundNews?.id!, 1);
    // console.log(foundNews);
    // console.log(await db.getNewsForCategory(1));
}

main().catch(e => console.error(e));
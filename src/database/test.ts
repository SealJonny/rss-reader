import db from "./database";
import { Category } from "../interfaces/category";
import { NewsItem } from "../interfaces/news-item";

async function main() {
    await db.initTables();
    let cat: Category = {id: undefined, name: "Hello"};
    await db.saveCategory(cat);

    let news: NewsItem = {id: undefined, title: "Hello", link: "https://nextcloudfritsch.dedyn.io", pubDate: "17.02.2025", description: "World"}
    await db.saveNews(news);

    let foundNews = await db.findSingleNewsBy({title: "Hello"});
    console.log(await db.findSingleCategoryBy({name: "Hello"}));

    await db.addCategoryToNews(foundNews?.id!, 1);
    console.log(foundNews);
    console.log(await db.getNewsForCategory(1));
}

main().catch(e => console.error(e));
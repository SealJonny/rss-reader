import db from "./database";
import { NewsItem } from "../interfaces/news-item";

async function main() {
    await db.initialize();

    ["Wirtschaft", "Technik", "Politik"].forEach(async s => await db.categories.save({id: undefined, name: s}));

    let news: NewsItem = {id: undefined, title: "Hello", link: "https://nextcloudfritsch.dedyn.io", pubDate: "17.02.2025", description: "World"}
    await db.news.save(news);

    let foundNews = await db.news.findSingleBy({title: "Hello"});
    console.log(await db.categories.findSingleBy({name: "Hello"}));

    let writ = await db.categories.findSingleBy({name: "Wirtschaft"});
    await db.join.addCategoryToNews(foundNews?.id!, writ?.id!);

    console.log(foundNews);
    console.log(await db.join.getNewsForCategory(1));
    console.log();

    console.log(await db.join.getCategoriesForNews(foundNews?.id!));
}

main().catch(e => console.error(e));
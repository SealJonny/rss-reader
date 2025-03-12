import { JSDOM } from "jsdom";
import { NewsItem } from "../interfaces/news-item";

export async function fetchRss(url: string): Promise<NewsItem[]> {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const dom = new JSDOM(text, { contentType: "text/xml" });
        const document = dom.window.document;

        // Query all news in xml
        const items = document.querySelectorAll("item");
        let news: NewsItem[] = [];

        items.forEach(item => {
            const description = item.querySelector("description")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "";

            // Parse description html content
            const tempDom = new JSDOM(description);
            const anchor = tempDom.window.document.querySelector("a");
            const fullArticleLink = anchor ? anchor.href : link;

            news.push({
                title: item.querySelector("title")?.textContent || "",
                link: fullArticleLink,
                pubDate: item.querySelector("pubDate")?.textContent || "",
                description: tempDom.window.document.body.textContent?.trim() || ""
            });
        });

        return news;
    } catch (error) {
        return [];
    }
}
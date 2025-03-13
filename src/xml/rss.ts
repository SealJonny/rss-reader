import { JSDOM } from "jsdom";
import { NewsItem } from "../interfaces/news-item";

export async function fetchRss(url: string): Promise<NewsItem[] | null> {
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
            tempDom.window.document.body.querySelectorAll("a")
            const anchor = tempDom.window.document.querySelector("a");
            const fullArticleLink = anchor ? anchor.href : link;

            news.push({
                title: item.querySelector("title")?.textContent || "",
                link: fullArticleLink,
                pubDate: item.querySelector("pubDate")?.textContent || "",
                source: null,
                description: tempDom.window.document.body.textContent?.trim() || "",
                isFavorite: false,
                rssFeedId: 0,
                creationDate: Date.now(),
                hash: "",
            });
        });

        return news;
    } catch (error) {
      return null;
    }
}

fetchRss("https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml").then(l => console.log(l));
fetchRss("https://news.google.com/rss/search?q=Technology&hl=de&gl=DE&ceid=DE:de").then(l => console.log(l));
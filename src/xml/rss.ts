import { JSDOM } from "jsdom";
import { NewsItem } from "../interfaces/news-item";
import { RssFeedEmptyError } from "../errors/rss-feed";
import { RssFeed } from "../interfaces/rss-feed";

export async function fetchRss(feed: RssFeed): Promise<NewsItem[] | null> {
    try {
        const response = await fetch(feed.link);
        const text = await response.text();
        const dom = new JSDOM(text, { contentType: "text/xml" });

        // Query all news in xml
        const channel = dom.window.document.querySelector("channel");
        if (!channel) {
          throw new RssFeedEmptyError("No channel tag found in response!", feed.link);
        }
        const items = channel.querySelectorAll("item");
        let news: NewsItem[] = [];
        items.forEach(item => {
            const link = item.querySelector("link")?.textContent || "";
            const title = item.querySelector("title")?.textContent || "";
            const source = item.querySelector("source")?.getAttribute("url") || null;
            const pubDate = item.querySelector("pubDate")?.textContent || null;

            let description = item.querySelector("description")?.textContent || "";
            let tempDom = new JSDOM(description);
            description = tempDom.window.document.body.textContent?.trim() || description;
            description = description.replace(/\s\s/g, " ");

            news.push({
              title: title,
              link: link,
              description: description,
              creationDate: 0,
              hash: "",
              isFavorite: false,
              source: source,
              pubDate: pubDate,
              rssFeedId: feed.id!
            });
        });

        return news;
    } catch (error) {
      return null;
    }
}

fetchRss({title: "h", description: "", language: "", lastBuildDate: 0,
  link: "https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml" }).then(l => console.log(l));
fetchRss({title: "h", description: "", language: "", lastBuildDate: 0,
  link: "https://news.google.com/rss/search?q=Technology&hl=de&gl=DE&ceid=DE:de" }).then(l => console.log(l));
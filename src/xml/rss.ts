import { JSDOM } from "jsdom";
import { NewsItem } from "../interfaces/news-item";
import { RssFeedEmptyError, RssFeedError, RssFeedInvalidError, RssFeedNotFoundError } from "../errors/rss-feed";
import { RssFeed } from "../interfaces/rss-feed";

function extractDescription(data: string | null | undefined): string | null {
  if (!data) return null;

  let dom = new JSDOM(data);
  let html = dom.window.document.body || dom.window.document;

  function extractText(node: Node): string {
    if (node.nodeType === 3) { // Text-Node
      return node.textContent?.trim() ?? "";
    }
    if (node.nodeType === 1) { // Element-Node
      return Array.from(node.childNodes)
        .map(extractText)
        .filter(text => text.length > 0)
        .join(" - ");
    }
    return "";
  }

  let result = extractText(html).trim();
  return result.length > 0 ? result : null;
}

function parseNewsItem(item: Element, feedId: number): NewsItem {
  const link = item.querySelector("link")?.textContent || "";
  const title = item.querySelector("title")?.textContent || "";
  const source = item.querySelector("source")?.getAttribute("url") || null;
  const pubDate = item.querySelector("pubDate")?.textContent || null;

  const descriptionXml = item.querySelector("description");
  const description = extractDescription(descriptionXml?.textContent) ?? descriptionXml?.textContent ?? "";

  return {
    title: title,
    link: link,
    description: description,
    creationDate: 0,
    hash: "",
    isFavorite: false,
    source: source,
    pubDate: pubDate,
    isProcessed: false,
    rssFeedId: feedId
  };
}

/**
 *
 * @param {RssFeed} feed Rss feed
 * @returns {Promise<NewsItem[] | null>} Fetched news from RSS feed
 * @throws {RssFeedInvalidError} If feed has no id
 * @throws {RssFeedNotFoundError} If the RSS link could not be found
 * @throws {RssFeedError} If fetching the RSS page failed for any other reason
 */
export async function fetchRss(feed: RssFeed): Promise<NewsItem[]> {
  if (typeof feed.id === "undefined") {
    throw new RssFeedInvalidError("RssFeed does not contain a valid id", feed.link);
  }

  const response = await fetch(feed.link);
  if (response.status === 404) {
    throw new RssFeedNotFoundError("RssFeed could not be found", feed.link);
  }

  if (!response.ok) {
    throw new RssFeedError("RssFeed could not be fetched", feed.link);
  }

  const text = await response.text();
  const dom = new JSDOM(text, { contentType: "text/xml" });

  const channel = dom.window.document.querySelector("channel");
  if (!channel) {
    throw new RssFeedInvalidError("No channel tag found in response!", feed.link);
  }

  const items = Array.from(channel.querySelectorAll("item"))
  let news = items.map(item => parseNewsItem(item, feed.id!));

  return news;
}
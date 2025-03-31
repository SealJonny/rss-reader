import { JSDOM } from "jsdom";
import { RssFeedInvalidError, RssFeedNotFoundError, RssFeedError } from "../errors/rss-feed";
import { NewsItem } from "../interfaces/news-item";
import { RssFeed } from "../interfaces/rss-feed";
import { parseHtmlToText, parseNewsItem } from "./parser";


/**
 * Fetches and parses news items from an RSS feed
 *
 * @param feed RSS feed to fetch from
 * @param signal AbortSignal to cancel the request
 * @returns Array of news items extracted from the feed
 * @throws {RssFeedInvalidError} If feed has no ID or the response is invalid
 * @throws {RssFeedNotFoundError} If the RSS link could not be found (404)
 * @throws {RssFeedError} If fetching the RSS page failed for any other reason
 */
export async function fetchRss(feed: RssFeed, signal: AbortSignal): Promise<NewsItem[]> {
  if (typeof feed.id === "undefined") {
    throw new RssFeedInvalidError("RssFeed does not contain a valid id", feed.link);
  }

  const response = await fetch(feed.link, { signal: signal });

  if (response.status === 404) {
    throw new RssFeedNotFoundError("RssFeed could not be found", feed.link);
  }

  if (!response.ok) {
    throw new RssFeedError("RssFeed could not be fetched", feed.link);
  }

  const text = await response.text();
  const dom = new JSDOM(text, { contentType: "application/rss+xml" });

  const channel = dom.window.document.querySelector("channel");
  if (!channel) {
    throw new RssFeedInvalidError("No channel tag found in response!", feed.link);
  }

  const lastBuildDateRaw = channel.querySelector("lastBuildDate")?.textContent;
  if (lastBuildDateRaw) {
    const time = new Date(lastBuildDateRaw).getTime() || null;
    feed.lastBuildDate = time;
  }

  const items = Array.from(channel.querySelectorAll("item"));
  let news = items.map(item => parseNewsItem(item, feed.id!));

  return news;
}

/**
 * Fetches and parses the content of a webpage
 *
 * @param news URL of the webpage to fetch
 * @returns Parsed plain text from the webpage or null if parsing fails
 * @throws {Error} If the webpage could not be found, or if the content type is not HTML
 */
export async function fetchWebpage(news: string): Promise<string | null> {
  const result = await fetch(news);
  if (result.status === 404) {
    throw new Error("Could not find a webpage at the specified url");
  }

  if (!result.ok) {
    throw new Error(`Fetching the webpage failed with status code ${result.status}`);
  }

  // Check if content type matches any of HTML related content type
  let contentType = result.headers.get("Content-Type")?.toLowerCase() || "";
  const semicolonIndex = contentType.indexOf(";");
  if (semicolonIndex !== -1) {
    contentType = contentType.slice(0, semicolonIndex);
  }

  if (!(contentType === "application/html" || contentType === "text/html" || contentType === "application/xhtml+xml")) {
      throw new Error(`Content-Type ${contentType} does not match 'application/html', 'text/html', 'application/xhtml+xml'`);
  }

  const text = await result.text();
  return parseHtmlToText(text);
}
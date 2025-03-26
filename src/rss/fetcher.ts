import { JSDOM } from "jsdom";
import { RssFeedInvalidError, RssFeedNotFoundError, RssFeedError } from "../errors/rss-feed";
import { NewsItem } from "../interfaces/news-item";
import { RssFeed } from "../interfaces/rss-feed";
import { parseNewsItem } from "./parser";


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
  const dom = new JSDOM(text, { contentType: "application/rss+xml" });

  const channel = dom.window.document.querySelector("channel");
  if (!channel) {
    throw new RssFeedInvalidError("No channel tag found in response!", feed.link);
  }

  const items = Array.from(channel.querySelectorAll("item"))
  let news = items.map(item => parseNewsItem(item, feed.id!));

  return news;
}

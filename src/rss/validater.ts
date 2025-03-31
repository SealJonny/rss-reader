import { JSDOM } from "jsdom";
import { parseHtmlToText } from "./parser";
import { RssFeedNotFoundError, RssFeedInvalidError } from "../errors/rss-feed";
import { RssFeed } from "../interfaces/rss-feed";

/**
 * Validates and retrieves metadata from an RSS feed URL
 *
 * @param link URL to the RSS feed to validate
 * @returns RssFeed object with metadata from the feed
 * @throws {RssFeedNotFoundError} If the URL returns a 404 status
 * @throws {RssFeedInvalidError} If the URL resolves but does not contain a valid RSS feed
 */
export async function validateRssFeed(link: string): Promise<RssFeed> {
  const result = await fetch(link);

  if (result.status === 404) {
    throw new RssFeedNotFoundError("Could not find a rss feed at the specified url", link);
  }

  if (!result.ok) {
    throw new RssFeedInvalidError(`Fetching the rss feed failed with status code ${result.status}`, link);
  }

  // Check if content type matches any of XML related content type
  let contentType = result.headers.get("Content-Type")?.toLowerCase() || "";
  const semicolonIndex = contentType.indexOf(";");
  if (semicolonIndex !== -1) {
    contentType = contentType.slice(0, semicolonIndex);
  }

  if (!(contentType === "application/xml" || contentType === "text/xml" || contentType === "application/rss+xml")) {
      throw new RssFeedInvalidError(`Content-Type ${contentType} does not match 'application/xml', 'text/xml', 'application/rss+xml'`, link);
  }

  // Parse XML data and check if the required channel tag is present
  const content = await result.text();
  const dom = new JSDOM(content, {contentType: "application/rss+xml"});
  const channel = dom.window.document.querySelector("channel");
  if (!channel) {
    throw new RssFeedInvalidError("No channel tag found in rss feed", link);
  }

  // Check if the required fields title and description are present
  const title = channel.querySelector("title")?.textContent;
  const description = parseHtmlToText(channel.querySelector("description")?.textContent);
  if (!description || !title) {
    throw new RssFeedInvalidError("No title or description found in rss feed", link);
  }

  const lastBuildDate = channel.querySelector("lastBuildDate")?.textContent;
  let lastBuildDateInMs: number | null = null;
  if (lastBuildDate) {
    lastBuildDateInMs = new Date(lastBuildDate).getTime() || null;
  }

  const language = channel.querySelector("language")?.textContent || null;

  const rssFeed: RssFeed = {
    title: title,
    link: link,
    description: description,
    language: language,
    lastBuildDate: lastBuildDateInMs
  };

  return rssFeed;
}

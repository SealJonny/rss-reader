import { JSDOM } from "jsdom";
import { NewsItem } from "../interfaces/news-item";

/**
 * Parses HTML content to plain text by removing unwanted elements
 * and extracting text from the DOM
 *
 * @param data HTML content as string
 * @returns Plain text content or null if parsing fails
 */
export function parseHtmlToText(data: string | null | undefined): string | null {
  if (!data) return null;

  let dom = new JSDOM(data, { contentType: "text/html"});

  dom.window.document.querySelectorAll("script, style").forEach(el => el.remove());

  let html = dom.window.document.body || dom.window.document;

  /**
   * Recursively extracts text from DOM nodes
   * @param node DOM node to extract text from
   * @returns Extracted text content
   */
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

/**
 * Parses an RSS item element into a NewsItem object
 *
 * @param item DOM element representing an RSS item
 * @param feedId ID of the RSS feed containing this item
 * @returns NewsItem object with parsed data
 */
export function parseNewsItem(item: Element, feedId: number): NewsItem {
  const link = item.querySelector("link")?.textContent || "";
  const title = item.querySelector("title")?.textContent || "";
  const source = item.querySelector("source")?.getAttribute("url") || null;
  const pubDate = item.querySelector("pubDate")?.textContent || null;
  let pubDateInMs: number | null = null;
  if (pubDate) {
    pubDateInMs = new Date(pubDate).getTime() || null;
  }

  const descriptionXml = item.querySelector("description");
  const description = parseHtmlToText(descriptionXml?.textContent) ?? descriptionXml?.textContent ?? "";

  return {
    title: title,
    link: link,
    description: description,
    creationDate: 0,
    hash: "",
    isFavorite: false,
    source: source,
    pubDate: pubDateInMs,
    isProcessed: false,
    rssFeedId: feedId
  };
}

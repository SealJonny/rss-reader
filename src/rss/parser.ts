import { JSDOM } from "jsdom"
import { NewsItem } from "../interfaces/news-item";

export function parseHtmlToText(data: string | null | undefined): string | null {
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

import { NewsItem } from "../../interfaces/news-item";
import * as crypto from "crypto";

/**
 * Generates a SHA-256 hash for a news item based on its key properties
 * Used to identify duplicate news items when importing feeds
 * 
 * @param item The news item to hash
 * @returns Hexadecimal SHA-256 hash string
 */
export function sha256(item: NewsItem) {
  const msg = item.title + item.description + item.link + item.pubDate;
  return crypto.createHash("sha256").update(msg).digest("hex");
}
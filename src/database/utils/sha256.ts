import { NewsItem } from "../../interfaces/news-item";
import * as crypto from "crypto";

export function sha256(item: NewsItem) {
  const msg = item.title + item.description + item.link + item.pubDate;
  return crypto.createHash("sha256").update(msg).digest("hex");
}
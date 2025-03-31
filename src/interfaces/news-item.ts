/**
 * Interface representing a news item from an RSS feed
 */
export interface NewsItem {
  /** Database ID of the news item (undefined for new items) */
  id?: number;
  /** Title of the news item */
  title: string;
  /** URL link to the full article */
  link: string;
  /** Description or content snippet of the news item */
  description: string;
  /** Timestamp when the item was added to the database */
  creationDate: number;
  /** SHA-256 hash used to identify duplicate entries */
  hash: string;
  /** Whether this item is marked as a favorite */
  isFavorite: boolean;
  /** Whether this item has been processed by the categorization algorithm */
  isProcessed: boolean,
  /** Source of the news item (typically the publisher name) */
  source: string | null;
  /** Publication date of the news item as timestamp */
  pubDate: number | null;
  /** Foreign key reference to the RSS feed source */
  rssFeedId: number;
}

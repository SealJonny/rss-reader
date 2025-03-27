/**
 *  Represents a rss feed in the database
 *
 */
export interface RssFeed {
  id?: number;
  title: string;
  link: string;
  description: string;

  /**
   * Language of the rss feed following the ISO 639-1 standard
   */
  language: string | null;

  /**
   * The time where the feed has last been refreshed in milliseconds
   */
  lastBuildDate: number | null;
}

/**
 * Interface representing an RSS feed source
 */
export interface RssFeed {
  /** Database ID of the feed (undefined for new feeds) */
  id?: number;
  /** Title of the RSS feed */
  title: string;
  /** URL link to the RSS feed XML */
  link: string;
  /** Description of the feed content */
  description: string;

  /**
   * Language of the RSS feed following the ISO 639-1 standard
   */
  language: string | null;

  /**
   * The timestamp when the feed was last refreshed (milliseconds)
   */
  lastBuildDate: number | null;
}

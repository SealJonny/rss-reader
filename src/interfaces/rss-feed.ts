export interface RssFeed {
  id?: number;
  title: string;
  link: string;
  description: string;
  language: string | null;
  lastBuildDate: number | null;
}
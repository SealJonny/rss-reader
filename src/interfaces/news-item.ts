export interface NewsItem {
  id?: number;
  title: string;
  link: string;
  description: string;
  creationDate: number;
  hash: string;
  isFavorite: boolean;
  isProcessed: boolean,
  source: string | null;
  pubDate: number | null;
  rssFeedId: number;
}

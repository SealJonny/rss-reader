export interface NewsItem {
    id?: number;
    title: string;
    link: string;
    description: string;
    creationDate: number;
    hash: string;
    isFavorite: boolean;
    source: string | null;
    pubDate: string | null;
    rssFeedId: number;
}
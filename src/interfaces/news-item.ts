export interface NewsItem {
    id?: number;
    title: string;
    link: string;
    pubDate: string;
    description: string;
    isFavorite: boolean;
    hash?: string;
    rssFeedId: number;
}
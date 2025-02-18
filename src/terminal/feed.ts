import { NewsItem } from "../interfaces/news-item";
import { fetchRss } from "../xml/rss";
import { userInput, UserAction } from "../terminal-input/user-input";

function showNewsItem(item: NewsItem, index: number) {
    console.clear();
    console.log(`${index}.`);
    console.log("📰", item.title);
    console.log("📅", item.pubDate);
    console.log("📖", item.description);
    console.log("🔗", item.link);
    console.log("\nFavorize (f), Next (down), Previous (up), Exit (Ctrl + C)");
}

export async function feed(id: number) {
    let news: NewsItem[] = [];
    try {
        news = await fetchRss("https://news.google.com/rss/search?q=Technologie&hl=de&gl=DE&ceid=DE:de");
        
        let i = 0;
        while (true) {
            showNewsItem(news[i], i);

            const action = await userInput();
            switch(action) {
                case UserAction.FAVORIZE:
                    break;
                case UserAction.NEXT:
                    i = (i + 1) % news.length; 
                    break;
                case UserAction.PREVIOUS:
                    i = i - 2 >= 0 ? i - 2 : news.length - 1;
                    break;
                case UserAction.EXIT:
                    process.exit();
            }
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Nachrichten:", error);
    }
}

// feed(1);

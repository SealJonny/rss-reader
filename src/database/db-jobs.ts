import { fetchRss } from "../xml/rss";
import db from "./database";
import { categoriseNewsItems } from "../ai/categorise-newsitem";
import { CategoryNewsRelationship } from "./tables/news-categories";

export class DbJobs {
  private abortController: AbortController;

  constructor() {
    this.abortController = new AbortController();
  }

  cancel() {
    this.abortController.abort();
  }

  /**
   * Fetches all news from RSS feeds (saved in the database) and inserts them into the database
   *
   * @throws {EntityMultiCreateError} If inserting into database fails
   */
  async insertAllNews() {
    const feeds = await db.rssFeeds.all();
    const result = await Promise.all(feeds.map(async f => {
      const news = await fetchRss(f);
      return news;
    }));
    const allNews = result.flat();
    await db.news.addAll(allNews);
  }

  async categoriesAllNews() {
    const splitSize = 25;
    try {
      let news = await db.news.all({isProcessed: false});
      if (news.length === 0) {
        return;
      }

      let splittedNews = this.splitArray(news, splitSize);
      let categories = await db.categories.all();

      if (categories.length === 0) return;

      let catNames = categories.map(c => c.name);

      let gptResults = (await Promise.allSettled(splittedNews.map(async (newsList) => {
        return await categoriseNewsItems(newsList, catNames, splitSize)
      }))).map(r => {
        if (r.status === "rejected") {
          return undefined;
        }
        return r.value;
      });

      for(let i = 0; i < splittedNews.length; i++) {
        if (this.abortController.signal.aborted) {
          return;
        }
        try {
          let newsList = splittedNews[i];
          if (!gptResults[i]) {
            //Todo: Error Handling
            continue;
          }
          let gptResult = gptResults[i] ?? {};

          // Save the relation between the categories and news in db
          const relationships = newsList.flatMap((n, index) => {
            const result = gptResult[index + 1] || [];
            if (result.length === 0) {
              return [];
            }
            // Get ids for the categories returned by gpt
            let categoryIds = categories.filter(c => result.includes(c.name)).map(c => c.id!);

            return categoryIds.map(c => ({newsId: n.id!, categoryId: c}));
          });

          await db.join.addCategoryToNews(...relationships);
          const newsIds = newsList.map(n => n.id!);
          await db.news.setProcessedBatch(newsIds, true);

        } catch(error) {
          continue;
        }
      }
    } catch (error) {

    }
  }

  private splitArray<T>(array: T[], size: number = 25): T[][] {
    if (array.length <= size) {
      return [array];
    }
    const result: T[][] = [];
    const splitted = array.slice(0, size);
    result.push(splitted);
    result.push(...this.splitArray(array.slice(size), size));
    return result;
  }
}

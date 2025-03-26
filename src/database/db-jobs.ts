import db from "./database";
import { categoriseNewsItems } from "../ai/categorise-newsitem";
import { NewsItem } from "../interfaces/news-item";
import { Category } from "../interfaces/category";
import { fetchRss } from "../rss/fetcher";

type Job = NewsItem[][];

export type ErrorFeed = {
  feedId: number;
  errorMsg: string
}

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
  async insertAllNews(): Promise<ErrorFeed[] | null> {
    const feeds = await db.rssFeeds.all();
    const result = await Promise.allSettled(feeds.map(fetchRss));
    const errorFeeds: ErrorFeed[] = []

    result.forEach((r, i) => {
      if (r.status === "rejected") {
        const feedId = feeds[i].id!;
        errorFeeds.push({feedId: feedId, errorMsg: r.reason});
      }
    });

    const news = result
      .filter(r => r.status === "fulfilled")
      .map(r => r.value)
      .flat();
    await db.news.addAll(news);

    if (errorFeeds.length === 0) return null;
    return errorFeeds;
  }

  /**
   * Fetches all NewsItems from db which are not processed yet and splitts them into jobs.
   * Each jobs contains a maximum of 8 * size NewsItems
   *
   *
   * @param size Size of NewsItems arrays send to GPT in one request
   * @returns An array of Jobs each containing an array of arrays of NewsItems
  */
  private async fetchAndSplitNews(size: number): Promise<Job[]> {
    let news: NewsItem[] = [];
    try {
      news = await db.news.all({isProcessed: false});
      if (news.length === 0) {
        return [];
      }
    } catch (error) {
      // ToDo: Error Handling
      throw error;
    }

    function splitArray<T>(array: T[], size: number = 25): T[][] {
      const result: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    }

    const splittedNews = splitArray(news, size);
    return splitArray(splittedNews, 8);
  }

  private async executeCategoriseJob(job: Job, categories: Category[], size: number): Promise<void> {
    // Asynchronously fetch GPT results for all news within the job
    const gptResults = (await Promise.allSettled(
      job.map(newsList => categoriseNewsItems(newsList, categories.map(c => c.name), size))
    )).map(r => r.status === "fulfilled" ? r.value : undefined);

    // Batch-process mapping of all relationships and mark each news item as processed
    for(let i = 0; i < job.length; i++) {
      if (this.abortController.signal.aborted) {
        return;
      }

      try {
        const newsList = job[i];
        if (!gptResults[i]) {
          //Todo: Error Handling
          continue;
        }

        const gptResult = gptResults[i] ?? {};

        // Build the relationships
        const relationships = newsList.flatMap((n, index) => {
          const result = gptResult[index + 1] || [];
          if (result.length === 0) {
            return [];
          }
          // Get ids for the categories returned by gpt
          let categoryIds = categories.filter(c => result.includes(c.name)).map(c => c.id!);

          return categoryIds.map(c => ({newsId: n.id!, categoryId: c}));
        });

        // Save relationships in db and set news to processed
        await db.join.addCategoryToNews(...relationships);
        const newsIds = newsList.map(n => n.id!);
        await db.news.setProcessedBatch(newsIds, true);

      } catch(error) {
        // ToDo: Error Handling
        continue;
      }
    }
  }

  async categoriseAllNews() {
    const batchSize = 25;
    const jobs = await this.fetchAndSplitNews(batchSize);
    const categories = await db.categories.all();

    if (categories.length === 0) return;

    for (let job of jobs) {
      await this.executeCategoriseJob(job, categories, batchSize);
    }
  }
}

import { categoriseNewsItems } from "../../ai/categorise-newsitem";
import { AbortError, JobAlreadyRunning } from "../../errors/general";
import { Category } from "../../interfaces/category";
import { NewsItem } from "../../interfaces/news-item";
import db from "../database";
import { DbJob } from "../db-jobs";

type Job = NewsItem[][];

/**
 * Job for categorizing news items using AI
 */
export class CategoriseJob extends DbJob<void> {
  constructor() {
    super();
  }

  /**
   * Execute the categorization job on all unprocessed news items
   * @returns A Promise that resolves when the job is complete
   * @throws {JobAlreadyRunning} If the job is already running
   * @throws {AbortError} If the job is aborted during execution
   */
  public override async execute(): Promise<void> {
    if (this.isRunning) {
      throw new JobAlreadyRunning("This job is already running");
    }
    this.isRunning = true;

    const batchSize = 25;
    let jobs: Job[];
    let categories: Category[];

    if (this.abortController.signal.aborted) {
      throw new AbortError("Abort categorising all NewsItems");
    }

    try {
      jobs = await this.fetchAndSplitNews(batchSize);
      categories = await db.categories.all();
    } catch (error) {
      this.isRunning = false;
      this.sendStatusError();
      throw error;
    }

    if (categories.length === 0) {
      this.isRunning = false;
      this.sendStatusComplete();
      return;
    }

    for (let job of jobs) {
      if (this.abortController.signal.aborted) {
        throw new AbortError("Abort categorising all NewsItems");
      }

      try {
        await this.executeCategoriseJob(job, categories, batchSize);
      } catch (error) {
        this.isRunning = false;
        this.sendStatusError();
        throw error;
      }
    }

    this.isRunning = false;
    this.sendStatusComplete();
  }

  /**
   * Fetches all unprocessed NewsItems from database and splits them into jobs.
   * Each job contains a maximum of 8 * size NewsItems.
   *
   * @param size Maximum size of NewsItems arrays sent to GPT in one request
   * @returns An array of Jobs, each containing an array of NewsItem arrays
   */
  private async fetchAndSplitNews(size: number): Promise<Job[]> {
    let news: NewsItem[] = [];
    try {
      news = await db.news.all({isProcessed: false});
      if (news.length === 0) {
        return [];
      }
    } catch (error) {
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

  /**
   * Execute a single categorization job
   * @param job Job to be executed
   * @param categories Available categories
   * @param size Batch size of a GPT request
   * @throws {AbortError} If cancellation was requested
   */
  private async executeCategoriseJob(job: Job, categories: Category[], size: number): Promise<void> {
    // Asynchronously fetch GPT results for all news within the job
    const gptResults = (await Promise.allSettled(
      job.map(newsList => categoriseNewsItems(newsList, categories, size, this.abortController.signal))
    )).map(r => r.status === "fulfilled" ? r.value : undefined);

    if (this.abortController.signal.aborted) {
      throw new AbortError("Abort executing categorise job");
    }

    // Batch-process mapping of all relationships and mark each news item as processed
    for(let i = 0; i < job.length; i++) {
      if (this.abortController.signal.aborted) {
        throw new AbortError("Abort executing categorise job");
      }

      try {
        const newsList = job[i];
        if (!gptResults[i]) {
          continue;
        }

        const gptResult = gptResults[i] ?? {};

        // Build the relationships
        const relationships = newsList.flatMap((n, index) => {
          const result = gptResult[index + 1] || [];
          if (result.length === 0) {
            return [];
          }
          // Get ids for the categories returned by GPT
          let categoryIds = categories.filter(c => result.includes(c.name)).map(c => c.id!);

          return categoryIds.map(c => ({newsId: n.id!, categoryId: c}));
        });

        if (this.abortController.signal.aborted) {
          throw new AbortError("Abort executing categorise job");
        }

        // Save relationships in database and set news to processed
        await db.join.addCategoryToNews(...relationships);
        const newsIds = newsList.map(n => n.id!);
        await db.news.setProcessedBatch(newsIds, true);

      } catch(error) {
        continue;
      }
    }
  }
}


const categoriseJob = new CategoriseJob();
export default categoriseJob;

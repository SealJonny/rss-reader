import { categoriseNewsItems } from "../../ai/categorise-newsitem";
import { AbortError, JobAlreadyRunning } from "../../errors/general";
import { Category } from "../../interfaces/category";
import { NewsItem } from "../../interfaces/news-item";
import db from "../database";
import { DbJob } from "../db-jobs";

type Job = NewsItem[][];

export class CategoriseJob extends DbJob<void> {
  constructor() {
    super();
  }

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

    if (categories.length === 0) return;

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
   * Fetches all NewsItems from db which are not processed yet and splitts them into jobs.
   * Each jobs contains a maximum of 8 * size NewsItems
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

  /**
   * Execute a single categorise job
   * @param job Job to be exectuted
   * @param categories Available categories
   * @param size Batch size of a gpt request
   * @throws {AbortError} If cancellation was requested
  */
  private async executeCategoriseJob(job: Job, categories: Category[], size: number): Promise<void> {
    // Asynchronously fetch GPT results for all news within the job
    const gptResults = (await Promise.allSettled(
      job.map(newsList => categoriseNewsItems(newsList, categories.map(c => c.name), size, this.abortController.signal))
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

        if (this.abortController.signal.aborted) {
          throw new AbortError("Abort executing categorise job");
        }

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
}


const categoriseJob = new CategoriseJob();
export default categoriseJob;

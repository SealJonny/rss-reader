import { EntityUpdateError } from "../../errors/database";
import { AbortError, JobAlreadyRunning } from "../../errors/general";
import { RssFeed } from "../../interfaces/rss-feed";
import { fetchRss } from "../../rss/fetcher";
import db from "../database";
import { DbJob } from "../db-jobs";

/**
 * Type representing a feed that failed to be processed
 */
export type ErrorFeed = {
  feedId: number;
  errorMsg: string
}

/**
 * Job for inserting and updating RSS feeds and news items
 */
export class InsertJob extends DbJob<ErrorFeed[] | null> {
  constructor() {
    super();
  }

  /**
   * Execute the job to fetch all RSS feeds and insert their news items
   * @returns A promise that resolves to array of error feeds or null if all succeeded
   * @throws {JobAlreadyRunning} If the job is already running
   * @throws {AbortError} If the job is aborted during execution
   */
  public override async execute(): Promise<ErrorFeed[] | null> {
    if (this.isRunning) {
      throw new JobAlreadyRunning("This job is already running");
    }
    this.isRunning = true;

    let feeds: RssFeed[];
    try {
      feeds = await db.rssFeeds.all();
    } catch (error) {
      this.isRunning = false;
      this.sendStatusError();
      throw error;
    }

    if (feeds.length === 0) {
      this.isRunning = false;
      this.sendStatusComplete();
      return null;
    }

    // Fetch RSS feeds in parallel
    const result = await Promise.allSettled(feeds.map(async f => fetchRss(f, this.abortController.signal)));
    const errorFeeds: ErrorFeed[] = [];

    if (this.abortController.signal.aborted) {
      this.sendStatusComplete();
      throw new AbortError("Abort inserting all NewsItems");
    }

    // Collect errors
    result.forEach((r, i) => {
      if (r.status === "rejected") {
        const feedId = feeds[i].id!;
        errorFeeds.push({feedId: feedId, errorMsg: String(r.reason)});
      }
    });

    // Filter out feeds with errors
    feeds = feeds.filter(f => !errorFeeds.find(e => e.feedId === f.id));

    try {
      // Update all successful feeds
      for (let f of feeds) {
        await db.rssFeeds.save(f);
      }
    } catch (error) {
      this.isRunning = false;
      this.sendStatusError();
      throw error;
    }

    // Extract all successfully fetched news items
    const news = result
      .filter(r => r.status === "fulfilled")
      .map(r => r.value)
      .flat();

    try {
      // Add all news items to database
      await db.news.addAll(news);
    } catch (error) {
      this.isRunning = false;
      this.sendStatusError();
      throw error;
    }

    if (errorFeeds.length === 0) {
      this.sendStatusComplete();
      this.isRunning = false;
      return null;
    }

    this.sendStatusError();
    this.isRunning = false;
    return errorFeeds;
  }
}

const insertJob = new InsertJob();
export default insertJob;

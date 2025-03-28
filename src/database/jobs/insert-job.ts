import { AbortError, JobAlreadyRunning } from "../../errors/general";
import { RssFeed } from "../../interfaces/rss-feed";
import { fetchRss } from "../../rss/fetcher";
import db from "../database";
import { DbJob } from "../db-jobs";

export type ErrorFeed = {
  feedId: number;
  errorMsg: string
}

export class InsertJob extends DbJob<ErrorFeed[] | null> {
  constructor() {
    super();
  }

  public override async execute(): Promise<ErrorFeed[] | null> {
    if (this.isRunning) {
      throw new JobAlreadyRunning("This job is already running");
    }
    this.isRunning = true;

    let feeds: RssFeed[];
    try {
      feeds = await db.rssFeeds.all();
    } catch (error) {
      this.isRunning = false
      this.sendStatusError();
      throw error;
    }

    const result = await Promise.allSettled(feeds.map(async f => fetchRss(f, this.abortController.signal)));
    const errorFeeds: ErrorFeed[] = []

    if (this.abortController.signal.aborted) {
      this.sendStatusComplete();
      throw new AbortError("Abort inserting all NewsItems");
    }

    result.forEach((r, i) => {
      if (r.status === "rejected") {
        const feedId = feeds[i].id!;
        errorFeeds.push({feedId: feedId, errorMsg: String(r.reason)});
      }
    });

    const news = result
      .filter(r => r.status === "fulfilled")
      .map(r => r.value)
      .flat();

    try {
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

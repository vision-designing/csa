// src/loaders/contentful/index.ts

import { type Loader } from "astro/loaders";
import { documentToHtmlString } from "~/utils/contentful-rich-renderer";
import {
  ArticleApiResponseSchema,
  ArticleLoaderSchema,
  EventApiResponseSchema,
  DownloadLoaderSchema,
  DownloadApiResponseSchema,
  JobApiResponseSchema,
  JobLoaderSchema,
  EventLoaderSchema,
} from "~/loaders/contentful/schemas";
import { fetchAllContent } from "~/loaders/contentful/utils";

export function contentfulArticleLoader(): Loader {
  return {
    name: "contentful-article-loader",
    async load({ logger, store, parseData, generateDigest }) {
      logger.info("Loading article data from Contentful...");
      const articles = await fetchAllContent(
        "article",
        ArticleApiResponseSchema,
      );
      for (const article of articles) {
        if (!article.slug) {
          logger.warn(`Skipping article with missing slug: ${JSON.stringify(article)}`);
          continue; // Skip entries without slug
        }
        const parsedData = await parseData({
          id: article.slug,
          data: article,
        });
        store.set({
          id: article.slug,
          data: parsedData,
          digest: generateDigest(parsedData),
          rendered: {
            html: documentToHtmlString(article.content),
          },
        });
      }
    },
    schema: ArticleLoaderSchema,
  };
}

export function contentfulJobLoader(): Loader {
  return {
    name: "contentful-job-loader",
    async load({ logger, store, parseData, generateDigest }) {
      logger.info("Loading job data from Contentful...");
      const jobs = await fetchAllContent("job", JobApiResponseSchema);
      for (const job of jobs) {
        if (!job.slug) {
          logger.warn(`Skipping job with missing slug: ${JSON.stringify(job)}`);
          continue; // Skip entries without slug
        }
        const parsedData = await parseData({
          id: job.slug,
          data: job,
        });
        store.set({
          id: job.slug,
          data: parsedData,
          digest: generateDigest(parsedData),
          rendered: {
            html: documentToHtmlString(job.content),
          },
        });
      }
    },
    schema: JobLoaderSchema,
  };
}

export function contentfulDownloadLoader(): Loader {
  return {
    name: "contentful-download-loader",
    async load({ logger, store, parseData, generateDigest }) {
      logger.info("Loading download data from Contentful...");
      const downloads = await fetchAllContent(
        "download",
        DownloadApiResponseSchema,
      );
      for (const download of downloads) {
        if (!download.slug) {
          logger.warn(`Skipping download with missing slug: ${JSON.stringify(download)}`);
          continue; // Skip entries without slug
        }
        const parsedData = await parseData({
          id: download.slug,
          data: download,
        });
        store.set({
          id: download.slug,
          data: parsedData,
          digest: generateDigest(parsedData),
          rendered: {
            html: documentToHtmlString(download.content),
          },
        });
      }
    },
    schema: DownloadLoaderSchema,
  };
}

export function contentfulEventLoader(): Loader {
  return {
    name: "contentful-event-loader",
    async load({ logger, store, parseData, generateDigest }) {
      logger.info("Loading event data from Contentful...");
      // clear store
      store.clear();
      const events = await fetchAllContent("event", EventApiResponseSchema);
      for (const event of events) {
        if (!event.slug) {
          logger.warn(`Skipping event with missing slug: ${JSON.stringify(event)}`);
          continue; // Skip entries without slug
        }
        const parsedData = await parseData({
          id: event.slug,
          data: event,
        });
        store.set({
          id: event.slug,
          data: parsedData,
          digest: generateDigest(parsedData),
          rendered: {
            html: documentToHtmlString(event.content),
          },
        });
      }
    },
    schema: EventLoaderSchema,
  };
}

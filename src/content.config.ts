import { defineCollection } from "astro:content";
import {
  contentfulArticleLoader,
  contentfulDownloadLoader,
  contentfulJobLoader,
  contentfulEventLoader,
} from "./loaders/contentful";
import { DownloadLoaderSchema } from "./loaders/contentful/schemas";

const downloads = defineCollection({
  type: "content",
  schema: DownloadLoaderSchema,
  loader: contentfulDownloadLoader(),
});

const jobs = defineCollection({
  loader: contentfulJobLoader(),
});

const articles = defineCollection({
  loader: contentfulArticleLoader(),
});

const events = defineCollection({
  loader: contentfulEventLoader(),
});

export const collections = { jobs, articles, downloads, events };

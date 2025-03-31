import { defineCollection } from "astro:content";
import {
  contentfulArticleLoader,
  contentfulDownloadLoader,
  contentfulJobLoader,
  contentfulEventLoader,
} from "./loaders/contentful";

const downloads = defineCollection({
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

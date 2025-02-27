import { defineCollection, z } from "astro:content";
import { tickettailorLoader } from "~/loaders/tickettailor";
import {
  contentfulArticleLoader,
  contentfulDownloadLoader,
  contentfulJobLoader,
} from "./loaders/contentful";

const downloads = defineCollection({
  loader: contentfulDownloadLoader(),
});

const jobs = defineCollection({
  loader: contentfulJobLoader(),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    level: z.string(),
    type: z.string(),
    department: z.string(),
  }),
});

const articles = defineCollection({
  loader: contentfulArticleLoader(),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    slug: z.string(),
    heroImage: z.object({
      alt: z.string(),
      src: z.string(),
    }),
    author: z.object({
      name: z.string(),
    }),
  }),
});

const events = defineCollection({
  loader: tickettailorLoader({
    token: import.meta.env.TICKETTAILOR_API_KEY,
  }),
});

export const collections = { jobs, events, articles, downloads };

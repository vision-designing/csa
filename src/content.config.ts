import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { tickettailorLoader } from "~/loaders/tickettailor";

const articles = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/articles",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      description: z.string(),
      image: z.object({
        src: z.preprocess((path) => `~/assets/${path}`, image()),
        alt: z.string(),
      }),
    }),
});

const jobs = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/jobs",
  }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    level: z.string(),
    type: z.string(),
    department: z.string(),
  }),
});

const events = defineCollection({
  loader: tickettailorLoader({
    token: import.meta.env.TICKETTAILOR_API_KEY,
  }),
});

export const collections = { articles, jobs, events };

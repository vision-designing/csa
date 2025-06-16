// src/content/config.ts
import { defineCollection, z } from "astro:content";

const articlesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    pubDate: z.coerce.date(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export default {
  articles: articlesCollection,
};

export const bookingLink =
  "https://outlook.office365.com/book/GetYourQuestionsAnswered@criticalsa.com/";

export const defaultMeta = {
  title: "Critical Systems Analysis | Functional Safety Consulting & Systems Engineering Experts",
  description:
    "Expert functional safety engineers providing comprehensive safety compliance solutions, FMEA and FTA support, and systems engineering consulting for safety critical systems and autonomous vehicles.",
  og: {
    url: "/og.webp",
    alt: "A robot with some gears",
  },
};

import { type Loader } from "astro/loaders";
import { createClient } from "contentful";
import { documentToHtmlString } from "~/utils/contentful-rich-renderer";
import { z } from "astro/zod";

const articleContentfulSchema = z
  .object({
    fields: z.object({
      title: z.string(),
      description: z.string(),
      slug: z.string(),
      date: z.coerce.date(),
      content: z.object({
        nodeType: z.literal("document"),
        data: z.object({}).passthrough(),
        content: z.array(z.any()),
      }),
      heroImage: z.object({
        fields: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          file: z.object({
            url: z.preprocess((val) => `https:${val}`, z.string().url()),
          }),
        }),
      }),
      author: z.object({
        fields: z.object({
          name: z.string(),
        }),
      }),
    }),
  })
  .transform((data) => {
    return {
      title: data.fields.title,
      description: data.fields.description,
      slug: data.fields.slug,
      date: data.fields.date,
      heroImage: {
        alt:
          data.fields.heroImage.fields.title ||
          data.fields.heroImage.fields.description ||
          "Image of the article",
        src: data.fields.heroImage.fields.file.url,
      },
      author: {
        name: data.fields.author.fields.name,
      },
      content: data.fields.content,
    };
  });

const jobContentfulSchema = z
  .object({
    fields: z.object({
      title: z.string(),
      description: z.string(),
      slug: z.string(),
      location: z.string(),
      level: z.string(),
      type: z.string(),
      department: z.string(),
      content: z.object({
        nodeType: z.literal("document"),
        data: z.object({}).passthrough(),
        content: z.array(z.any()),
      }),
    }),
  })
  .transform((data) => {
    return {
      ...data.fields,
    };
  });

export function contentfulArticleLoader(): Loader {
  return {
    name: "contentful-article-loader",
    async load({ logger, store, parseData }) {
      logger.info("Loading article data from contentful...");
      const client = createClient({
        space: import.meta.env.CONTENTFUL_SPACE_ID,
        accessToken: import.meta.env.DEV
          ? import.meta.env.CONTENTFUL_PREVIEW_TOKEN
          : import.meta.env.CONTENTFUL_DELIVERY_TOKEN,
        host: import.meta.env.DEV
          ? "preview.contentful.com"
          : "cdn.contentful.com",
      });
      const articles = await client.getEntries({
        content_type: "article",
        limit: 1000,
      });

      for (const article of articles.items) {
        const parsedArticle = articleContentfulSchema.safeParse(article);

        if (!parsedArticle.success) {
          console.log(parsedArticle.error);
          throw new Error("Failed to parse article API response");
        }

        const { data } = parsedArticle;
        const parsedData = await parseData({
          id: data.slug,
          data,
        });
        store.set({
          id: data.slug,
          data: parsedData,
          rendered: {
            html: documentToHtmlString(data.content),
          },
        });
      }
    },
  };
}

export function contentfulJobLoader(): Loader {
  return {
    name: "contentful-job-loader",
    async load({ logger, store, parseData }) {
      logger.info("Loading job data from contentful...");
      const client = createClient({
        space: import.meta.env.CONTENTFUL_SPACE_ID,
        accessToken: import.meta.env.DEV
          ? import.meta.env.CONTENTFUL_PREVIEW_TOKEN
          : import.meta.env.CONTENTFUL_DELIVERY_TOKEN,
        host: import.meta.env.DEV
          ? "preview.contentful.com"
          : "cdn.contentful.com",
      });
      const jobs = await client.getEntries({
        content_type: "job",
        limit: 1000,
      });

      for (const job of jobs.items) {
        const parsedJob = jobContentfulSchema.safeParse(job);

        if (!parsedJob.success) {
          throw new Error("Failed to parse job API response");
        }

        const { data } = parsedJob;
        const parsedData = await parseData({
          id: data.slug,
          data,
        });
        store.set({
          id: data.slug,
          data: parsedData,
          rendered: {
            html: documentToHtmlString(data.content),
          },
        });
      }
    },
  };
}

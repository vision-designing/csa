import { z } from "astro/zod";

export const ArticleLoaderSchema = z.object({
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
});

export const DownloadLoaderSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  date: z.coerce.date(),
  pdf: z.string().url(),
  heroImage: z.object({
    alt: z.string(),
    src: z.string(),
  }),
});

export const JobLoaderSchema = z.object({
  title: z.string(),
  location: z.string(),
  level: z.string(),
  type: z.string(),
  slug: z.string(),
  department: z.string(),
});

export const EventLoaderSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  paidEvent: z.boolean(),
  industryEvent: z.boolean(),
  ticketTailorUrl: z.string().url().optional(),
  status: z.enum(["Available", "Sold out"]),
});

export const ArticleApiResponseSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  items: z.array(
    z
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
      }),
  ),
});

export const JobApiResponseSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  items: z.array(
    z
      .object({
        fields: JobLoaderSchema.extend({
          content: z.object({
            nodeType: z.literal("document"),
            data: z.object({}).passthrough(),
            content: z.array(z.any()),
          }),
        }),
      })
      .transform((data) => data.fields),
  ),
});

export const DownloadApiResponseSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  items: z.array(
    z
      .object({
        fields: z.object({
          title: z.string(),
          description: z.string(),
          slug: z.string(),
          date: z.coerce.date(),
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
          content: z.object({
            nodeType: z.literal("document"),
            data: z.object({}).passthrough(),
            content: z.array(z.any()),
          }),
          pdf: z.object({
            fields: z.object({
              title: z.string().optional(),
              description: z.string().optional(),
              file: z.object({
                url: z.preprocess((val) => `https:${val}`, z.string().url()),
              }),
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
          pdf: data.fields.pdf.fields.file.url,
        };
      }),
  ),
});

export const EventApiResponseSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  items: z.array(
    z
      .object({
        fields: EventLoaderSchema.extend({
          content: z.object({
            nodeType: z.literal("document"),
            data: z.object({}).passthrough(),
            content: z.array(z.any()),
          }),
        }),
      })
      .transform((data) => data.fields),
  ),
});

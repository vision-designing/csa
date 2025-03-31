import { createClient } from "contentful";
import { z } from "astro/zod";

const client = createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.DEV
    ? import.meta.env.CONTENTFUL_PREVIEW_TOKEN
    : import.meta.env.CONTENTFUL_DELIVERY_TOKEN,
  host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
});

async function fetchPaginatedContent<T extends z.ZodType>(
  contentType: string,
  schema: T,
  skip: number,
  limit: number,
): Promise<z.output<T>> {
  let entries;
  try {
    entries = await client.getEntries({
      content_type: contentType,
      limit,
      skip,
    });
  } catch (error) {
    throw new Error(`Failed to fetch ${contentType} from Contentful`, {
      cause: error,
    });
  }

  const parsedResponse = schema.safeParse(entries);

  if (!parsedResponse.success) {
    throw new Error(
      `Failed to parse ${contentType} response from Contentful.\n${parsedResponse.error.issues
        .map((issue) => issue.message)
        .join("\n")}`,
    );
  }

  return parsedResponse.data;
}

export async function fetchAllContent<T extends z.ZodType>(
  contentType: string,
  schema: T,
): Promise<z.output<T>["items"]> {
  let limit = 1000;
  let skip = 0;
  let total = 0;
  let entries = [];

  do {
    const data = await fetchPaginatedContent(contentType, schema, skip, limit);
    total = data.total;
    skip += limit;
    entries.push(...data.items);
  } while (skip < total);

  return entries;
}

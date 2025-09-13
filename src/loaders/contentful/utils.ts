// src/loaders/contentful/utils.ts
import { createClient } from "contentful";
import { z } from "astro/zod";

export const client = createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.DEV
    ? import.meta.env.CONTENTFUL_PREVIEW_TOKEN
    : import.meta.env.CONTENTFUL_DELIVERY_TOKEN,
  host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
});

/**
 * Fetch a single page of content from Contentful and validate it.
 * Throws detailed errors on fetch or validation failure.
 */
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
    throw new Error(
      `Failed to fetch ${contentType} from Contentful: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
  //for testing
  // if (contentType === "job" || contentType === "download") {
  //   console.log(`Fetched ${entries.items.length} entries for ${contentType}`);
  //   // Uncomment to log raw entries for debugging
  //   console.log("Raw entries:", JSON.stringify(entries.items, null, 2));
  // }

  // Validate the full API response (including pagination and items)
  const parsedResponse = schema.safeParse(entries);

  if (!parsedResponse.success) {
    console.error(
      `Validation errors for ${contentType} at skip=${skip}, limit=${limit}:`,
      parsedResponse.error.issues
    );
    throw new Error(
      `Failed to parse ${contentType} response from Contentful.\n` +
        parsedResponse.error.issues
          .map((issue) => `- ${issue.path.join(".")} : ${issue.message}`)
          .join("\n")
    );
  }

  return parsedResponse.data;
}

/**
 * Fetch all entries for a content type, handling pagination.
 * Uses the API response schema to validate the full response and relies on
 * its transform to produce validated entries.
 */
export async function fetchAllContent<T extends z.ZodType>(
  contentType: string,
  schema: T
): Promise<z.output<T>["items"]> {
  const limit = 1000;
  let skip = 0;
  let total = 0;
  const entries: z.output<T>["items"] = [];

  do {
    const data = await fetchPaginatedContent(contentType, schema, skip, limit);
    total = data.total;
    skip += limit;

    entries.push(...data.items);
  } while (skip < total);

  return entries;
}

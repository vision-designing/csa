import { createClient } from "contentful";
import { z } from "astro/zod";

export const client = createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.DEV
    ? import.meta.env.CONTENTFUL_PREVIEW_TOKEN
    : import.meta.env.CONTENTFUL_DELIVERY_TOKEN,
  host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
});

// Define a base schema for Contentful response structure
const contentfulResponseSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  items: z.array(z.any()),
});

async function fetchPaginatedContent<T extends z.ZodType>(
  contentType: string,
  entrySchema: T,
  skip: number = 0,
  limit: number = 1000,
): Promise<{
  total: number;
  skip: number;
  limit: number;
  items: z.output<T>[];
}> {
  let response;
  try {
    response = await client.getEntries({
      content_type: contentType,
      limit,
      skip,
    });
  } catch (error) {
    console.error(`Failed to fetch ${contentType} from Contentful:`, error);
    throw error;
  }

  // First validate the basic Contentful response structure
  const validatedResponse = contentfulResponseSchema.safeParse(response);
  if (!validatedResponse.success) {
    throw new Error(
      `Invalid Contentful response structure for ${contentType}: ${validatedResponse.error.message}`
    );
  }

  // Then validate each entry individually
  const validatedItems = [];
  const validationErrors = [];

  for (const item of validatedResponse.data.items) {
    const parsedEntry = entrySchema.safeParse(item.fields);
    if (parsedEntry.success) {
      validatedItems.push(parsedEntry.data);
    } else {
      validationErrors.push({
        entryId: item.sys?.id,
        errors: parsedEntry.error.issues,
      });
      console.warn(
        `Validation failed for ${contentType} entry ${item.sys?.id}:`,
        parsedEntry.error.issues
      );
    }
  }

  if (validationErrors.length > 0) {
    console.warn(
      `${validationErrors.length} ${contentType} entries failed validation`
    );
  }

  return {
    ...validatedResponse.data,
    items: validatedItems,
  };
}

export async function fetchAllContent<T extends z.ZodType>(
  contentType: string,
  entrySchema: T,
): Promise<z.output<T>[]> {
  let limit = 1000;
  let skip = 0;
  let total = 0;
  let allItems: z.output<T>[] = [];

  do {
    const { items, total: responseTotal } = await fetchPaginatedContent(
      contentType,
      entrySchema,
      skip,
      limit
    );
    total = responseTotal;
    skip += limit;
    allItems.push(...items);
  } while (skip < total && allItems.length < total);

  return allItems;
}
import type { AstroIntegrationLogger } from "astro";
import { AstroError } from "astro/errors";
import type { Loader } from "astro/loaders";
import { z } from "astro/zod";

const userConfigSchema = z.object({
  token: z.string(),
});

const eventSeriesSchema = z.object({
  id: z.string(),
  access_code: z.string().nullable(),
  description: z.string(),
  name: z.string(),
  default_ticket_types: z.array(
    z.object({
      object: z.string(),
      id: z.string(),
      name: z.string(),
      price: z.number(),
      status: z.enum([
        "on_sale",
        "sold_out",
        "unavailable",
        "hidden",
        "admin_only",
        "locked",
      ]),
    }),
  ),
  next_occurrence_date: z.object({
    iso: z.coerce.date(),
  }),
  online_event: z.coerce.boolean(),
  status: z.enum(["draft", "published"]),
  timezone: z.string(),
  url: z.string().url(),
});

const eventSchema = z.object({
  title: z.string(),
  date: z.date(),
  url: z.string().url(),
  isFree: z.boolean(),
});

const ticketTailorResponseSchema = z.object({
  data: z.array(eventSeriesSchema),
  links: z.object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
  }),
});

type ticketTailorApiResponse = z.output<typeof ticketTailorResponseSchema>;

type UserConfig = z.input<typeof userConfigSchema>;
type LoaderConfig = z.output<typeof userConfigSchema>;

interface FetchPaginatedEventsOptions {
  config: LoaderConfig;
  logger: AstroIntegrationLogger;
}

async function fetchPaginatedEvents(
  { config }: FetchPaginatedEventsOptions,
  nextCursor: string | null,
): Promise<ticketTailorApiResponse> {
  const baseUrl = "https://api.tickettailor.com";
  const basePath = `/v1${nextCursor || "/event_series"}`;
  const urlEndpoint = new URL(basePath, baseUrl);
  urlEndpoint.searchParams.set("status", "published");

  // For development, include draft events
  if (import.meta.env.DEV)
    urlEndpoint.searchParams.set("status", ["published", "draft"].join(","));

  urlEndpoint.searchParams.set("limit", "100");
  const res = await fetch(urlEndpoint, {
    headers: {
      Accept: "application/json",
      Authorization:
        "Basic " + Buffer.from(config.token + ":").toString("base64"),
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data from TicketTailor API");
  }

  let json: unknown;

  try {
    json = await res.json();
  } catch (e) {
    throw new Error("Failed to parse response from TicketTailor API", {
      cause: e,
    });
  }

  const parsedData = ticketTailorResponseSchema.safeParse(json);

  if (!parsedData.success) {
    throw new Error(
      `Failed to parse response from TicketTailor API.\n${parsedData.error.issues
        .map((issue) => issue.message)
        .join("\n")}`,
    );
  }
  return parsedData.data;
}

async function fetchAllEvents(options: FetchPaginatedEventsOptions) {
  let allEvents = [];
  let nextCursor: string | null = null;

  do {
    const events = await fetchPaginatedEvents(options, nextCursor);
    const { data, links } = events;
    allEvents.push(...data);
    nextCursor = links.next;
  } while (nextCursor);

  return allEvents;
}

export function tickettailorLoader(userConfig: UserConfig): Loader {
  const parsedConfig = userConfigSchema.safeParse(userConfig);
  if (!parsedConfig.success) {
    throw new AstroError(
      `The provided loader configuration is invalid.\n${parsedConfig.error.issues
        .map((issue) => issue.message)
        .join("\n")}`,
      "See the error report above for more information.",
    );
  }

  const config = parsedConfig.data;

  return {
    name: "tickettailor-loader",
    schema: eventSchema,
    async load({ logger, parseData, store }) {
      logger.info("Loading events from TicketTailor API...");
      const events = await fetchAllEvents({ config, logger });
      for (const event of events) {
        const parsedEvent = await parseData({
          id: event.id,
          data: {
            title: event.name,
            date: event.next_occurrence_date.iso,
            url: event.url,
            isFree: event.default_ticket_types.some(
              (ticket) => ticket.price === 0,
            ),
          },
        });
        store.set({
          id: event.id,
          data: parsedEvent,
          rendered: { html: event.description },
        });
      }
    },
  };
}

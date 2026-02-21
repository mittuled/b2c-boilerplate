/**
 * Cursor-based pagination helper for Supabase Edge Functions.
 *
 * Cursors are base64-encoded item IDs. The client sends `cursor` and `limit`
 * query parameters; the server returns `nextCursor` and `hasMore` alongside
 * the result items.
 */

/** Paginated result envelope returned by `buildPaginatedResponse`. */
export type PaginatedResult<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

/** Parsed pagination parameters from the request URL. */
export interface PaginationParams {
  cursor: string | undefined;
  limit: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse `cursor` and `limit` query parameters from a URL.
 *
 * - `cursor` is a base64-encoded opaque ID. When present the server should
 *   return items *after* the referenced item.
 * - `limit` defaults to 20 and is clamped to [1, 100].
 */
export function parsePaginationParams(url: URL): PaginationParams {
  const rawCursor = url.searchParams.get("cursor");
  let cursor: string | undefined;

  if (rawCursor) {
    try {
      cursor = atob(rawCursor);
    } catch {
      // If the cursor is not valid base64, ignore it.
      cursor = undefined;
    }
  }

  const rawLimit = url.searchParams.get("limit");
  let limit = DEFAULT_LIMIT;

  if (rawLimit !== null) {
    const parsed = Number.parseInt(rawLimit, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, MAX_LIMIT);
    }
  }

  return { cursor, limit };
}

/**
 * Build a paginated response from a list of items.
 *
 * The caller should fetch `limit + 1` items from the data source so that
 * `hasMore` can be determined without an extra query. This function will
 * trim the extra item before returning.
 *
 * @param items   - The fetched rows (at most `limit + 1` items).
 * @param limit   - The requested page size.
 * @param getId   - Accessor that extracts a stable string ID from each item.
 * @returns A `PaginatedResult` with at most `limit` items, a `nextCursor`,
 *          and a `hasMore` flag.
 */
export function buildPaginatedResponse<T>(
  items: T[],
  limit: number,
  getId: (item: T) => string,
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;

  const lastItem = page[page.length - 1];
  const nextCursor = lastItem && hasMore ? btoa(getId(lastItem)) : null;

  return {
    items: page,
    nextCursor,
    hasMore,
  };
}
